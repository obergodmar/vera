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
  auth: {
    prefix: 'auth',
    baseUrl: '/api/auth',
    endpoints: {
      authorize: 'authorize',
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
