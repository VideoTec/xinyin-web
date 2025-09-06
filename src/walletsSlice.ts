import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SolanaClusterType } from './rpc/solanaClusterSlice';
// import sqlite3Api from './sqlite/sqlite3-main';

export interface Wallet {
  address: string;
  name: string;
  cluster: SolanaClusterType;
  balance: number;
  hasKey: boolean;
  isMine: boolean;
}

// await sqlite3Api.getWalletsOfCluster('devnet');

export const walletsSlice = createSlice({
  name: 'wallets',
  initialState: [] as Wallet[],
  reducers: {
    loadWallets() {
      console.log('Loading wallets from DB...');
      // sqlite3Api.getWalletsOfCluster('devnet');
      return [];
    },
    addWallet(state, action: PayloadAction<Wallet>) {
      // sqlite3Api
      //   .upsertWalletAddress(
      //     action.payload.address,
      //     action.payload.balance,
      //     action.payload.cluster,
      //     action.payload.hasKey,
      //     action.payload.isMine
      //   )
      //   .catch((error) => {
      //     console.error('Failed to insert wallet address:', error);
      //   });
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

        // sqlite3Api
        //   .upsertWalletAddress(
        //     action.payload.address,
        //     action.payload.balance,
        //     action.payload.cluster,
        //     action.payload.hasKey,
        //     action.payload.isMine
        //   )
        //   .catch((error) => {
        //     console.error('Failed to update wallet address:', error);
        //   });
      }
    },
  },
});

export const { addWallet, removeWallet, updateWallet, loadWallets } =
  walletsSlice.actions;
export const walletsSelector = (state: { wallets: Wallet[] }) => state.wallets;
export default walletsSlice.reducer;
