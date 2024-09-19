import { Rule } from 'eslint';
import { Node, CallExpression, Identifier, VariableDeclarator } from 'estree';

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
  create(context: Rule.RuleContext) {
    const sourceCode = context.getSourceCode();

    return {
      CallExpression(node: Node) {
        if (isNangoApiCall(node)) {
          const options = node.arguments[0];
          
          if (options && options.type === 'Identifier') {
            const scope = sourceCode.getScope(node);
            const variable = scope.variables.find(v => v.name === options.name);
            if (variable && variable.defs[0] && variable.defs[0].node.type === 'VariableDeclarator') {
              const declarator = variable.defs[0].node;
              if (!hasProxyConfigurationType(declarator, context)) {
                context.report({
                  node: declarator,
                  message: 'Configuration object for Nango API calls should be typed as ProxyConfiguration',
                  fix(fixer) {
                    const declarationToken = sourceCode.getFirstToken(declarator.parent);
                    if (declarationToken && (declarationToken.value === 'const' || declarationToken.value === 'let' || declarationToken.value === 'var')) {
                      return fixer.insertTextAfter(declarator.id, ': ProxyConfiguration');
                    }
                    return null;
                  }
                });
              }
            }
          }
        }
      },
    };
  },
};

function isNangoApiCall(node: Node): node is CallExpression {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'nango' &&
    node.callee.property.type === 'Identifier' &&
    ['get', 'post', 'put', 'patch', 'delete', 'proxy'].includes(node.callee.property.name)
  );
}

function hasProxyConfigurationType(node: VariableDeclarator, context: Rule.RuleContext): boolean {
  const sourceCode = context.getSourceCode();
  const idToken = sourceCode.getFirstToken(node.id);
  if (!idToken) return false;

  const nextToken = sourceCode.getTokenAfter(idToken);
  if (!nextToken) return false;

  const tokenAfterColon = sourceCode.getTokenAfter(nextToken);
  
  return (
    nextToken.type === 'Punctuator' &&
    nextToken.value === ':' &&
    tokenAfterColon?.value === 'ProxyConfiguration'
  );
}

export default enforceProxyConfigurationType;
