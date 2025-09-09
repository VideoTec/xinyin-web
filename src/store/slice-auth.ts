import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { UserInfo, AuthState } from '../types/user';

const initialState: AuthState = {
  user: null,
  status: 'idle',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<UserInfo>) => {
      state.user = action.payload;
      state.status = 'loggedIn';
    },
    logout: (state) => {
      state.user = null;
      state.status = 'loggedOut';
    },
    reset: (state) => {
      state.user = null;
      state.status = 'idle';
    },
  },
});

export const { login, logout, reset } = authSlice.actions;

export const userSelector = (state: RootState) => state.auth.user;
export const authStatusSelector = (state: RootState) => state.auth.status;

export default authSlice.reducer;
