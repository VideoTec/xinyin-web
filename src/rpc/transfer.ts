import bs58 from 'bs58';
import xinyinApi from '../xinyin/xinyin-main';
import { txMessageData, byteArrayToBase64 } from '../utils';
import { getLatestBlockhash, sendTransaction } from './solana-rpc';

export async function transfer(
  from: string,
  to: string,
  transfer_lamports: number,
  psw: string
) {
  const { blockhash } = await getLatestBlockhash();

  const fromBytes = bs58.decode(from);
  const toBytes = bs58.decode(to);
  const blockhashBytes = bs58.decode(blockhash);

  const messageData = txMessageData(
    fromBytes,
    toBytes,
    transfer_lamports,
    blockhashBytes
  );
  const signature = await xinyinApi.signMessage(
    from,
    new Uint8Array(messageData.buffer),
    psw
  );
  const signatureBytes = new Uint8Array(signature);

  const txData = [1]; // signature count
  txData.push(...signatureBytes);
  txData.push(...messageData);
  const txDataBase64 = byteArrayToBase64(Uint8Array.from(txData));

  return sendTransaction(txDataBase64, {
    encoding: 'base64',
  });
}
