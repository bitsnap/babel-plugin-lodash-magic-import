export const importLodashDeclaration = (t, useFp, fnName) =>
  t.importDeclaration([
    t.importDefaultSpecifier(t.identifier(`_${fnName}`)),
  ], t.stringLiteral(`lodash/${useFp ? 'fp/' : ''}${fnName}`));

export const magicCache = (t, useFp) =>
  t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('_magicache'),
      t.memberExpression(
        t.callExpression(t.identifier('require'), [t.stringLiteral('lodash-magic-cache')]),
        t.identifier(useFp ? 'fp' : 'lodash'),
        false,
      ),
    ),
  ]);

export const requireLodashDeclaration = (t, fnName) =>
  t.VariableDeclaration('const', [
    t.variableDeclarator(
      t.identifier(`_${fnName}`),
      t.callExpression(t.identifier('_magicache'), [t.stringLiteral(fnName)]),
    ),
  ]);
