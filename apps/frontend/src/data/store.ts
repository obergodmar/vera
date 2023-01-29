import { configureStore, isRejectedWithValue } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import Plausible from 'plausible-tracker';
import logger from 'redux-logger';
import { ThunkMiddleware } from 'redux-thunk/es/types';

import { authorization } from './reducers/authorization';
import { duties } from './reducers/duties';
import { api } from './services/api';

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

const devMiddlewares = [logger];

export const store = configureStore({
  reducer: {
    authorization: authorization.reducer,
    duties: duties.reducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      api.middleware,
      rtkQueryErrorLogger,
      ...(isDev ? devMiddlewares : [])
    ),
  devTools: isDev,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
