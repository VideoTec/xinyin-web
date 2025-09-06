/**
 * @constant
 * @type { string }
 * @description 心印密钥存储文件名称
 */
const SKS_STORE_NAME = 'sks';

/**
 * @type { FileSystemSyncAccessHandle | null }
 * @description 用于同步访问OPFS文件系统中的心印密钥存储文件
 */
let gSksSyncHandle = null;

export async function initOpfs() {
  let opfsRoot = await navigator.storage.getDirectory();
  let sksFileHandle = await opfsRoot.getFileHandle(SKS_STORE_NAME, {
    create: true,
  });
  gSksSyncHandle = await sksFileHandle.createSyncAccessHandle();
}

export function clearSksCache() {
  gSksSyncHandle?.truncate(0); // 清空文件内容
}

/**
 * @param {string} sk - (salt || nonce || encrypted sk) in base64 format
 */
export function saveEncryptedSkBase64(sk) {
  let size = gSksSyncHandle?.getSize();
  let buf = new TextEncoder().encode(sk + '\n'); // 添加换行符以分隔每个密钥
  gSksSyncHandle?.write(buf, { at: size });
  gSksSyncHandle?.flush();
}

/**
 * 从OPFS文件系统中加载解密后的心印密钥列表
 * @returns {string[]} - 返回解密后的心印密钥列表
 */
export function loadEncryptedSks() {
  /** @type {string[]} */
  let sks = [];
  if (!gSksSyncHandle) {
    return sks;
  }
  let size = gSksSyncHandle?.getSize();
  let buf = new ArrayBuffer(size);

  gSksSyncHandle?.read(buf, { at: 0 });

  let sksTxt = new TextDecoder().decode(new Uint8Array(buf));
  sks = sksTxt.split('\n').filter((line) => line.trim() !== ''); // 过滤掉空行

  return sks;
}
