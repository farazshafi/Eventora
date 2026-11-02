const tokenKey = 'eventora.accessToken';

export const authToken = {
  get: () => (typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(tokenKey)),
  set: (token: string) => sessionStorage.setItem(tokenKey, token),
  clear: () => sessionStorage.removeItem(tokenKey),
};

export const unauthorizedEvent = 'eventora:unauthorized';
