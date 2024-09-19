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
                { code: "await nango.get({ retries: 10 })", name: "Simple get with retries" },
                { code: "await nango.put({ retries: 10 })", name: "Simple put with retries" },
                { code: "await nango.patch({ retries: 10 })", name: "Simple patch with retries" },
                { code: "await nango.delete({ retries: 10 })", name: "Simple delete with retries" },
                { code: "await nango.proxy({ method: 'GET', retries: 10 })", name: "Proxy with retries" },
                {
                    code: `
                    const config = {
                        endpoint: 'api.xro/2.0/Contacts',
                        headers: { 'xero-tenant-id': tenant_id },
                        params: { summarizeErrors: 'false' },
                        retries: 10,
                        data: { Contacts: input.map(toXeroContact) }
                    };
                    const res = await nango.post(config);
                    `,
                    name: "Config object with retries"
                },
                {
                    code: `const res = await nango.get({ endpoint: 'api.example.com', retries: 5 });`,
                    name: "Inline object with retries"
                },
                {
                    code: `
                    const config = { endpoint: 'api.example.com', retries: 3 };
                    const res = await nango.put(config);
                    `,
                    name: "Simple config object with retries"
                },
                {
                    code: `
                    const retries = 3;

                    export default async function fetchData(nango: NangoSync): Promise<void> {
                        const proxyConfig: ProxyConfiguration = {
                            endpoint: '/customerpayment',
                            retries
                        };
                        for await (const payments of paginate<{ id: string }>({ nango, proxyConfig })) {
                            await nango.log('Listed payments', { total: payments.length });

                            const mappedPayments: NetsuitePayment[] = [];
                            for (const paymentLink of payments) {
                                const payment: NSAPI_GetResponse<NS_Payment> = await nango.get({
                                    endpoint: \`/customerpayment/\${paymentLink.id}\`,
                                    params: {
                                        expandSubResources: 'true'
                                    },
                                    retries
                                });
                            }
                        }
                    }
                    `,
                    name: "Variable retries in config and nango.get"
                },
            ],
            invalid: [
                {
                    code: "await nango.get({})",
                    errors: [{ message: 'Nango API calls should include a retries property in the options object' }],
                    output: "await nango.get({ retries: 10 })",
                    name: "Empty object without retries"
                },
                {
                    code: "await nango.post({ retries: '10' })",
                    errors: [{ message: 'The retries property should be an integer value' }],
                    output: "await nango.post({ retries: 10 })",
                    name: "String retries value"
                },
                {
                    code: "await nango.put({ retries: 10.5 })",
                    errors: [{ message: 'The retries property should be an integer value' }],
                    output: "await nango.put({ retries: 10 })",
                    name: "Float retries value"
                },
                {
                    code: "await nango.patch()",
                    errors: [{ message: 'Nango API calls should include an options object with a retries property' }],
                    output: "await nango.patch({ retries: 10 })",
                    name: "No options object"
                }
            ],
        });
    });
});
