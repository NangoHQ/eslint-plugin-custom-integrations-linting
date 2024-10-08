import noConsoleLog from './rules/no-console-log';
import noObjectCasting from './rules/no-object-casting';
import noValueModification from './rules/no-value-modification';
import noWhileTrue from './rules/no-while-true'
import proxyCallRetries from './rules/proxy-call-retries';
import enforceProxyConfigurationType from './rules/enforce-proxy-configuration-type';
import typeExternalApiResponses from './rules/type-external-api-responses';

export const rules = {
    'enforce-proxy-configuration-type': enforceProxyConfigurationType,
    'no-console-log': noConsoleLog,
    'no-object-casting': noObjectCasting,
    'no-value-modification': noValueModification,
    'no-while-true': noWhileTrue,
    'proxy-call-retries': proxyCallRetries,
    'type-external-api-responses': typeExternalApiResponses,
};
