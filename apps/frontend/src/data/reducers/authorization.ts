import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IApi } from '@vera-reforged/common';
import { UsersUser } from '@example/api-schema-typescript';

import { getToken } from '../../utils/getToken';

type Authorization = {
  authorized: boolean;
  user: UsersUser | null;
};

const initialState: Authorization = {
  authorized: !!getToken(),
  user: recoverUser(),
};

export const authorization = createSlice({
  name: 'authorization',
  initialState,
  reducers: {
    authorize: (
      _,
      { payload: { token, user } }: PayloadAction<IApi.IAuthApi.AuthResponse>,
    ) => {
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('user', JSON.stringify(user));

      return {
        authorized: true,
        user,
      };
    },
    logOff: () => {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');

      return {
        authorized: false,
        user: null,
      };
    },
  },
});

function recoverUser() {
  try {
    const userString = window.localStorage.getItem('user');
    if (!userString) {
      throw new Error('user is null');
    }

    return JSON.parse(userString);
  } catch (e) {
    return null;
  }
}

export const { authorize, logOff } = authorization.actions;
