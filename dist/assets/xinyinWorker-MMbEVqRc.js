/**
 * @constant
 * @type { string }
 * @description 心印密钥存储文件名称
 */
const SKS_STORE_NAME = "sks";

/**
 * @type { FileSystemSyncAccessHandle }
 * @description 用于同步访问OPFS文件系统中的心印密钥存储文件
 */
const gSksSyncHandle = await (async function () {
  let opfsRoot = await navigator.storage.getDirectory();
  let sksFileHandle = await opfsRoot.getFileHandle(SKS_STORE_NAME, {
    create: true,
  });
  return await sksFileHandle.createSyncAccessHandle();
})();

function clearSksCache() {
  gSksSyncHandle.truncate(0); // 清空文件内容
}

/**
 * @param {string} sk - (salt || nonce || encrypted sk) in base64 format
 */
function saveEncryptedSkBase64(sk) {
  let size = gSksSyncHandle.getSize();
  let buf = new TextEncoder().encode(sk + "\n"); // 添加换行符以分隔每个密钥
  gSksSyncHandle.write(buf, { at: size });
  gSksSyncHandle.flush();
}

/**
 * 从OPFS文件系统中加载解密后的心印密钥列表
 * @returns {string[]} - 返回解密后的心印密钥列表
 */
function loadEncryptedSks() {
  let size = gSksSyncHandle.getSize();
  let buf = new ArrayBuffer(size);

  gSksSyncHandle.read(buf, { at: 0 });

  let sksTxt = new TextDecoder().decode(new Uint8Array(buf));
  let sks = sksTxt.split("\n").filter((line) => line.trim() !== ""); // 过滤掉空行

  return sks;
}

// @ts-nocheck

let wasm;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_2.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let WASM_VECTOR_LEN = 0;

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); }
function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_2.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}
/**
 * @param {string} address
 * @param {Uint8Array} message
 * @param {string} psw
 * @returns {Uint8Array}
 */
