import xinyin_module_init, {
  import_xinyin_words32,
  generate_xinyin_words32,
  sign_message,
} from './xinyin-wasm';

import { loadEncryptedSks, clearSksCache, initOpfs } from './xinyin-opfs';

import * as comlink from 'comlink';

async function init() {
  await initOpfs();
  await xinyin_module_init({ module_or_path: '../xinyin-wasm.wasm' });
  return true;
}

const api = {
  init,
  importWords32: import_xinyin_words32,
  generateWords32: generate_xinyin_words32,
  signMessage: sign_message,
  loadEncryptedSks,
  clearSksCache,
};

export type XinyinWorkerApi = typeof api;

comlink.expose(api);
