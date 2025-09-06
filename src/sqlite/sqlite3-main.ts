import * as Comlink from 'comlink';

const sqlite3Worker = new Worker(
  new URL('./sqlite3-worker.ts', import.meta.url),
  { type: 'module' }
);

sqlite3Worker.onerror = (err) => {
  console.error('sqlite3 Worker error:', err);
};

export interface SQLite3WorkerApi {
  openDB: () => Promise<void>;
  upsertWalletAddress: (
    address: string,
    balance: number,
    cluster: string,
    hasKey?: boolean,
    isMine?: boolean
  ) => Promise<void>;
  getWalletsOfCluster: (cluster: string) => Promise<void>;
}

const api = Comlink.wrap<SQLite3WorkerApi>(sqlite3Worker);

export default api;
