import { Rule } from 'eslint';
import { ImportDeclaration, VariableDeclaration, VariableDeclarator, Identifier, ObjectExpression, Property } from 'estree';

const enforceProxyConfigurationType: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce ProxyConfiguration type for Nango API call configurations',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    let hasProxyConfigurationImport = false;
    let configVariableName: string | null = null;
    let importNode: ImportDeclaration | null = null;
    let configNode: VariableDeclaration | null = null;

    return {
      ImportDeclaration(node: ImportDeclaration) {
        if (node.source.value === '../../models') {
          importNode = node;
          hasProxyConfigurationImport = node.specifiers.some(
            (specifier) =>
              specifier.type === 'ImportSpecifier' &&
              'imported' in specifier &&
              specifier.imported.type === 'Identifier' &&
              specifier.imported.name === 'ProxyConfiguration'
          );
        }
      },
      VariableDeclaration(node: VariableDeclaration) {
        const declarator = node.declarations[0] as VariableDeclarator;
        if (
          declarator &&
          declarator.type === 'VariableDeclarator' &&
          declarator.id.type === 'Identifier' &&
          declarator.init &&
          declarator.init.type === 'ObjectExpression'
        ) {
          const properties = declarator.init.properties;
          if (
            properties.some(
              (prop): prop is Property =>
                prop.type === 'Property' &&
                prop.key.type === 'Identifier' &&
                prop.key.name === 'endpoint'
            )
          ) {
            configVariableName = declarator.id.name;
            configNode = node;
          }
        }
      },
      'Program:exit'() {
        if (configVariableName && !hasProxyConfigurationImport && importNode && configNode) {
          const declarator = configNode.declarations[0] as VariableDeclarator;

          const hasTypeAnnotation =
            'typeAnnotation' in declarator.id && !!(declarator.id as any).typeAnnotation;

          if (declarator.id.type === 'Identifier' && !hasTypeAnnotation) {
            context.report({
              node: context.getSourceCode().ast,
              message: 'ProxyConfiguration type should be imported and used for Nango API call configurations',
              fix(fixer) {
                const fixes = [];

                if (importNode && importNode.specifiers.length > 0) {
                  fixes.push(
                    fixer.insertTextAfter(
                      importNode.specifiers[importNode.specifiers.length - 1],
                      ', ProxyConfiguration'
                    )
                  );
                }

                if (declarator && declarator.id.type === 'Identifier') {
                  fixes.push(
                    fixer.insertTextAfter(declarator.id, ': ProxyConfiguration')
                  );
                }

                return fixes;
              },
            });
          }
        }
      },
    };
  },
};

export default enforceProxyConfigurationType;