function sign_message(address, message, psw) {
    const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(psw, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.sign_message(ptr0, len0, ptr1, len1, ptr2, len2);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v4;
}

/**
 * @param {string} words32
 * @param {string} txt_in_heart
 * @param {number} start
 * @param {number} count
 * @param {string} psw
 * @returns {string}
 */
function import_xinyin_words32(words32, txt_in_heart, start, count, psw) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passStringToWasm0(words32, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(txt_in_heart, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(psw, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.import_xinyin_words32(ptr0, len0, ptr1, len1, start, count, ptr2, len2);
        var ptr4 = ret[0];
        var len4 = ret[1];
        if (ret[3]) {
            ptr4 = 0; len4 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred5_0 = ptr4;
        deferred5_1 = len4;
        return getStringFromWasm0(ptr4, len4);
    } finally {
        wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
    }
}

/**
 * @param {string} txt_in_heart
 * @param {number} start
 * @param {number} count
 * @returns {string}
 */
function generate_xinyin_words32(txt_in_heart, start, count) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(txt_in_heart, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.generate_xinyin_words32(ptr0, len0, start, count);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_getRandomValues_3c9c0d586e575a16 = function() { return handleError(function (arg0, arg1) {
        globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
    }, arguments) };
    imports.wbg.__wbg_loadEncryptedSks_bc4fb8cc4e1e00ef = function(arg0) {
        const ret = loadEncryptedSks();
        const ptr1 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_saveEncryptedSkBase64_548607f5d2c7d1c7 = function(arg0, arg1) {
        saveEncryptedSkBase64(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_export_2;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path);
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead');
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL("xinyinWasm_bg.wasm", import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

/**
 * @enum { string }
 */
const XinYinMessageCode = {
  /** 生成随机密钥，返回心印助记字（32个汉字） */
  GenerateWords32: "generate-words32",
  GenerateWords32Result: "words32-generated-result",
  /** 导入心印助记字，返回Solana地址 */
  ImportWords32: "import-words32",
  ImportWords32Result: "words32-imported-result",
  /** 签名消息，返回签名结果 */
  SignMessage: "sign-message",
  SignMessageResult: "message-signed-result",
  /** 导入的密钥列表 */
  ListSks: "list-sks",
  ListSksResult: "sks-listed-result",
  /** 清理缓存 */
  ClearSksCache: "clear-sks-cache",
  ClearSksCacheResult: "sks-cache-cleared-result",
  /** worker 准备就绪 */
  WorkerReady: "worker-ready",
  /** 未知消息类型 */
  Unknown: "unknown",
};

/**
 * @typedef { Object } XinYinMessage
 * @property { XinYinMessageCode } code - The message code.
 * @property { number} requestId
 *  - The request ID for tracking.
 *  - if requestId is -1, wihtout requestId, because the message is sending from the worker.
 * @property { string } [txtInHeart] - 心印文本.
 * @property { number } [startOf8105] - The starting index for charset-8105.
 * @property { number } [countFrom8105] - The count of chars retrieved from charset-8105.
 * @property { string } [words32] - 心印助记字（32个汉字）.
 * @property { string } [passphrase] - The passphrase for encryption.
 * @property { string } [solanaAddress] - The Solana address.
 * @property { Uint8Array } [messageUint8] - The message to be signed, as a Uint8Array.
 * @property { Uint8Array } [signature] - The signature of the message, as a Uint8Array.
 * @property { Array.<string> } [sks] - The secret key in base58 format.
 * @property { string } [errorMessage] - The error message, if any.
 */

__wbg_init({ module_or_path: "../xinyin/xinyinWasm.wasm" })
  .then(() => {
    postMessageToXinyinMain({
      code: XinYinMessageCode.WorkerReady,
      requestId: -1,
    });
  })
  .catch((err) => {
    postMessageToXinyinMain({
      code: XinYinMessageCode.WorkerReady,
      requestId: -1,
      errorMessage: `初始化 wasm 模块失败: ${err}`,
    });
  });

/**
 * @typedef { import('./xinyinTypes.js').XinYinMessage } XinYinMessage
 */

self.onmessage = (/** @type {{data: XinYinMessage}} */ event) => {
  onXinYinMessage(event.data);
};

/** * 发送消息到心印主线程
 * @param { XinYinMessage } message
 */
function postMessageToXinyinMain(message) {
  self.postMessage(message);
}

/**
 * @param { XinYinMessage } message
 */
function onXinYinMessage(message) {
  /** @type { XinYinMessage } */
  let responseMsg = {
    code: XinYinMessageCode.Unknown,
    requestId: message.requestId,
  };

  switch (message.code) {
    case XinYinMessageCode.GenerateWords32: {
      responseMsg.code = XinYinMessageCode.GenerateWords32Result;
      try {
        responseMsg.words32 = generate_xinyin_words32(
          message.txtInHeart,
          message.startOf8105,
          message.countFrom8105
        );
      } catch (error) {
        responseMsg.errorMessage = error;
      }
      break;
    }

    case XinYinMessageCode.ImportWords32: {
      responseMsg.code = XinYinMessageCode.ImportWords32Result;
      try {
        responseMsg.solanaAddress = import_xinyin_words32(
          message.words32,
          message.txtInHeart,
          message.startOf8105,
          message.countFrom8105,
          message.passphrase
        );
      } catch (error) {
        responseMsg.errorMessage = error;
      }
      break;
    }

    case XinYinMessageCode.SignMessage: {
      responseMsg.code = XinYinMessageCode.SignMessageResult;
      try {
        responseMsg.signature = sign_message(
          message.solanaAddress,
          message.messageUint8,
          message.passphrase
        );
      } catch (error) {
        responseMsg.errorMessage = error;
      }
      break;
    }

    case XinYinMessageCode.ClearSksCache: {
      responseMsg.code = XinYinMessageCode.ClearSksCacheResult;
      clearSksCache();
      break;
    }

    case XinYinMessageCode.ListSks: {
      responseMsg.code = XinYinMessageCode.ListSksResult;
      try {
        responseMsg.sks = loadEncryptedSks();
      } catch (error) {
        responseMsg.errorMessage = error;
      }
      break;
    }

    default: {
      responseMsg.errorMessage = `未知的消息类型: ${message.code}`;
    }
  }

  self.postMessage(responseMsg);
}
//# sourceMappingURL=xinyinWorker-MMbEVqRc.js.map
