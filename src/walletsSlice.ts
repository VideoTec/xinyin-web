import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SolanaClusterType } from './rpc/solanaClusterSlice';

export interface Wallet {
  address: string;
  name: string;
  cluster: SolanaClusterType;
}

export const walletsSlice = createSlice({
  name: 'wallets',
  initialState: [] as Wallet[],
  reducers: {
    addWallet(state, action: PayloadAction<Wallet>) {
      state.push(action.payload);
    },
    removeWallet(state, action: PayloadAction<string>) {
      const index = state.findIndex(
        (wallet) => wallet.address === action.payload
      );
      if (index !== -1) {
        state.splice(index, 1);
      }
    },
    updateWallet(state, action: PayloadAction<Wallet>) {
      const index = state.findIndex(
        (wallet) => wallet.address === action.payload.address
      );
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
  },
});

export const { addWallet, removeWallet, updateWallet } = walletsSlice.actions;
export const walletsSelector = (state: { wallets: Wallet[] }) => state.wallets;
export default walletsSlice.reducer;
