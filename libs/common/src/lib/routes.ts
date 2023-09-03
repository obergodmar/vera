export const ROUTES = {
  duty: {
    prefix: 'duty',
    baseUrl: '/api/duty',
    endpoints: {
      getMembersForChat: 'getMembersForChat',
      getScheduleForChat: 'getScheduleForChat',
      updateChatSchedule: 'updateChatSchedule',
    },
  },
  convo: {
    prefix: 'convo',
    baseUrl: '/api/convo',
    endpoints: {
      getChats: 'getChats',
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
      getHelloMessages: 'getHelloMessages',
      updateHelloMessage: 'updateHelloMessage',
      updateAllHelloMessages: 'updateAllHelloMessages',
    },
  },
  reactions: {
    prefix: 'reactions',
    baseUrl: '/api/reactions',
    endpoints: {
      createReactionForChat: 'createReactionForChat',
      getReactionsForChat: 'getReactionsForChat',
      updateReactionsForChat: 'updateReactionsForChat',
    },
  },
  crons: {
    prefix: 'crons',
    baseUrl: '/api/crons',
    endpoints: {
      getCronsForChat: 'getCronsForChat',
      getCronsChats: 'getCronsChats',
      createCronForChat: 'createCronForChat',
      updateCronForChat: 'updateCronForChat',
      disableCronsForChat: 'disableCronsForChat',
      disableAllCrons: 'disableAllCrons',
    },
  },
} as const;
