import xinyinApi from '../xinyin/xinyin-main.js';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import bs58 from 'https://cdn.jsdelivr.net/npm/bs58@6.0.0/+esm';

const gTextEncoder = new TextEncoder();

xinyinApi
  .init()
  .then(() => {
    const loadingWidget = document.getElementById('loadingWidget');
    if (loadingWidget) {
      loadingWidget.style.display = 'none';
    }
  })
  .catch((error) => {
    const loadingWidget = document.getElementById('loadingWidget');
    if (loadingWidget) {
      loadingWidget.innerText = `Worker启动失败:\n${error.message}`;
    }
  });

/**
 * @param {string} id
 * @returns HTMLInputElement | HTMLTextAreaElement
 */
function getInputElement(id) {
  const inputElement = document.getElementById(id);
  if (
    inputElement instanceof HTMLInputElement ||
    inputElement instanceof HTMLTextAreaElement
  ) {
    return inputElement;
  } else {
    throw new Error(`Input element with id "${id}" not found.`);
  }
}

/**
 * @param {string} id
 * @returns string
 */
function getInputValue(id) {
  const inputElement = getInputElement(id);
  return inputElement.value;
}

const btnGenerateWord32 = document.getElementById('btnGenerateWord32');
const generatedWords32 = document.getElementById('generatedWords32');

if (btnGenerateWord32) {
  btnGenerateWord32.addEventListener('click', async () => {
    try {
      let txtInHeart = getInputValue('inputTxtInHeart');

      let startOf8105 = Number(getInputValue('inputStartOf8105'));
      if (isNaN(startOf8105)) {
        throw new Error('Start of 8105 must be a valid number.');
      }

      let countIn8105 = Number(getInputValue('inputCountIn8105'));
      if (isNaN(countIn8105)) {
        throw new Error('Count in 8105 must be a valid number.');
      }

      const words32 = await xinyinApi.generateWords32(
        txtInHeart,
        startOf8105,
        countIn8105
      );
      if (generatedWords32) generatedWords32.innerText = words32;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      alert(`Error: ${error && error.message}`);
    }
  });
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
document
  .getElementById('btnImportWords32')
  .addEventListener('click', async () => {
    try {
      let txtInHeart = getInputValue('inputTxtInHeart');

      let startOf8105 = Number(getInputValue('inputStartOf8105'));
      if (isNaN(startOf8105)) {
        throw new Error('Start of 8105 must be a valid number.');
      }

      let countIn8105 = Number(getInputValue('inputCountIn8105'));
      if (isNaN(countIn8105)) {
        throw new Error('Count in 8105 must be a valid number.');
      }

      let inputWords32 = getInputValue('inputWords32').trim();
      if (inputWords32.length !== 32) {
        throw new Error('Input words32 must be exactly 32 characters long.');
      }

      let psw = getInputValue('inputPassword').trim();

      let address = await xinyinApi.importWords32(
        inputWords32,
        txtInHeart,
        startOf8105,
        countIn8105,
        psw
      );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      document.getElementById('solanaAddress').innerText = address;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      alert(`Error: ${error.message}`);
    }
  });

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
document.getElementById('btnListSks').addEventListener('click', () => {
  xinyinApi
    .loadEncryptedSks()
    .then((sks) => {
      const sksList = document.getElementById('sksList');
      if (!sksList) return;
      if (!sks || sks.length === 0) {
        sksList.innerHTML = '<li>本地存储的密钥列表将显示在这里...</li>';
      } else {
        sksList.innerHTML = '';
        sks.forEach((sk) => {
          const li = document.createElement('li');
          li.textContent = sk;
          sksList.appendChild(li);
        });
      }
    })
    .catch((error) => {
      alert(`Error listing SKs: ${error.message}`);
    });
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
document.getElementById('btnClearSks').addEventListener('click', () => {
  xinyinApi
    .clearSksCache()
    .then(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      document.getElementById('btnListSks').click(); // Clear the displayed list
    })
    .catch((error) => {
      alert(`Error clearing SKs cache: ${error.message}`);
    });
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
document
  .getElementById('btnSignMessage')
  .addEventListener('click', async () => {
    try {
      const message = getInputValue('signRawMessage').trim();
      const address = getInputValue('signAddress').trim();
      const skPsw = getInputValue('signSkPsw').trim();
      if (message.length === 0) {
        alert('请输入要签名的消息。');
        return;
      }
      const messageBuff = gTextEncoder.encode(message);
      let signResult = await xinyinApi.signMessage(address, messageBuff, skPsw);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      document.getElementById('signResult').innerText = bs58.encode(
        new Uint8Array(signResult)
      );
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      alert(`Error sign message: ${error.message}`);
    }
  });

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
document
  .getElementById('btnVerifySignature')
  .addEventListener('click', async () => {
    try {
      const message = getInputValue('signRawMessage').trim();
      const address = getInputValue('signAddress').trim();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const signature = document.getElementById('signResult').innerText.trim();
      let verifyResult = await verifySignature(
        address,
        signature,
        gTextEncoder.encode(message).buffer
      );
      if (verifyResult) {
        alert('签名验证成功！');
      } else {
        alert('签名验证失败！');
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      alert(`Error verifying signature: ${error.message}`);
    }
  });

/**
 *
 * @param {HTMLElement} element
 */
function selectText(element) {
  const range = document.createRange();
  range.selectNodeContents(element);

  const sel = window.getSelection();
  if (sel === null) return;
  sel.removeAllRanges();
  sel.addRange(range);
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
document
  .getElementById('generatedWords32')
  .addEventListener('click', function () {
    selectText(this);
  });

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
document.getElementById('solanaAddress').addEventListener('click', function () {
  selectText(this);
});

/**
 *
 * @param {string} publicKey
 * @param {string} signature
 * @param {ArrayBuffer} message
 * @returns
 */
async function verifySignature(publicKey, signature, message) {
  const publicKeyUint8 = bs58.decode(publicKey);
  const signatureUint8 = bs58.decode(signature);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    publicKeyUint8,
    { name: 'Ed25519' },
    false,
    ['verify']
  );
  return await crypto.subtle.verify(
    { name: 'Ed25519' },
    cryptoKey,
    signatureUint8,
    message
  );
}
