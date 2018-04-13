import _map from 'lodash/fp/map';

const _ = {
  map: _map,
};

export const importLodashDeclaration = (t, useFp, fnName) =>
  t.importDeclaration([
    t.importDefaultSpecifier(t.identifier(`_${fnName}`)),
  ], t.stringLiteral(`lodash/${useFp ? 'fp/' : ''}${fnName}`));

export const magicCache = (t, useFp, modules) =>
  t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('_'),
      t.callExpression(
        t.memberExpression(
          t.callExpression(t.identifier('require'), [t.stringLiteral('lodash-magic-cache')]),
          t.identifier(useFp ? 'lodashFP' : 'lodash'),
        ),
        [t.arrayExpression(_.map(t.stringLiteral)(modules))],
      ),
    ),
  ]);
