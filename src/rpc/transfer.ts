import bs58 from "bs58";
import { signMessage } from "../xinyin/xinyinMain";
import { txMessageData, byteArrayToBase64 } from "./utils";
import {
  getLatestBlockhash,
  sendTransaction,
  getSignatureStatuses,
  type SignatureStatus,
} from "./solanaRpc";

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
  const signature = await signMessage(
    from,
    messageData.buffer as ArrayBuffer,
    psw
  );
  const signatureBytes = new Uint8Array(signature);

  const txData = [1]; // signature count
  txData.push(...signatureBytes);
  txData.push(...messageData);
  const txDataBase64 = byteArrayToBase64(Uint8Array.from(txData));

  return sendTransaction(txDataBase64, {
    encoding: "base64",
  });
}

//TODO : 设置超时机制
export function loopGetTransferStatus(
  transferID: string,
  onProgress: (status: SignatureStatus) => void,
  onStopped: (error?: string) => void,
  interval: number = 1000
) {
  let stopped = false;

  async function poll() {
    if (stopped) {
      onStopped();
      return;
    }
    try {
      const statuses = await getSignatureStatuses([transferID], {
        searchTransactionHistory: false,
      });

      if (statuses[0]?.confirmationStatus === "finalized") {
        onStopped();
        stopped = true;
      } else if (statuses[0]?.err) {
        //TODO 解析 InstructionError 类型
        onStopped(`Transfer failed: ${statuses[0].err}`);
        stopped = true;
      } else {
        if (statuses[0]) {
          onProgress(statuses[0]);
        }
        setTimeout(poll, interval);
      }
    } catch (error) {
      console.error("Error fetching transfer status:", error);
      setTimeout(poll, interval);
    }
  }

  poll();

  return () => {
    stopped = true;
  };
}
