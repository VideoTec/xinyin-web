import * as Comlink from 'comlink';

const xinyin_worker = new Worker(
  new URL('./xinyin-worker.js', import.meta.url),
  {
    type: 'module',
  }
);

/** @type {import('./xinyin-worker.js').XinyinApi} */
export default Comlink.wrap(xinyin_worker);
