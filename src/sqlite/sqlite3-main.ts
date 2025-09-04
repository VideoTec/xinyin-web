const sqlite3Worker = new Worker(
  new URL('./sqlite3-worker.ts', import.meta.url),
  { type: 'module' }
);
