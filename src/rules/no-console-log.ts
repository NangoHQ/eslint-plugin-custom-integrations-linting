import { Rule } from 'eslint';

const noConsoleLog: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow console.log and suggest using nango.log instead',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'console' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'log'
        ) {
          const ancestors = sourceCode.getAncestors(node);
          const isInAsyncContext = ancestors.some(
            (node) =>
              (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') &&
              node.async
          );

          const replacement = isInAsyncContext ? 'await nango.log' : 'nango.log';
          const message = isInAsyncContext
            ? 'Use await nango.log instead of console.log'
            : 'Use nango.log instead of console.log';

          context.report({
            node,
            message,
            fix(fixer) {
              return fixer.replaceText(node.callee, replacement);
            },
          });
        }
      },
    };
  },
};

export default noConsoleLog;
