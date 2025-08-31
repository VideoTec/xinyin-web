import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export enum SolanaClusterType {
  'mainnetBeta' = 'mainnet-beta',
  'devnet' = 'devnet',
  'testnet' = 'testnet',
}

const initialState = {
  cluster: SolanaClusterType.devnet,
};

export const solanaClusterSlice = createSlice({
  name: 'solanaCluster',
  initialState,
  reducers: {
    setCluster(state, action: PayloadAction<SolanaClusterType>) {
      state.cluster = action.payload;
    },
  },
});

export const { setCluster } = solanaClusterSlice.actions;

export const clusterSelector = (state: {
  solanaCluster: { cluster: SolanaClusterType };
}) => state.solanaCluster.cluster;

export default solanaClusterSlice.reducer;
