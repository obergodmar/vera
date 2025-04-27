import {
  configureStore,
  isRejectedWithValue,
  Middleware,
} from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { ThunkMiddleware } from 'redux-thunk/es/types';

import { getToken } from '../utils/getToken';
import { authorization, logOff } from './reducers/authorization';
import { commands } from './reducers/commands';
import { crons } from './reducers/crons';
import { duty } from './reducers/duty';
import { helloMessages } from './reducers/hello-messages';
import { reactions } from './reducers/reactions';
import { authApi } from './services/auth-api';
import { commandsApi } from './services/commands-api';
import { convoApi } from './services/convo-api';
import { cronsApi } from './services/crons-api';
import { dutyApi } from './services/duty-api';
import { helloMessagesApi } from './services/hello-messages-api';
import { reactionsApi } from './services/reactions-api';
import { createSnackbar } from './snackbar-store';

const { MODE } = import.meta.env;
const isDev = MODE !== 'production';

const snackbar = createSnackbar();

const rtkQueryErrorLogger: ThunkMiddleware = () => (dispatch) => (action) => {
  if (isRejectedWithValue(action) || action?.payload?.error) {
    if (action?.payload.status === 401) {
      dispatch(logOff());
    }

    snackbar({
      id:
        isRejectedWithValue(action) && action?.payload?.status === 401
          ? 'Auth-error'
          : undefined,
      message:
        action?.payload?.error ||
        action?.payload?.data?.error ||
        'Произошла ошибка',
    });
  }

  return dispatch(action);
};

const middleware: Middleware = (_api) => (dispatch) => (action) => {
  if (!getToken()) {
    dispatch(logOff());
  }

  dispatch(action);
};

export const store = configureStore({
  reducer: {
    [authorization.name]: authorization.reducer,
    [duty.name]: duty.reducer,
    [helloMessages.name]: helloMessages.reducer,
    [reactions.name]: reactions.reducer,
    [crons.name]: crons.reducer,
    [commands.name]: commands.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [convoApi.reducerPath]: convoApi.reducer,
    [dutyApi.reducerPath]: dutyApi.reducer,
    [helloMessagesApi.reducerPath]: helloMessagesApi.reducer,
    [reactionsApi.reducerPath]: reactionsApi.reducer,
    [cronsApi.reducerPath]: cronsApi.reducer,
    [commandsApi.reducerPath]: commandsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      authApi.middleware,
      convoApi.middleware,
      dutyApi.middleware,
      helloMessagesApi.middleware,
      reactionsApi.middleware,
      cronsApi.middleware,
      commandsApi.middleware,
      rtkQueryErrorLogger,
      middleware,
    ),
  devTools: isDev,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
