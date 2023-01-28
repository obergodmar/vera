import {
  configureStore,
  isRejectedWithValue,
  Middleware,
} from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import Plausible from 'plausible-tracker';
import logger from 'redux-logger';
import { ThunkMiddleware } from 'redux-thunk/es/types';

import { api } from '../services/api';
import { persistedState, saveState } from './utils';

const { MODE } = import.meta.env;
const isDev = MODE !== 'production';

const { enableAutoPageviews, trackEvent } = Plausible({
  domain: 'vera.example.com',
  apiHost: 'https://analytics.example.com',
  trackLocalhost: false,
});

enableAutoPageviews();

const rtkQueryErrorLogger: ThunkMiddleware = () => (dispatch) => (action) => {
  if (isRejectedWithValue(action)) {
    const trace = action?.payload?.data?.cause;

    if (trace) {
      console.error(trace);
    }
  }

  return dispatch(action);
};

const analyticsMiddleware: Middleware =
  (middlewareApi) => (dispatch) => (action) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const state = middlewareApi.getState();

    // trackEvent()

    dispatch(action);
  };

const devMiddlewares = [logger];

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      api.middleware,
      rtkQueryErrorLogger,
      analyticsMiddleware,
      ...(isDev ? devMiddlewares : [])
    ),
  devTools: isDev,
  preloadedState: persistedState,
});

store.subscribe(() => {
  saveState(store.getState());
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
