import { Rule } from 'eslint';
import { Node, AssignmentExpression, MemberExpression, Identifier } from 'estree';

// Extend Node type to include parent property
type NodeWithParent = Node & { parent?: NodeWithParent };

const noValueModification: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow direct modification of function parameters',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    return {
      AssignmentExpression(node: AssignmentExpression & Rule.NodeParentExtension) {
        if (node.left.type === 'MemberExpression') {
          const left = node.left;
          if (isParameterModification(left, context)) {
            context.report({
              node,
              message: 'Avoid modifying object properties directly. Consider returning a new object instead.',
              fix(fixer) {
                const sourceCode = context.getSourceCode();
                const objectText = sourceCode.getText(left.object);
                const propertyText = getPropertyText(left.property, sourceCode);
                const rightText = sourceCode.getText(node.right);
                
                if (left.object.type === 'MemberExpression') {
                  // Handle nested property assignment
                  const outerObject = sourceCode.getText(left.object.object);
                  const outerProperty = getPropertyText(left.object.property, sourceCode);
                  return fixer.replaceText(
                    node,
                    `${outerObject} = { ...${outerObject}, ${outerProperty}: { ...${objectText}, ${propertyText}: ${rightText} } }`
                  );
                } else {
                  // Handle simple property assignment
                  return fixer.replaceText(
                    node,
                    `${objectText} = { ...${objectText}, ${propertyText}: ${rightText} }`
                  );
                }
              },
            });
          }
        }
      },
    };
  },
};

function isParameterModification(node: MemberExpression, context: Rule.RuleContext): boolean {
  let current: NodeWithParent | null = node as NodeWithParent;
  while (current && current.type !== 'FunctionDeclaration' && current.type !== 'FunctionExpression' && current.type !== 'ArrowFunctionExpression') {
    current = current.parent || null;
  }
  
  if (current && 'params' in current) {
    const params = current.params;
    const objectName = getObjectName(node);
    return params.some(param => param.type === 'Identifier' && param.name === objectName);
  }
  
  return false;
}

function getObjectName(node: MemberExpression): string {
  if (node.object.type === 'Identifier') {
    return node.object.name;
  } else if (node.object.type === 'MemberExpression') {
    return getObjectName(node.object);
  }
  return '';
}

function getPropertyText(property: Node, sourceCode: Rule.RuleContext['sourceCode']): string {
  if (property.type === 'Identifier') {
    return property.name;
  } else {
    return sourceCode.getText(property);
  }
}

export default noValueModification;
