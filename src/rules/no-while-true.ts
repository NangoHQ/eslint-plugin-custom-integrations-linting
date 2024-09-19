import { Rule } from 'eslint';

const noWhileTrue: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Avoid using while (true) if a nango API call is within it and instead use the nango built-in paginate method',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      WhileStatement(node) {
        if (node.test.type === 'Literal' && node.test.value === true) {
          const sourceCode = context.getSourceCode();
          const whileBody = sourceCode.getText(node.body);
          if (whileBody.includes('nango.get(') || whileBody.includes('nango.post(')) {
            context.report({
              node,
              message: 'Avoid using while (true) with nango API calls. Use the nango built-in paginate method instead.',
            });
          }
        }
      },
    };
  },
};

export default noWhileTrue;
