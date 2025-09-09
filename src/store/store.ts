import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice-auth';
import walletsSlice from './slice-wallets';
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from 'react-redux';

const store = configureStore({
  reducer: {
    auth: authReducer,
    wallets: walletsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
