import {
  configureStore,
  isRejectedWithValue,
  Middleware,
} from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import logger from 'redux-logger';
import { ThunkMiddleware } from 'redux-thunk/es/types';

import { getToken } from '../utils/getToken';
import { authorization, logOff } from './reducers/authorization';
import { crons } from './reducers/crons';
import { duty } from './reducers/duty';
import { helloMessages } from './reducers/hello-messages';
import { reactions } from './reducers/reactions';
import { convoApi } from './services/convo-api';
import { cronsApi } from './services/crons-api';
import { dutyApi } from './services/duty-api';
import { helloMessagesApi } from './services/hello-messages-api';
import { loginApi } from './services/login-api';
import { reactionsApi } from './services/reactions-api';
import { createSnackbar } from './snackbar-store';

const { MODE } = import.meta.env;
const isDev = MODE !== 'production';

const snackbar = createSnackbar();

const rtkQueryErrorLogger: ThunkMiddleware = () => (dispatch) => (action) => {
  if (
    isRejectedWithValue(action) ||
    (action?.payload?.data && 'error' in action.payload.data)
  ) {
    if (action?.payload?.originalStatus === 401) {
      dispatch(logOff());
    }

    snackbar({
      message: action?.payload?.data?.error || 'Произошла ошибка',
    });
  }

  return dispatch(action);
};

const middleware: Middleware = (api) => (dispatch) => (action) => {
  if (!getToken()) {
    dispatch(logOff());
  }

  dispatch(action);
};

const devMiddlewares = [logger];

export const store = configureStore({
  reducer: {
    [authorization.name]: authorization.reducer,
    [duty.name]: duty.reducer,
    [helloMessages.name]: helloMessages.reducer,
    [reactions.name]: reactions.reducer,
    [crons.name]: crons.reducer,
    [loginApi.reducerPath]: loginApi.reducer,
    [convoApi.reducerPath]: convoApi.reducer,
    [dutyApi.reducerPath]: dutyApi.reducer,
    [helloMessagesApi.reducerPath]: helloMessagesApi.reducer,
    [reactionsApi.reducerPath]: reactionsApi.reducer,
    [cronsApi.reducerPath]: cronsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      loginApi.middleware,
      convoApi.middleware,
      dutyApi.middleware,
      helloMessagesApi.middleware,
      reactionsApi.middleware,
      cronsApi.middleware,
      rtkQueryErrorLogger,
      middleware,
      ...(isDev ? devMiddlewares : []),
    ),
  devTools: isDev,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
