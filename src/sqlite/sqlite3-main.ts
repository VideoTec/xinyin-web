import * as Comlink from 'comlink';
import type { SQLite3WorkerApi } from './sqlite3-worker';

const sqlite3Worker = new Worker(
  new URL('./sqlite3-worker.ts', import.meta.url),
  { type: 'module' }
);

sqlite3Worker.onerror = (err) => {
  console.error('sqlite3 Worker error:', err);
};

const api = Comlink.wrap<SQLite3WorkerApi>(sqlite3Worker);

export default api;
