import {
  createSlice,
  type PayloadAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import type { SolanaClusterType } from '../types/common';
import type { Wallet } from '../types/wallet';
import sqlite3Api from '../sqlite/sqlite3-main';
import type { RootState } from './store';

interface WalletsState {
  wallets: Wallet[];
  loading: boolean;
  error: string | null;
}

export const loadWalletsByCluster = createAsyncThunk<
  Wallet[],
  SolanaClusterType,
  { rejectValue: string }
>('wallets/fetchByCluster', async (cluster, { rejectWithValue }) => {
  try {
    const wallets = await sqlite3Api.getWalletsOfCluster(cluster);
    // console.log('Fetched wallets from DB:', wallets);
    return wallets;
  } catch (error) {
    return rejectWithValue(
      'Failed to fetch wallets from database' +
        (error instanceof Error ? ': ' + error.message : '')
    );
  }
});

export const walletsSlice = createSlice({
  name: 'wallets',
  initialState: {
    wallets: [] as Wallet[],
    loading: false,
    error: null as string | null,
  } as WalletsState,
  reducers: {
    resetWallets(state) {
      state.wallets = [];
    },
    addWallet(state, action: PayloadAction<Wallet>) {
      sqlite3Api.upsertWalletAddress(action.payload).catch((error) => {
        console.error('Failed to insert wallet address:', error);
      });
      state.wallets.push(action.payload);
    },
    removeWallet(state, action: PayloadAction<string>) {
      const index = state.wallets.findIndex(
        (wallet) => wallet.$address === action.payload
      );
      if (index !== -1) {
        state.wallets.splice(index, 1);
        sqlite3Api.deleteWalletByAddress(action.payload).catch((error) => {
          console.error(
            `Failed to delete wallet address: ${action.payload}\n`,
            error
          );
        });
      }
    },
    updateWallet(state, action: PayloadAction<Wallet>) {
      const index = state.wallets.findIndex(
        (wallet) => wallet.$address === action.payload.$address
      );
      if (index !== -1) {
        state.wallets[index] = action.payload;

        sqlite3Api.upsertWalletAddress(action.payload).catch((error) => {
          console.error(
            `Failed to update wallet address: ${action.payload.$address}\n`,
            error
          );
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWalletsByCluster.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadWalletsByCluster.fulfilled, (state, action) => {
        state.loading = false;
        state.wallets = action.payload;
      })
      .addCase(loadWalletsByCluster.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch wallets';
      });
  },
});

export const { addWallet, removeWallet, updateWallet, resetWallets } =
  walletsSlice.actions;

export const walletsSelector = (state: RootState) => state.wallets.wallets;

export const walletsLoadingSelector = (state: RootState) =>
  state.wallets.loading;

export const walletsErrorSelector = (state: RootState) => state.wallets.error;

export default walletsSlice.reducer;
