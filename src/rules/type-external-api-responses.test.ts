import { RuleTester } from 'eslint';
import { describe, it, beforeAll, afterAll } from 'vitest';
import typeExternalApiResponses from './type-external-api-responses';

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2018, sourceType: 'module' },
});

describe('type-external-api-responses', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    delete process.env.NODE_ENV;
  });

  it('should enforce type parameters for Nango API calls', () => {
    ruleTester.run('type-external-api-responses', typeExternalApiResponses, {
      valid: [
        {
          code: 'const response = await nango.get<SomeType>(config);',
          filename: '/path/to/file.ts',
        },
      ],
      invalid: [
        {
          code: 'const response = await nango.get(config);',
          filename: '/path/to/file.ts',
          errors: [
            {
              message: 'Nango API calls should include a type parameter for the response',
            },
          ],
        },
        {
          code: 'const response = await nango.get<any>(config);',
          filename: '/path/to/file.ts',
          errors: [
            {
              message: 'Nango API calls should include a type parameter for the response',
            },
          ],
        },
      ],
    });
  });
});
