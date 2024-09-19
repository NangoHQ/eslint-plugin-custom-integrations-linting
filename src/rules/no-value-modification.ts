import { Rule } from 'eslint';

const noValueModification: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Avoid modifying values and instead return a new value',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      AssignmentExpression(node) {
        if (node.left.type === 'MemberExpression') {
          context.report({
            node,
            message: 'Avoid modifying object properties directly. Consider returning a new object instead.',
          });
        }
      },
      UpdateExpression(node) {
        context.report({
          node,
          message: 'Avoid modifying values. Consider returning a new value instead.',
        });
      },
    };
  },
};

export default noValueModification;
