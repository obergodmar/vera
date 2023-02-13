import {
  configureStore,
  isRejectedWithValue,
  Middleware,
} from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { IConfig } from '@vera-reforged/common';

import logger from 'redux-logger';
import { ThunkMiddleware } from 'redux-thunk/es/types';

import { getToken } from '../utils/getToken';
import { authorization, logOff } from './reducers/authorization';
import { config } from './reducers/config';
import { duty, setDutyFromConfig } from './reducers/duty';
import { api } from './services/api';
import { configApi } from './services/config';
import { loginApi } from './services/login';

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

  switch (action.type) {
    case 'config/setConfig': {
      const config: IConfig.IConfig = action.payload;

      const { duty } = config;

      dispatch(setDutyFromConfig(duty));
    }
  }

  dispatch(action);
};

const devMiddlewares = [logger];

export const store = configureStore({
  reducer: {
    [authorization.name]: authorization.reducer,
    [duty.name]: duty.reducer,
    [config.name]: config.reducer,
    [api.reducerPath]: api.reducer,
    [loginApi.reducerPath]: loginApi.reducer,
    [configApi.reducerPath]: configApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      api.middleware,
      loginApi.middleware,
      configApi.middleware,
      rtkQueryErrorLogger,
      middleware,
      ...(isDev ? devMiddlewares : [])
    ),
  devTools: isDev,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
