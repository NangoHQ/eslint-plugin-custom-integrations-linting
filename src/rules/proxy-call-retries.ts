import { Rule } from 'eslint';
import { Node, CallExpression, ObjectExpression, Property, Identifier, VariableDeclarator } from 'estree';

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
    const configObjects: { [key: string]: ObjectExpression } = {};

    return {
      VariableDeclarator(node: Node) {
        if (node.type === 'VariableDeclarator' && node.init && node.init.type === 'ObjectExpression') {
          if (node.id.type === 'Identifier') {
            configObjects[node.id.name] = node.init;
          }
        }
      },
      CallExpression(node: Node) {
        if (isNangoApiCall(node)) {
          if (node.arguments.length === 0) {
            reportMissingRetries(context, node);
            return;
          }

          const options = node.arguments[0];

          if (options.type === 'Identifier' && configObjects[options.name]) {
            checkConfigObject(context, configObjects[options.name], options);
          } else if (options.type === 'ObjectExpression') {
            checkConfigObject(context, options, options);
          } else {
            reportMissingRetries(context, node);
          }
        }
      },
    };
  },
};

function checkConfigObject(context: Rule.RuleContext, configObject: ObjectExpression, reportNode: Node) {
  const retriesProperty = configObject.properties.find(isRetriesProperty);

  if (!retriesProperty) {
    context.report({
      node: reportNode,
      message: 'Nango API calls should include a retries property in the options object',
      fix(fixer) {
        if (configObject.properties.length === 0) {
          return fixer.replaceText(configObject, '{ retries: 10 }');
        } else {
          const sourceCode = context.getSourceCode();
          const lastProperty = configObject.properties[configObject.properties.length - 1];
          const lastPropertyText = sourceCode.getText(lastProperty);
          const lastPropertyLines = lastPropertyText.split('\n');
          const [lastPropertyIndentation] = lastPropertyLines;
          const indentation = lastPropertyIndentation.match(/^\s*/)![0];
          return fixer.insertTextAfter(lastProperty, `,\n${indentation}retries: 10`);
        }
      }
    });
  } else if (retriesProperty.value.type === 'Literal' && !isValidRetriesValue(retriesProperty)) {
    context.report({
      node: retriesProperty,
      message: 'The retries property should be an integer value',
      fix(fixer) {
        return fixer.replaceText(retriesProperty.value, '10');
      }
    });
  }
}

function reportMissingRetries(context: Rule.RuleContext, node: Node) {
  if (node.type !== 'CallExpression') {
    return; // This should never happen, but it satisfies TypeScript
  }
  
  context.report({
    node,
    message: 'Nango API calls should include an options object with a retries property',
    fix(fixer) {
      return fixer.replaceText(node, `${context.getSourceCode().getText(node.callee)}({ retries: 10 })`);
    }
  });
}

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
  if (prop.value.type === 'Literal') {
    const value = prop.value.value;
    return typeof value === 'number' && Number.isInteger(value) && value > 0;
  }
  return false;
}

export default proxyCallRetries;
