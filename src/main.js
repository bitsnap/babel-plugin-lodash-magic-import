import _startsWith from 'lodash/fp/startsWith';
import _get from 'lodash/fp/get';
import _find from 'lodash/fp/find';
import _isString from 'lodash/fp/isString';
import _isEqual from 'lodash/fp/isEqual';
import _includes from 'lodash/fp/includes';
import _assignIn from 'lodash/fp/assignIn';
import _map from 'lodash/fp/map';
import _forEach from 'lodash/fp/forEach';
import _reduce from 'lodash/fp/reduce';
import _remove from 'lodash/fp/remove';
import _isEmpty from 'lodash/fp/isEmpty';
import _overSome from 'lodash/fp/overSome';
import _concat from 'lodash/fp/concat';

import { requireLodashDeclaration, magicCache, importLodashDeclaration } from 'nodes';

import functions from 'lodash-functions';

const _ = {
  startsWith: _startsWith,
  get: _get,
  find: _find,
  isEqual: _isEqual,
  isString: _isString,
  includes: _includes,
  assignIn: _assignIn,
  map: _map,
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

const replaceAndGet = (t, usedFunctions) => ({
  Identifier(path) {
    if (_.get('node.name')(path) === '_') {
      const memberExpression = path.findParent(p => p.isMemberExpression());
      const fnName = _.get('node.property.name')(memberExpression);
      if (fnName) {
        if (_.includes(fnName)(['chain', 'tap', 'thru'])) {
          throw path.buildCodeFrameError(`Using _.${fnName} method is prohibited`);
        }

        if (_.includes(fnName)(functions)) {
          memberExpression.replaceWith(t.identifier(`_${fnName}`));

          if (!_.includes(fnName)(usedFunctions)) {
            usedFunctions.push(fnName);
          }
        } else {
          throw memberExpression.buildCodeFrameError(`Unknown lodash method _.${fnName}`);
        }
      }

      const callExpression = path.findParent(p => p.isCallExpression());
      if (_.get('node.callee.name')(callExpression) === '_') {
        throw callExpression.buildCodeFrameError('Using Seq methods is prohibited');
      }
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


export default function Plugin({
  types: t,
}) {
  return {
    visitor: {
      Program(path, state) {
        const isModule = _.find(t.isModuleDeclaration)(path.hub.file.ast.program.body);
        if (isModule) {
          const useMagicCache = _.get('opts.cache')(state);

          const usedFunctions = [];
          /* eslint-disable prefer-const */
          const lodashUsage = [false, false];
          /* eslint-enable prefer-const */

          const visitor = _.reduce(_.assignIn, {})([
            removeLodashImports(lodashUsage),
            replaceAndGet(t, usedFunctions),
          ]);

          path.traverse(visitor);
          const [useLodash, useLodashFp] = lodashUsage;

          if (!useLodash && !useLodashFp && !_.isEmpty(usedFunctions)) {
            throw path.buildCodeFrameError('Add a lodash or lodash/fp import');
          }

          const programPrepend = node => path.unshiftContainer('body', node);

          if (useMagicCache) {
            const cachedNodeFor = fnName => requireLodashDeclaration(t, fnName);
            const cachedNodes = _.map(cachedNodeFor)(usedFunctions);

            programPrepend(_.concat(magicCache(t, useLodashFp))(cachedNodes));
          } else {
            const importNodeFor = fnName => importLodashDeclaration(t, useLodashFp, fnName);
            const importNodes = _.map(importNodeFor)(usedFunctions);

            programPrepend(importNodes);
          }
        }
      },
    },
  };
}
