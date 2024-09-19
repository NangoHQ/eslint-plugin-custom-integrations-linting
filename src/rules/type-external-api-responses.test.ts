import { RuleTester } from 'eslint';
import { describe, it, vi, beforeEach } from 'vitest';
import typeExternalApiResponses from './type-external-api-responses';
import * as fs from 'fs';

vi.mock('fs');

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2018, sourceType: 'module' },
});

describe('type-external-api-responses', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (fs.existsSync as any).mockReturnValue(true);
  });

  it('should pass valid cases and fail invalid cases', () => {
    ruleTester.run('type-external-api-responses', typeExternalApiResponses, {
      valid: [
        "await nango.get<ExternalApiResponse>({ retries: 10 })",
        "await nango.post<ExternalApiResponse>({ retries: 10 })",
        "await nango.put<ExternalApiResponse>({ retries: 10 })",
        "await nango.patch<ExternalApiResponse>({ retries: 10 })",
        "await nango.delete<ExternalApiResponse>({ retries: 10 })",
        "await nango.proxy<ExternalApiResponse>({ method: 'GET', retries: 10 })",
      ],
      invalid: [
        {
          code: "await nango.get({ retries: 10 })",
          errors: [{ message: 'Nango API calls should include a type parameter for the response' }],
        },
        {
          code: "await nango.post({ retries: 10 })",
          errors: [{ message: 'Nango API calls should include a type parameter for the response' }],
        },
      ],
    });
  });

  it('should fail when types.ts file does not exist', () => {
    (fs.existsSync as any).mockReturnValue(false);

    ruleTester.run('type-external-api-responses', typeExternalApiResponses, {
      valid: [],
      invalid: [
        {
          code: "await nango.get<ExternalApiResponse>({ retries: 10 })",
          errors: [{ message: 'External API calls should have a corresponding types.ts file in the parent directory' }],
        },
      ],
    });
  });
});
