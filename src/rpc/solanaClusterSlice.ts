import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export enum SolanaClusterType {
  'mainnetBeta' = 'mainnet-beta',
  'devnet' = 'devnet',
  'testnet' = 'testnet',
}

const CLUSTER_STORAGE_KEY = 'solanaCluster';

const loadClusterFromStorage = () => {
  const storedCluster = localStorage.getItem(CLUSTER_STORAGE_KEY);
  return storedCluster
    ? (JSON.parse(storedCluster) as SolanaClusterType)
    : SolanaClusterType.devnet;
};

const saveClusterToStorage = (cluster: SolanaClusterType) => {
  localStorage.setItem(CLUSTER_STORAGE_KEY, JSON.stringify(cluster));
};

const initialState = {
  cluster: loadClusterFromStorage(),
};

export const solanaClusterSlice = createSlice({
  name: 'solanaCluster',
  initialState,
  reducers: {
    setCluster(state, action: PayloadAction<SolanaClusterType>) {
      state.cluster = action.payload;
      saveClusterToStorage(action.payload);
    },
  },
});

export const { setCluster } = solanaClusterSlice.actions;

export const clusterSelector = (state: {
  solanaCluster: { cluster: SolanaClusterType };
}) => state.solanaCluster.cluster;

export default solanaClusterSlice.reducer;
