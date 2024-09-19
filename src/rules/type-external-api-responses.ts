import { Rule } from 'eslint';
import * as path from 'path';
import * as fs from 'fs';
import { CallExpression, TSTypeParameterInstantiation } from '@typescript-eslint/types/dist/ast-spec';

const typeExternalApiResponses: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'External API calls should type the responses via a types.ts file that is specific to the API',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    const checkTypesFileExists = (filePath: string): boolean => {
      try {
        return fs.existsSync(filePath);
      } catch (e) {
        return false;
      }
    };

    return {
      CallExpression(node: CallExpression & Rule.NodeParentExtension) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'nango' &&
          node.callee.property.type === 'Identifier' &&
          ['get', 'post', 'put', 'patch', 'delete', 'proxy'].includes(node.callee.property.name)
        ) {
          const typeParameters = node.typeParameters as TSTypeParameterInstantiation | undefined;
          if (!typeParameters || typeParameters.params.length === 0) {
            context.report({
              node,
              message: 'Nango API calls should include a type parameter for the response',
            });
          } else {
            const typeParam = typeParameters.params[0];
            if (typeParam.type !== 'TSTypeReference' || typeParam.typeName.type !== 'Identifier' || !typeParam.typeName.name.endsWith('Response')) {
              context.report({
                node: typeParam,
                message: 'The type parameter should reference a response type (ending with "Response")',
              });
            }
          }

          const filename = context.getFilename();
          const dirname = path.dirname(filename);
          const typesFile = path.join(dirname, '..', 'types.ts');

          if (!checkTypesFileExists(typesFile)) {
            context.report({
              node,
              message: 'External API calls should have a corresponding types.ts file in the parent directory',
            });
          }
        }
      },
    };
  },
};

export default typeExternalApiResponses;
