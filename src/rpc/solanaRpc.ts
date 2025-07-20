import { callSolanaRpc } from "./solanaRpcClient";

interface Configuration {
  commitment?: "finalized" | "confirmed" | "processed";
  encoding?: "jsonParsed" | "base64" | "base58" | "base64+zstd";
  minContextSlot?: number;
  dataSlice?: { offset: number; length: number };
}

export interface AccountInfo {
  executable: boolean;
  lamports: number;
  owner: string;
  rentEpoch: number;
  space: number;
  data: string | Array<string>;
}

export function getAccountInfo(address: string, config: Configuration = {}) {
  return callSolanaRpc<AccountInfo | null>("getAccountInfo", [address, config]);
}

export function getBalance(address: string, config: Configuration = {}) {
  return callSolanaRpc<number>("getBalance", [address, config]);
}
