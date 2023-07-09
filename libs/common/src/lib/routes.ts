export const ROUTES = {
  duty: {
    prefix: 'duty',
    baseUrl: '/api/duty',
    endpoints: {
      getChats: 'getChats',
      getMembersForChat: 'getMembersForChat',
      getDays: 'getDays',
      getScheduleForChat: 'getScheduleForChat',
      getSchedule: 'getSchedule',
      updateChatSchedule: 'updateChatSchedule',
    },
  },
  login: {
    prefix: 'login',
    baseUrl: '/api',
    endpoints: {
      login: 'login',
    },
  },
  config: {
    prefix: 'config',
    baseUrl: '/api/config',
  },
  helloMessages: {
    prefix: 'hello-messages',
    baseUrl: '/api/hello-messages',
    endpoints: {
      getChats: 'getChats',
      getHelloMessages: 'getHelloMessages',
      updateHelloMessage: 'updateHelloMessage',
    },
  },
} as const;
