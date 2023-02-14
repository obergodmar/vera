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
import { duty } from './reducers/duty';
import { dutyApi } from './services/duty-api';
import { loginApi } from './services/login-api';

const { MODE } = import.meta.env;
const isDev = MODE !== 'production';

const rtkQueryErrorLogger: ThunkMiddleware = () => (dispatch) => (action) => {
  if (isRejectedWithValue(action)) {
    if (action?.payload?.originalStatus === 401) {
      dispatch(logOff());
    }
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
    [dutyApi.reducerPath]: dutyApi.reducer,
    [loginApi.reducerPath]: loginApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      loginApi.middleware,
      rtkQueryErrorLogger,
      middleware,
      ...(isDev ? devMiddlewares : [])
    ),
  devTools: isDev,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
