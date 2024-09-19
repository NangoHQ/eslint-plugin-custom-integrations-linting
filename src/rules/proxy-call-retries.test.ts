import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import proxyCallRetries from './proxy-call-retries';

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2018, sourceType: 'module' },
});

describe('proxy-call-retries', () => {
  it('should pass valid cases and fail invalid cases', () => {
    ruleTester.run('proxy-call-retries', proxyCallRetries, {
      valid: [
        "await nango.get({ retries: 10 })",
        "await nango.post({ retries: 10 })",
        "await nango.put({ retries: 10 })",
        "await nango.patch({ retries: 10 })",
        "await nango.delete({ retries: 10 })",
        "await nango.proxy({ method: 'GET', retries: 10 })",
      ],
      invalid: [
        {
          code: "await nango.get({})",
          errors: [{ message: 'Nango API calls should include a retries property in the options object' }],
        },
        {
          code: "await nango.post({ retries: '10' })",
          errors: [{ message: 'The retries property should be an integer value' }],
        },
        {
          code: "await nango.put({ retries: 10.5 })",
          errors: [{ message: 'The retries property should be an integer value' }],
        },
        {
          code: "await nango.patch()",
          errors: [{ message: 'Nango API calls should include an options object with a retries property' }],
        },
      ],
    });
  });
});
