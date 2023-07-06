export const ROUTES = {
  duty: {
    prefix: 'duty',
    baseUrl: '/api/duty',
  },
  login: {
    prefix: 'login',
    baseUrl: '/api',
    url: '/login',
  },
  config: {
    prefix: 'config',
    baseUrl: '/api/config',
  },
  helloMessages: {
    prefix: 'hello-messages',
    baseUrl: '/api/hello-messages',
  },
} as const;
