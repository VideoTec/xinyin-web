import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

export interface UserInfo {
  userId: string;
  userName: string;
  displayName: string;
}

export interface AuthState {
  user: UserInfo | null;
  status: 'idle' | 'loggedIn' | 'loggedOut';
}

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
  },
});

export const { login, logout } = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;

export default authSlice.reducer;
