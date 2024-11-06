import { Rule } from 'eslint';
import { Node, TryStatement } from 'estree';

const noTryCatchUnlessExplicitlyAllowed: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow try-catch blocks unless explicitly allowed via comments',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      TryStatement(node: TryStatement) {
        const sourceCode = context.getSourceCode();
        const comments = sourceCode.getCommentsBefore(node);
        
        const isAllowed = comments.some(comment => 
          comment.value.trim().toLowerCase().includes('@allowtrycatch')
        );

        if (!isAllowed) {
          context.report({
            node,
            message: 'Try-catch blocks are not allowed unless explicitly marked with @allowTryCatch comment. It is best practice to allow the Nango platform to handle errors. Override this if you need to handle errors explicitly with special cases.',
          });
        }
      },
    };
  },
};

export default noTryCatchUnlessExplicitlyAllowed; 