import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import noTryCatchUnlessExplicitlyAllowed from './no-try-catch-unless-explicitly-allowed';

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2018, sourceType: 'module' },
});

describe('no-try-catch-unless-explicitly-allowed', () => {
  it('should enforce try-catch restrictions', () => {
    ruleTester.run('no-try-catch-unless-explicitly-allowed', noTryCatchUnlessExplicitlyAllowed, {
      valid: [
        {
          code: `
            // @allowTryCatch
            try {
              await nango.get({});
            } catch (error) {
              console.error(error);
            }
          `,
        },
        {
          code: `
            /* @allowTryCatch */
            try {
              await nango.post({});
            } catch (error) {
              console.error(error);
            }
          `,
        },
      ],
      invalid: [
        {
          code: `
            try {
              await nango.get({});
            } catch (error) {
              console.error(error);
            }
          `,
          errors: [{ message: 'Try-catch blocks are not allowed unless explicitly marked with @allowTryCatch comment. It is best practice to allow the Nango platform to handle errors. Override this if you need to handle errors explicitly with special cases.' }],
        },
      ],
    });
  });
}); 