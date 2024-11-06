import { Rule } from 'eslint';
import { Node, ObjectExpression, Property } from 'estree';

const includeDocsForEndpoints: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce documentation URLs for endpoint properties in ProxyConfiguration',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      Property(node: Property) {
        if (isEndpointProperty(node)) {
          const ancestors = context.getAncestors();
          const isProxyConfig = ancestors.some(ancestor => 
            ancestor.type === 'VariableDeclarator' &&
            (ancestor as any).id?.typeAnnotation?.typeAnnotation?.typeName?.name === 'ProxyConfiguration'
          );

          if (isProxyConfig) {
            const sourceCode = context.getSourceCode();
            const comments = sourceCode.getCommentsBefore(node);
            
            if (!comments.length || !hasDocumentationUrl(comments)) {
              context.report({
                node,
                message: 'Endpoint properties should include a documentation URL in a comment above',
              });
            }
          }
        }
      },
    };
  },
};

function isEndpointProperty(node: Property): boolean {
  return (
    node.type === 'Property' &&
    node.key.type === 'Identifier' &&
    node.key.name === 'endpoint'
  );
}

function hasDocumentationUrl(comments: any[]): boolean {
  return comments.some(comment => {
    const commentText = comment.value.trim().toLowerCase();
    return (
      commentText.includes('http://') ||
      commentText.includes('https://') ||
      commentText.includes('docs') ||
      commentText.includes('api')
    );
  });
}

export default includeDocsForEndpoints; 
