import * as Comlink from 'comlink';
import type { XinyinWorkerApi } from './xinyin-worker';

const xinyin_worker = new Worker(
  new URL('./xinyin-worker.ts', import.meta.url),
  {
    type: 'module',
  }
);

export default Comlink.wrap<XinyinWorkerApi>(xinyin_worker);
