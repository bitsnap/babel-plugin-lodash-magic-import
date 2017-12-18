const _ = require('lodash/fp');

// Helpers

function isCorrectIdentifier(path) {
  const { parentPath } = path;
  return parentPath.isVariableDeclarator() && parentPath.get('init').isObjectExpression();
}

function getProperties(property) {
  return _.flatMap(_.get(property));
}


module.exports = function ({ types: t }) {
  return {
    visitor: {
      Identifier(path, { opts }) {
        if (!isCorrectIdentifier(path)) {
          return;
        }

        const { libIdentifier, importPath } = opts;
        const { node: identifier } = path;
        if (!identifier.name === libIdentifier) {
          return;
        }
        const { parentPath } = path;

        const initNode = parentPath.get('init');
        const libImports = _.flow(_.get('node'), _.get('properties'), getProperties('key'), getProperties('name'))(initNode);
        const libImportSpecifiers = _.map(property => t.ImportSpecifier(t.identifier(property), t.identifier(property)))(libImports);
        // Library import AST constrution
        const importDeclaration = t.importDeclaration(libImportSpecifiers, t.stringLiteral(importPath));
        // Insert Import in program node
        const program = path.findParent(searchPath => searchPath.isProgram());
        program.unshiftContainer('body', importDeclaration);
      },
    },
  };
};
