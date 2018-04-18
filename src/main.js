import _get from 'lodash/fp/get';
import _find from 'lodash/fp/find';
import _map from 'lodash/fp/map';
import _isEmpty from 'lodash/fp/isEmpty';

import { magicCache, importLodashDeclaration } from 'nodes';

import visitor from 'visitor';

const _ = {
  get: _get,
  find: _find,
  map: _map,
  isEmpty: _isEmpty,
};

const forbidLodashImportAbsence = (path, useLodash, useLodashFp, usedFunctions) => {
  if (!useLodash && !useLodashFp && !_.isEmpty(usedFunctions)) {
    throw path.buildCodeFrameError('Add a lodash or lodash/fp import');
  }
};

const traverse = (t, path, useMagicCache) => {
  const usedFunctions = [];
  /* eslint-disable prefer-const */
  const lodashUsage = [false, false];
  /* eslint-enable prefer-const */

  path.traverse(visitor(t, useMagicCache, lodashUsage, usedFunctions));
  const [useLodash, useLodashFp] = lodashUsage;

  forbidLodashImportAbsence(path, useLodash, useLodashFp, usedFunctions);

  return [
    usedFunctions,
    useLodashFp,
  ];
};

export default function Plugin({
  types: t,
}) {
  return {
    visitor: {
      Program(path, state) {
        const isModule = _.find(t.isModuleDeclaration)(path.hub.file.ast.program.body);
        if (isModule) {
          const useMagicCache = _.get('opts.cache')(state);

          const [
            usedFunctions,
            useLodashFp,
          ] = traverse(t, path, useMagicCache);

          const programPrepend = node => path.unshiftContainer('body', node);

          if (useMagicCache) {
            programPrepend(magicCache(t, useLodashFp, usedFunctions));
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
