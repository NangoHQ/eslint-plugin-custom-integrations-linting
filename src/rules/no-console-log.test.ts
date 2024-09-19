import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import noConsoleLog from './no-console-log';

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2018, sourceType: 'module' },
});

describe('no-console-log', () => {
  it('should pass valid cases and fail invalid cases', () => {
    ruleTester.run('no-console-log', noConsoleLog, {
      valid: [
        { code: 'async function test() { await nango.log("Hello, world!"); }' },
        { code: 'function test() { nango.log("Hello, world!"); }' },
        { code: 'someOtherFunction("test");' },
      ],
      invalid: [
        {
          code: 'console.log("Hello, world!");',
          errors: [{ message: 'Use nango.log instead of console.log' }],
          output: 'nango.log("Hello, world!");',
        },
        {
          code: 'async function test() { console.log("Hello, world!"); }',
          errors: [{ message: 'Use await nango.log instead of console.log' }],
          output: 'async function test() { await nango.log("Hello, world!"); }',
        },
        {
          code: 'function test() { console.log("Hello, world!"); }',
          errors: [{ message: 'Use nango.log instead of console.log' }],
          output: 'function test() { nango.log("Hello, world!"); }',
        },
      ],
    });
  });
});
