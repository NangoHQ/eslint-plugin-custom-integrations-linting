import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import queryParamsInParamsObject from './query-params-in-params-object';

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2018, sourceType: 'module' },
});

describe('query-params-in-params-object', () => {
  it('should enforce query parameters in params object', () => {
    ruleTester.run('query-params-in-params-object', queryParamsInParamsObject, {
      valid: [
        {
          code: `
            await nango.get({
              endpoint: 'api/users',
              params: {
                page: '1',
                limit: '10'
              }
            });
          `,
        },
      ],
      invalid: [
        {
          code: `
            await nango.get({
              endpoint: 'api/users?page=1&limit=10'
            });
          `,
          errors: [{ message: 'Query parameters should be in the params object instead of the endpoint URL' }],
          output: `
            await nango.get({
              endpoint: 'api/users',
              params: {
                "page": "1",
                "limit": "10"
              }
            });
          `,
        },
      ],
    });
  });
}); 