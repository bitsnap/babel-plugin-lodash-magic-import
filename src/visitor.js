import _startsWith from 'lodash/fp/startsWith';
import _get from 'lodash/fp/get';
import _find from 'lodash/fp/find';
import _isString from 'lodash/fp/isString';
import _isEqual from 'lodash/fp/isEqual';
import _includes from 'lodash/fp/includes';
import _assignIn from 'lodash/fp/assignIn';
import _forEach from 'lodash/fp/forEach';
import _reduce from 'lodash/fp/reduce';
import _remove from 'lodash/fp/remove';
import _isEmpty from 'lodash/fp/isEmpty';
import _overSome from 'lodash/fp/overSome';
import _concat from 'lodash/fp/concat';

import functions from 'lodash-functions';

const _ = {
  startsWith: _startsWith,
  get: _get,
  find: _find,
  isEqual: _isEqual,
  isString: _isString,
  includes: _includes,
  assignIn: _assignIn,
  forEach: _forEach,
  reduce: _reduce,
  remove: _remove,
  isEmpty: _isEmpty,
  overSome: _overSome,
  concat: _concat,
};

const match = s => _.overSome([_.startsWith(`${s}/`), _.isEqual(s)]);
const matchLodash = match('lodash');
const matchLodashFp = match('lodash/fp');

/* eslint-disable no-param-reassign */
const removeLodashImports = lodashUsage => ({
  ImportDeclaration(path) {
    const moduleName = path.node.source.value;
    if (_.startsWith('lodash-es')(moduleName)) {
      throw path.buildCodeFrameError('lodash-magic-import plugin is completely useless with lodash-es');
    }

    const lodashFp = matchLodashFp(moduleName);
    const lodash = matchLodash(moduleName) && !lodashFp;

    lodashUsage[0] = lodashUsage[0] || lodash; // useLodash
    lodashUsage[1] = lodashUsage[1] || lodashFp; // useLodashFp

    if (lodashUsage[0] && lodashUsage[1]) {
      throw path.buildCodeFrameError('Mixing lodash and lodash/fp is prohibited');
    }

    if (lodash || lodashFp) {
      path.remove();
    }
  },
});

const forbidSeqMethods = (fnName, path) => {
  if (_.includes(fnName)(['chain', 'tap', 'thru'])) {
    throw path.buildCodeFrameError(`Using _.${fnName} method is prohibited`);
  }
};

const forbidSeqObjectWrapping = (path) => {
  const callExpression = path.findParent(p => p.isCallExpression());
  if (_.get('node.callee.name')(callExpression) === '_') {
    throw callExpression.buildCodeFrameError('Using Seq methods is prohibited');
  }
};

const withLodashFunction = (fnName, path, code) => {
  if (_.includes(fnName)(functions)) {
    code();
  } else {
    throw path.buildCodeFrameError(`Unknown lodash method _.${fnName}`);
  }
};

const replaceIdentifiers = (t, useMagicCache, usedFunctions) => ({
  Identifier(path) {
    if (_.get('node.name')(path) === '_') {
      const memberExpression = path.findParent(p => p.isMemberExpression());
      const fnName = _.get('node.property.name')(memberExpression);
      if (fnName) {
        forbidSeqMethods(fnName, path);

        withLodashFunction(fnName, memberExpression, () => {
          if (!useMagicCache) {
            memberExpression.replaceWith(t.identifier(`_${fnName}`));
          }

          if (!_.includes(fnName)(usedFunctions)) {
            usedFunctions.push(fnName);
          }
        });
      }

      forbidSeqObjectWrapping(path);
    }
  },

  VariableDeclaration(path) {
    const nonLodashDeclarations = _.remove(d => d.id.name === '_')(path.node.declarations);

    if (_.isEmpty(nonLodashDeclarations)) {
      path.remove();
    } else {
      // WARNING: powered by Babel magic
      // replacing a VariableDeclaration with a path.replaceWith() method
      // leads to infinite recursion but replacing a CallExpression works fine
      path.node.declarations = nonLodashDeclarations;
    }
  },
});


const visitor = (t, useMagicCache, lodashUsage, usedFunctions) => _.reduce(_.assignIn, {})([
  removeLodashImports(lodashUsage),
  replaceIdentifiers(t, useMagicCache, usedFunctions),
]);

export default visitor;
