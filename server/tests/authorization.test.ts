import { describe, expect, it } from 'vitest';
import { authorizeRole } from '../src/modules/auth/middleware/authorize-role.middleware.js';

describe('authorizeRole', () => {
  it('allows an authenticated user with the required role', () => {
    let nextCalled = false;
    authorizeRole('ADMIN')(
      { auth: { sub: 'admin', role: 'ADMIN', jti: 't', exp: 1 } } as never,
      {} as never,
      (error) => {
        expect(error).toBeUndefined();
        nextCalled = true;
      },
    );
    expect(nextCalled).toBe(true);
  });

  it('rejects users without the required role', () => {
    let received: unknown;
    authorizeRole('ADMIN')(
      { auth: { sub: 'user', role: 'USER', jti: 't', exp: 1 } } as never,
      {} as never,
      (error) => {
        received = error;
      },
    );
    expect(received).toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
  });

  it('rejects requests without an authenticated principal', () => {
    let received: unknown;
    authorizeRole('USER')({} as never, {} as never, (error) => {
      received = error;
    });
    expect(received).toMatchObject({ statusCode: 401, code: 'UNAUTHENTICATED' });
  });
});
