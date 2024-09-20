import { Rule } from 'eslint';
import * as path from 'path';
import * as fs from 'fs';
import { Node, CallExpression, MemberExpression, Identifier } from 'estree';

const typeExternalApiResponses: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce type parameters for Nango API calls and corresponding types file',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: CallExpression & Rule.NodeParentExtension) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'nango' &&
          node.callee.property.type === 'Identifier' &&
          ['get', 'post', 'put', 'patch', 'delete', 'proxy'].includes(node.callee.property.name)
        ) {
          const sourceCode = context.getSourceCode();
          const typeArgument = (node as any).typeParameters && (node as any).typeParameters.params[0];
          const hasTypeParameter = typeArgument && sourceCode.getText(typeArgument as Node) !== 'any';
          
          const messages = [];
          if (!hasTypeParameter) {
            messages.push('Nango API calls should include a type parameter for the response');
          }

          // Only check for types.ts file if we're not in a testing environment
          if (process.env.NODE_ENV !== 'test') {
            const currentFilePath = context.getFilename();
            const parentDir = path.dirname(currentFilePath);
            const typesFilePath = path.join(parentDir, 'types.ts');
            const hasTypesFile = fs.existsSync(typesFilePath);

            if (!hasTypesFile) {
              messages.push('A corresponding types.ts file should exist in the parent directory');
            }
          }

          if (messages.length > 0) {
            context.report({
              node,
              message: messages.join('. '),
            });
          }
        }
      },
    };
  },
};

export default typeExternalApiResponses;
