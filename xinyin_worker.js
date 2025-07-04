import xinyin_wasm, {
  import_xinyin_words32,
  generate_xinyin_words32,
  sign_message,
} from "./xinyin_wasm.js";

import { XinYinMessageCode } from "./xinyin_types.js";
import { loadEncryptedSks, clearSksCache } from "./xinyin_opfs.js";

xinyin_wasm()
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
 * @typedef { import('./xinyin_types.js').XinYinMessage } XinYinMessage
 */

self.onmessage = async (/** @type {{data: XinYinMessage}} */ event) => {
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
