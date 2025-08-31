import xinyin_wasm, {
  import_xinyin_words32,
  generate_xinyin_words32,
  sign_message,
} from './xinyinWasm.js';

import { XinYinMessageCode } from './xinyinTypes.js';
import { loadEncryptedSks, clearSksCache } from './xinyinOPFS.js';

xinyin_wasm({ module_or_path: '../xinyin/xinyinWasm.wasm' })
  .then(() => {
    // setTimeout(() => {
    postMessageToXinyinMain({
      code: XinYinMessageCode.WorkerReady,
      requestId: -1,
    });
    // }, 2000);
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
      if (
        message.txtInHeart === undefined ||
        message.startOf8105 === undefined ||
        message.countFrom8105 === undefined
      ) {
        responseMsg.errorMessage =
          '缺少必要的参数: txtInHeart, startOf8105, countFrom8105';
        break;
      }
      try {
        responseMsg.words32 = generate_xinyin_words32(
          message.txtInHeart,
          message.startOf8105,
          message.countFrom8105
        );
      } catch (/** @type {any} */ error) {
        responseMsg.errorMessage = error;
      }
      break;
    }

    case XinYinMessageCode.ImportWords32: {
      responseMsg.code = XinYinMessageCode.ImportWords32Result;
      if (
        message.words32 === undefined ||
        message.txtInHeart === undefined ||
        message.startOf8105 === undefined ||
        message.countFrom8105 === undefined ||
        message.passphrase === undefined
      ) {
        responseMsg.errorMessage =
          '缺少必要的参数: words32, txtInHeart, startOf8105, countFrom8105, passphrase';
        break;
      }
      try {
        responseMsg.solanaAddress = import_xinyin_words32(
          message.words32,
          message.txtInHeart,
          message.startOf8105,
          message.countFrom8105,
          message.passphrase
        );
      } catch (/** @type {any} */ error) {
        responseMsg.errorMessage = error;
      }
      break;
    }

    case XinYinMessageCode.SignMessage: {
      responseMsg.code = XinYinMessageCode.SignMessageResult;
      if (
        message.solanaAddress === undefined ||
        message.messageUint8 === undefined ||
        message.passphrase === undefined
      ) {
        responseMsg.errorMessage =
          '缺少必要的参数: solanaAddress, messageUint8, passphrase';
        break;
      }
      try {
        responseMsg.signature = /** @type {Uint8Array<ArrayBuffer>} */ (
          sign_message(
            message.solanaAddress,
            message.messageUint8,
            message.passphrase
          )
        );
      } catch (/** @type {any} */ error) {
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
      } catch (/** @type {any} */ error) {
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
