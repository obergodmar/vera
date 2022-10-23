import { omit } from 'ramda';

import { RootState } from './store';

export const loadState = () => {
  try {
    const serializedState = window.localStorage.getItem('state');
    if (serializedState === null) {
      return {};
    }

    const parsedState = JSON.parse(serializedState);

    return omit([], parsedState);
  } catch (_) {
    return {};
  }
};

export const saveState = (state: RootState) => {
  try {
    const stateCopy: Omit<RootState, 'api'> = {
      ...omit(['api'], state),
    };

    const serializedState = JSON.stringify(stateCopy);

    window.localStorage.setItem('state', serializedState);
  } catch (_) {
    // Error happen.
  }
};

export const persistedState = loadState();
