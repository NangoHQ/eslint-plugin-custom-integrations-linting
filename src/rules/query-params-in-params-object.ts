import { Rule } from 'eslint';
import { Node, CallExpression, ObjectExpression, Property, Literal } from 'estree';

const queryParamsInParamsObject: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce query parameters to be in the params object for Nango API calls',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: CallExpression) {
        if (isNangoApiCall(node) && node.arguments[0]?.type === 'ObjectExpression') {
          const config = node.arguments[0] as ObjectExpression;
          const endpointProp = findEndpointProperty(config);

          if (endpointProp && hasQueryParams(endpointProp)) {
            context.report({
              node: endpointProp,
              message: 'Query parameters should be in the params object instead of the endpoint URL',
              fix(fixer) {
                if (endpointProp.value.type === 'Literal' && typeof endpointProp.value.value === 'string') {
                  const [endpoint, queryParams] = splitEndpointAndParams(endpointProp.value.value);
                  const params = parseQueryParams(queryParams);
                  const indentation = '              ';
                  
                  const formattedParams = JSON.stringify(params, null, 2)
                    .split('\n')
                    .map((line, index) => index === 0 ? line : `${indentation}${line}`)
                    .join('\n');
                  
                  return [
                    fixer.replaceText(endpointProp.value, `'${endpoint}'`),
                    fixer.insertTextAfter(
                      endpointProp,
                      `,\n${indentation}params: ${formattedParams}`
                    ),
                  ];
                }
                return null;
              },
            });
          }
        }
      },
    };
  },
};

function isNangoApiCall(node: CallExpression): boolean {
  return (
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'nango' &&
    node.callee.property.type === 'Identifier' &&
    ['get', 'post', 'put', 'patch', 'delete'].includes(node.callee.property.name)
  );
}

function findEndpointProperty(config: ObjectExpression): Property | null {
  return config.properties.find(
    (prop): prop is Property =>
      prop.type === 'Property' &&
      prop.key.type === 'Identifier' &&
      prop.key.name === 'endpoint' &&
      prop.value.type === 'Literal' &&
      typeof prop.value.value === 'string'
  ) || null;
}

function hasQueryParams(endpointProp: Property): boolean {
  return endpointProp.value.type === 'Literal' &&
    typeof endpointProp.value.value === 'string' &&
    endpointProp.value.value.includes('?');
}

function splitEndpointAndParams(url: string): [string, string] {
  const [endpoint, params] = url.split('?');
  return [endpoint, params || ''];
}

function parseQueryParams(queryString: string): Record<string, string> {
  if (!queryString) return {};
  const params: Record<string, string> = {};
  queryString.split('&').forEach(param => {
    const [key, value] = param.split('=');
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });
  return params;
}

export default queryParamsInParamsObject; 