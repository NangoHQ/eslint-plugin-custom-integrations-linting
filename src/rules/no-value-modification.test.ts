import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import noValueModification from './no-value-modification';

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

describe('no-value-modification', () => {
  it('should pass valid cases and fail invalid cases', () => {
    ruleTester.run('no-value-modification', noValueModification, {
      valid: [
        `
        const tenant_id = await getTenantId(nango);
        const config = {
          endpoint: 'api.xro/2.0/Payments',
          headers: {
            'xero-tenant-id': tenant_id,
            'If-Modified-Since': ''
          },
          params: {
            page: 1,
            includeArchived: 'false'
          },
          retries: 10
        };
        if (nango.lastSyncDate) {
          config.params.includeArchived = 'true';
          config.headers['If-Modified-Since'] = nango.lastSyncDate.toISOString().replace(/\.\d{3}Z$/, '');
        }
        `,
        `
        function updateConfig(config) {
          return {
            ...config,
            params: {
              ...config.params,
              includeArchived: 'true'
            }
          };
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
          output: `
          const foo = { abc: 123 };
          function addProp(foo) {
            foo = { ...foo, efg: '123' };
            return foo;
          }
          `,
        },
        {
          code: `
          function modifyConfig(config) {
            config.params.includeArchived = 'true';
            return config;
          }
          `,
          errors: [{ message: 'Avoid modifying object properties directly. Consider returning a new object instead.' }],
          output: `
          function modifyConfig(config) {
            config = { ...config, params: { ...config.params, includeArchived: 'true' } };
            return config;
          }
          `,
        },
      ],
    });
  });
});
