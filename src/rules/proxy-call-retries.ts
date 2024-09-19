import { Rule } from 'eslint';
import { Node, CallExpression, ObjectExpression, Property, Identifier } from 'estree';

const proxyCallRetries: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Proxy calls should include a retries integer value',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },
  create(context: Rule.RuleContext) {
    return {
      CallExpression(node: Node) {
        if (isNangoApiCall(node)) {
          if (node.arguments.length === 0) {
            context.report({
              node,
              message: 'Nango API calls should include an options object with a retries property',
              fix(fixer) {
                  // @ts-ignore
                return fixer.replaceText(node, `nango.${node.callee.property.name}({ retries: 10 })`);
              }
            });
            return;
          }

          const options = node.arguments[0];
          
          if (!options) {
            context.report({
              node,
              message: 'Nango API calls should include an options object with a retries property',
              fix(fixer) {
                return fixer.insertTextAfter(node.callee, '({ retries: 10 })');
              }
            });
            return;
          }

          if (options.type === 'Identifier') {
            // If the options is a variable, we need to check its declaration
            const variable = context.getScope().variables.find(v => v.name === options.name);
            if (variable && variable.defs[0] && variable.defs[0].node.type === 'VariableDeclarator') {
              const declarator = variable.defs[0].node;
              if (declarator.init && declarator.init.type === 'ObjectExpression') {
                const retriesProperty = declarator.init.properties.find(isRetriesProperty);
                if (retriesProperty && isValidRetriesValue(retriesProperty)) {
                  return; // Valid case, no need to report
                }
              }
            }
            // If we can't determine the content of the variable, we don't report an error
            return;
          }

          if (options.type !== 'ObjectExpression') {
            return; // We can't determine the content, so we don't report an error
          }

          const retriesProperty = options.properties.find(isRetriesProperty);

          if (!retriesProperty) {
            context.report({
              node: options,
              message: 'Nango API calls should include a retries property in the options object',
              fix(fixer) {
                if (options.properties.length === 0) {
                  return fixer.replaceText(options, '{ retries: 10 }');
                } else {
                  const lastProperty = options.properties[options.properties.length - 1];
                  return fixer.insertTextAfter(lastProperty, ', retries: 10');
                }
              }
            });
          } else if (!isValidRetriesValue(retriesProperty)) {
            context.report({
              node: retriesProperty,
              message: 'The retries property should be an integer value',
              fix(fixer) {
                return fixer.replaceText(retriesProperty.value, '10');
              }
            });
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

function isRetriesProperty(prop: Node): prop is Property {
  return (
    prop.type === 'Property' &&
    prop.key.type === 'Identifier' &&
    prop.key.name === 'retries'
  );
}

function isValidRetriesValue(prop: Property): boolean {
  if (prop.value.type !== 'Literal') return false;
  const value = prop.value.value;
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export default proxyCallRetries;
