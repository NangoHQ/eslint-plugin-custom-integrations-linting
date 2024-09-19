import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
import noObjectCasting from './no-object-casting';

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2018, sourceType: 'module' },
});

describe('no-object-casting', () => {
  it('should pass valid cases and fail invalid cases', () => {
    ruleTester.run('no-object-casting', noObjectCasting, {
      valid: [
        `
        const user: HumanUser | null = userResult.records[0];
        if (user && isHumanUser(user)) {
          return { user, userType: 'humanUser' };
        }
        `,
      ],
      invalid: [
        {
          code: `
          return {
            user: userResult.records[0] as HumanUser,
            userType: 'humanUser'
          };
          `,
          errors: [{ message: 'Avoid casting objects. Add necessary type checks instead.' }],
        },
        {
          code: `
          return {
            user: <HumanUser>userResult.records[0],
            userType: 'humanUser'
          };
          `,
          errors: [{ message: 'Avoid casting objects. Add necessary type checks instead.' }],
        },
      ],
    });
  });
});
