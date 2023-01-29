import {
  configureStore,
  isRejectedWithValue,
  Middleware,
} from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { Config } from '@vera-reforged/common';

import { batch } from 'react-redux';

import Plausible from 'plausible-tracker';
import logger from 'redux-logger';
import { ThunkMiddleware } from 'redux-thunk/es/types';

import { authorization } from './reducers/authorization';
import { duties, setDays, setDuties } from './reducers/duties';
import { api } from './services/api';
import { loginApi } from './services/login';

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

const middleware: Middleware = (api) => (dispatch) => (action) => {
  switch (action.type) {
    case 'authorization/updateConfig': {
      const config: Config = action.payload;
      const {
        duties: { schedule: dutiesSchedule },
      } = config;

      batch(() => {
        Object.entries(dutiesSchedule).forEach(([peerIdString, schedule]) => {
          if (schedule) {
            const { duties, days } = schedule;

            const peerId = Number(peerIdString);

            dispatch(setDuties({ peerId, duties }));
            dispatch(setDays({ peerId, days }));
          }
        });
      });
    }
  }

  dispatch(action);
};

const devMiddlewares = [logger];

export const store = configureStore({
  reducer: {
    authorization: authorization.reducer,
    duties: duties.reducer,
    [api.reducerPath]: api.reducer,
    [loginApi.reducerPath]: loginApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      api.middleware,
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
