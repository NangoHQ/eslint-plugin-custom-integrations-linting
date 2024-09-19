import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import enforceProxyConfigurationType from './enforce-proxy-configuration-type';

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
});

describe('enforce-proxy-configuration-type', () => {
  it('should pass valid cases and fail invalid cases', () => {
    ruleTester.run('enforce-proxy-configuration-type', enforceProxyConfigurationType, {
      valid: [
        {
          code: `
            const config: ProxyConfiguration = {
              endpoint: 'api.xro/2.0/Contacts',
              headers: { 'xero-tenant-id': tenant_id },
              params: { summarizeErrors: 'false' },
              data: { Contacts: input.map(toXeroContact) }
            };
            const res = await nango.post(config);
          `,
        },
        {
          code: `
            let config: ProxyConfiguration;
            config = {
              endpoint: 'api.xro/2.0/Contacts',
              headers: { 'xero-tenant-id': tenant_id },
              params: { summarizeErrors: 'false' },
              data: { Contacts: input.map(toXeroContact) }
            };
            const res = await nango.get(config);
          `,
        },
        {
          code: `
            const res = await nango.put({ endpoint: 'api.example.com', data: {} });
          `,
        },
      ],
      invalid: [
        {
          code: `
            const config = {
              endpoint: 'api.xro/2.0/Contacts',
              headers: { 'xero-tenant-id': tenant_id },
              params: { summarizeErrors: 'false' },
              data: { Contacts: input.map(toXeroContact) }
            };
            const res = await nango.post(config);
          `,
          errors: [{ message: 'Configuration object for Nango API calls should be typed as ProxyConfiguration' }],
          output: `
            const config: ProxyConfiguration = {
              endpoint: 'api.xro/2.0/Contacts',
              headers: { 'xero-tenant-id': tenant_id },
              params: { summarizeErrors: 'false' },
              data: { Contacts: input.map(toXeroContact) }
            };
            const res = await nango.post(config);
          `,
        },
        {
          code: `
            let config = {
              endpoint: 'api.xro/2.0/Contacts',
              headers: { 'xero-tenant-id': tenant_id },
              params: { summarizeErrors: 'false' },
              data: { Contacts: input.map(toXeroContact) }
            };
            const res = await nango.get(config);
          `,
          errors: [{ message: 'Configuration object for Nango API calls should be typed as ProxyConfiguration' }],
          output: `
            let config: ProxyConfiguration = {
              endpoint: 'api.xro/2.0/Contacts',
              headers: { 'xero-tenant-id': tenant_id },
              params: { summarizeErrors: 'false' },
              data: { Contacts: input.map(toXeroContact) }
            };
            const res = await nango.get(config);
          `,
        },
        {
          code: `
            var config = {
              endpoint: 'api.xro/2.0/Contacts',
              headers: { 'xero-tenant-id': tenant_id },
              params: { summarizeErrors: 'false' },
              data: { Contacts: input.map(toXeroContact) }
            };
            const res = await nango.proxy(config);
          `,
          errors: [{ message: 'Configuration object for Nango API calls should be typed as ProxyConfiguration' }],
          output: `
            var config: ProxyConfiguration = {
              endpoint: 'api.xro/2.0/Contacts',
              headers: { 'xero-tenant-id': tenant_id },
              params: { summarizeErrors: 'false' },
              data: { Contacts: input.map(toXeroContact) }
            };
            const res = await nango.proxy(config);
          `,
        },
      ],
    });
  });
});
