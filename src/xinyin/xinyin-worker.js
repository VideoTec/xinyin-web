import xinyin_module_init, {
  import_xinyin_words32,
  generate_xinyin_words32,
  sign_message,
} from './xinyin-wasm.js';

import { loadEncryptedSks, clearSksCache, initOpfs } from './xinyin-opfs.js';

import * as comlink from 'comlink';

async function init() {
  await initOpfs();
  await xinyin_module_init({ module_or_path: '../xinyin/xinyin-wasm.wasm' });
  return true;
}

/**
 * @typedef {Object} XinyinApi
 * @property {function(): Promise<boolean>} init
 * @property {function(string, string, number, number, string): Promise<string>} importWords32
 * @property {function(string, number, number): Promise<string>} generateWords32
 * @property {function(string, Uint8Array<ArrayBufferLike>, string): Promise<Uint8Array>} signMessage
 * @property {function(): Promise<string[]>} loadEncryptedSks
 * @property {function(): Promise<void>} clearSksCache
 */

comlink.expose({
  init,
  importWords32: import_xinyin_words32,
  generateWords32: generate_xinyin_words32,
  signMessage: sign_message,
  loadEncryptedSks,
  clearSksCache,
});
