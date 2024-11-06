import noConsoleLog from './rules/no-console-log';
import noObjectCasting from './rules/no-object-casting';
import noValueModification from './rules/no-value-modification';
import noWhileTrue from './rules/no-while-true'
import proxyCallRetries from './rules/proxy-call-retries';
import enforceProxyConfigurationType from './rules/enforce-proxy-configuration-type';
import typeExternalApiResponses from './rules/type-external-api-responses';
import includeDocsForEndpoints from './rules/include-docs-for-endpoints';
import noTryCatchUnlessExplicitlyAllowed from './rules/no-try-catch-unless-explicitly-allowed';
import queryParamsInParamsObject from './rules/query-params-in-params-object';

export const rules = {
    'enforce-proxy-configuration-type': enforceProxyConfigurationType,
    'no-console-log': noConsoleLog,
    'include-docs-for-endpoints': includeDocsForEndpoints,
    'no-object-casting': noObjectCasting,
    'no-value-modification': noValueModification,
    'no-try-catch-unless-explicitly-allowed': noTryCatchUnlessExplicitlyAllowed,
    'query-params-in-params-object': queryParamsInParamsObject,
    'no-while-true': noWhileTrue,
    'proxy-call-retries': proxyCallRetries,
    'type-external-api-responses': typeExternalApiResponses,
};
