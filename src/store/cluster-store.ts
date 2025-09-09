import { useSyncExternalStore } from 'react';
import { SolanaClusterType } from '../types/common';

const CLUSTER_STORAGE_KEY = 'solanaCluster';

const loadClusterFromStorage = () => {
  const storedCluster = localStorage.getItem(CLUSTER_STORAGE_KEY);
  return storedCluster
    ? (storedCluster as SolanaClusterType)
    : SolanaClusterType.devnet;
};

const saveClusterToStorage = (cluster: SolanaClusterType) => {
  localStorage.setItem(CLUSTER_STORAGE_KEY, cluster);
};

let cluster: SolanaClusterType = loadClusterFromStorage();

export function getClusterStateSnapshot() {
  return cluster;
}

const listeners = [] as Array<(state: SolanaClusterType) => void>;

function subscribeToClusterState(listener: (state: SolanaClusterType) => void) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}

export function useClusterState() {
  return useSyncExternalStore(subscribeToClusterState, getClusterStateSnapshot);
}

export function setCluster(newCluster: SolanaClusterType) {
  cluster = newCluster;
  saveClusterToStorage(newCluster);
  listeners.forEach((listener) => listener(cluster));
}
