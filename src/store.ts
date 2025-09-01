import { configureStore } from '@reduxjs/toolkit';
import authReducer, { login, type UserInfo } from './authSlice';
import solanaClusterReducer from './rpc/solanaClusterSlice';
import walletsSlice from './walletsSlice';
import { post } from './restful-api';

const store = configureStore({
  reducer: {
    auth: authReducer,
    solanaCluster: solanaClusterReducer,
    wallets: walletsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

export async function getMe() {
  const user = await post<UserInfo>('auth/me');
  store.dispatch(login(user));
}

export function getCurrentCluster() {
  return store.getState().solanaCluster.cluster;
}
