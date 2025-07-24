function numberToLEBytes(num: number, byteLength = 4) {
  const buffer = new ArrayBuffer(byteLength);
  const view = new DataView(buffer);
  // 根据需要写入不同位宽
  if (byteLength === 4) {
    view.setUint32(0, num, true); // true表示little-endian
  } else if (byteLength === 2) {
    view.setUint16(0, num, true);
  } else if (byteLength === 8) {
    // 支持大数（BigInt），可以用 setBigUint64
    view.setBigUint64(0, BigInt(num), true);
  } else if (byteLength === 1) {
    view.setUint8(0, num);
  }
  return new Uint8Array(buffer);
}

export function objectHasKey(obj: unknown, key: string): boolean {
  return typeof obj === "object" && obj !== null && key in obj;
}

const SYSTEM_PROGRAM_PUBKEY = new Uint8Array(32);

export function txMessageData(
  from: Uint8Array,
  to: Uint8Array,
  transfer_lamports: number,
  blockhash: Uint8Array
): Uint8Array {
  const message = [1, 0, 1];
  message.push(3); // Number of accounts
  message.push(...from); // From account
  message.push(...to); // To account
  message.push(...SYSTEM_PROGRAM_PUBKEY); // System program account
  message.push(...blockhash); // Blockhash hash

  message.push(1); // Number of instructions
  message.push(2); // (Instruction) program index
  message.push(2); // input account count for instruction
  message.push(0); // input account index for instruction
  message.push(1); // input account index for instruction

  message.push(12); // Instruction data length
  message.push(2); // Instruction data type (transfer)
  message.push(0);
  message.push(0);
  message.push(0); // Instruction type for transfer
  message.push(...numberToLEBytes(transfer_lamports, 8)); // Amount to transfer
  return Uint8Array.from(message);
}

export function byteArrayToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

export function shortSolanaAddress(address: string): string {
  return address.slice(0, 4) + "..." + address.slice(-4);
}

import bs58 from "bs58";
export function isValidSolanaAddress(address: string): boolean {
  try {
    const decoded = bs58.decode(address);
    return decoded.length === 32;
  } catch (error) {
    console.error(`Invalid Solana address(${address}): `, error);
    return false;
  }
}
