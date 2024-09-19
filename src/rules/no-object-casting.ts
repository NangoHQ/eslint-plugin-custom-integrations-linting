import { Rule } from 'eslint';
import { TSAsExpression, TSTypeAssertion } from '@typescript-eslint/types/dist/ast-spec';

const noObjectCasting: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Avoid casting objects and instead add necessary checks',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    return {
      TSAsExpression(node: TSAsExpression) {
        context.report({
          node,
          message: 'Avoid casting objects. Add necessary type checks instead.',
        });
      },
      TSTypeAssertion(node: TSTypeAssertion) {
        context.report({
          node,
          message: 'Avoid casting objects. Add necessary type checks instead.',
        });
      },
    };
  },
};

export default noObjectCasting;
