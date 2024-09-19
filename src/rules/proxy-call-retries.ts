import { Rule } from 'eslint';
import { CallExpression, ObjectExpression, Property } from '@typescript-eslint/types/dist/ast-spec';

const proxyCallRetries: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Proxy calls should include a retries integer value',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    return {
      CallExpression(node: CallExpression) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'nango' &&
          node.callee.property.type === 'Identifier' &&
          ['get', 'post', 'put', 'patch', 'delete', 'proxy'].includes(node.callee.property.name)
        ) {
          const options = node.arguments[0] as ObjectExpression | undefined;
          if (!options || options.type !== 'ObjectExpression') {
            context.report({
              node,
              message: 'Nango API calls should include an options object with a retries property',
            });
            return;
          }

          const retriesProperty = options.properties.find(
            (prop): prop is Property => prop.type === 'Property' && prop.key.type === 'Identifier' && prop.key.name === 'retries'
          );

          if (!retriesProperty) {
            context.report({
              node,
              message: 'Nango API calls should include a retries property in the options object',
            });
          } else if (
            retriesProperty.value.type !== 'Literal' ||
            typeof retriesProperty.value.value !== 'number' ||
            !Number.isInteger(retriesProperty.value.value)
          ) {
            context.report({
              node: retriesProperty,
              message: 'The retries property should be an integer value',
            });
          }
        }
      },
    };
  },
};

export default proxyCallRetries;
