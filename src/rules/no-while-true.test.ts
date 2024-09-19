import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import noWhileTrue from './no-while-true';

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2018, sourceType: 'module' },
});

describe('no-while-true', () => {
  it('should pass valid cases and fail invalid cases', () => {
    ruleTester.run('no-while-true', noWhileTrue, {
      valid: [
        `
        while (condition) {
          await nango.get({});
        }
        `,
        `
        while (true) {
          // Some other operation
        }
        `,
      ],
      invalid: [
        {
          code: `
          while (true) {
            await nango.get({});
          }
          `,
          errors: [{ message: 'Avoid using while (true) with nango API calls. Use the nango built-in paginate method instead.' }],
        },
        {
          code: `
          while (true) {
            await nango.post({});
          }
          `,
          errors: [{ message: 'Avoid using while (true) with nango API calls. Use the nango built-in paginate method instead.' }],
        },
      ],
    });
  });
});
