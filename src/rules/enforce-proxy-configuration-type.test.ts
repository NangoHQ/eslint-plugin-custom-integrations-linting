import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import enforceProxyConfigurationType from './enforce-proxy-configuration-type';

const ruleTester = new RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
    parserOptions: { ecmaVersion: 2018, sourceType: 'module' },
});

describe('enforce-proxy-configuration-type-tests', () => {
    it('should pass valid cases and fail invalid cases', () => {
        ruleTester.run('enforce-proxy-configuration-type', enforceProxyConfigurationType, {
            valid: [
                {
                    code: `
                    import type { NangoSync, Account, ProxyConfiguration } from '../../models';
                    const config: ProxyConfiguration = {
                        endpoint: 'api.xro/2.0/Accounts',
                        headers: { 'xero-tenant-id': tenant_id },
                        params: { order: 'UpdatedDateUTC DESC' },
                        retries: 10
                    };
                    `,
                },
            ],
            invalid: [
                {
                    code: `
                    import type { NangoSync, Account } from '../../models';
                    const config = {
                        endpoint: 'api.xro/2.0/Accounts',
                        headers: { 'xero-tenant-id': tenant_id },
                        params: { order: 'UpdatedDateUTC DESC' },
                        retries: 10
                    };
                    `,
                    errors: [
                        { message: 'ProxyConfiguration type should be imported and used for Nango API call configurations' },
                    ],
                    output: `
                    import type { NangoSync, Account, ProxyConfiguration } from '../../models';
                    const config: ProxyConfiguration = {
                        endpoint: 'api.xro/2.0/Accounts',
                        headers: { 'xero-tenant-id': tenant_id },
                        params: { order: 'UpdatedDateUTC DESC' },
                        retries: 10
                    };
                    `,
                },
            ],
        });
    });
});
