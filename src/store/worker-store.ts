import { useSyncExternalStore } from 'react';
import sqlite3Api from '../sqlite/sqlite3-main';
import xinyinApi from '../xinyin/xinyin-main';

export enum WorkerStatus {
  Loading,
  Ready,
  Error,
}

export interface WorkerState {
  status: WorkerStatus;
  error: string | null;
}

export interface WorkersState {
  sqlite: WorkerState;
  xinyin: WorkerState;
}

let states: WorkersState = {
  sqlite: {
    status: WorkerStatus.Loading,
    error: null,
  },
  xinyin: {
    status: WorkerStatus.Loading,
    error: null,
  },
};

function getWorkersStateSnapshot(): WorkersState {
  return states;
}

const listeners = [] as Array<(state: WorkersState) => void>;

function subscribeToWorkersState(listener: (state: WorkersState) => void) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}

export function useWorkersState() {
  return useSyncExternalStore(subscribeToWorkersState, getWorkersStateSnapshot);
}

sqlite3Api
  .openDB()
  .then(() => {
    states = {
      ...states,
      sqlite: {
        status: WorkerStatus.Ready,
        error: null,
      },
    };
    listeners.forEach((listener) => listener(states));
  })
  .catch((error) => {
    console.log('Error initializing sqlite3 worker:', error);
    states = {
      ...states,
      sqlite: {
        status: WorkerStatus.Error,
        error: error.message || 'Unknown error',
      },
    };
    listeners.forEach((listener) => listener(states));
  });

xinyinApi
  .init()
  .then(() => {
    states = {
      ...states,
      xinyin: {
        status: WorkerStatus.Ready,
        error: null,
      },
    };
    listeners.forEach((listener) => listener(states));
  })
  .catch((error) => {
    states = {
      ...states,
      xinyin: {
        status: WorkerStatus.Error,
        error: error.message || 'Unknown error',
      },
    };
    listeners.forEach((listener) => listener(states));
  });
