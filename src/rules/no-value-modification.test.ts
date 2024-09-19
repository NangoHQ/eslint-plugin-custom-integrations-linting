import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import noValueModification from './no-value-modification';

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2018, sourceType: 'module' },
});

describe('no-value-modification', () => {
  it('should pass valid cases and fail invalid cases', () => {
    ruleTester.run('no-value-modification', noValueModification, {
      valid: [
        `
        const foo = { abc: 123 };
        function addProp(foo) {
          const updated = {
            ...foo,
            efg: '123'
          };
          return updated;
        }
        `,
      ],
      invalid: [
        {
          code: `
          const foo = { abc: 123 };
          function addProp(foo) {
            foo.efg = '123';
            return foo;
          }
          `,
          errors: [{ message: 'Avoid modifying object properties directly. Consider returning a new object instead.' }],
        },
        {
          code: `
          let counter = 0;
          counter++;
          `,
          errors: [{ message: 'Avoid modifying values. Consider returning a new value instead.' }],
        },
      ],
    });
  });
});
