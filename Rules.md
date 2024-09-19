ES Lint Rules
==================

# Rules
* [ ] Proxy calls should include a retries integer value
```
await nango.get({
    retries: 10,
})
await nango.post({
    retries: 10,
})
await nango.put({
    retries: 10,
})
await nango.patch({
    retries: 10,
})
await nango.delete({
    retries: 10,
})
await nango.proxy({
    method: 'GET',
    retries: 10,
})
```
* [ ] Avoid modifying values and instead return a new value
```
# avoid this
const foo = { abc: 123};

function addProp(foo) {
    foo.efg = '123';

    return foo
}

# do this instead
const foo = { abc: 123 };

function addProp(foo) {
    const updated = {
        ...foo,
        efg: '123'
    }

    return updated
}
```
* [ ] External API calls should type the responses via a types.ts file that is specific to the API
```
import { ExternalApiResponse } from '../types';

await nango.get<ExternalApiResponse>({
    retries: 10,
})
await nango.post<ExternalApiResponse>({
    retries: 10,
})
await nango.put<ExternalApiResponse>({
    retries: 10,
})
await nango.patch<ExternalApiResponse>({
    retries: 10,
})
await nango.delete<ExternalApiResponse>({
    retries: 10,
})
await nango.proxy<ExternalApiResponse>({
    method: 'GET',
    retries: 10,
})
```
* [ ] Avoid using while (true) if a proxy call is within it and instead use the nango built in paginate method
```
while (true) {
    await nango.get({})
    await nango.post({})
}
```
* [ ] Avoid casting objects and instead add necessary checks
```
return {
    //avoid this and instead add checks in code to avoid casting
    user: userResult.records[0] as HumanUser,
    userType: 'humanUser'
};
```

