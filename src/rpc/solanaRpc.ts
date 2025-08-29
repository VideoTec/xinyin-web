import { callSolanaRpc } from './solanaRpcClient';

export type CommitmentType = 'finalized' | 'confirmed' | 'processed';

interface Configuration {
  commitment?: CommitmentType;
  encoding?: 'jsonParsed' | 'base64' | 'base58' | 'base64+zstd';
  minContextSlot?: number;
  dataSlice?: { offset: number; length: number };
  skipPreflight?: boolean;
  preflightCommitment?: CommitmentType;
  maxRetries?: number;
  /** limit return transactions count */
  limit?: number;
  /** return transactions before this signature */
  before?: string;
  /** return transactions until this signature */
  until?: string;
  /**  a Solana node will search its ledger cache for any signatures not found in the recent status cache */
  searchTransactionHistory?: boolean;
}

export interface AccountInfo {
  executable: boolean;
  lamports: number;
  /** 账号拥有者，如：11111111111111111111111111111111 */
  owner: string;
  rentEpoch: number;
  space: number;
  data: string | Array<string>;
}

export function getAccountInfo(address: string, config: Configuration = {}) {
  return callSolanaRpc<AccountInfo | null>('getAccountInfo', [address, config]);
}

export function getBalance(address: string, config: Configuration = {}) {
  return callSolanaRpc<number>('getBalance', [address, config]);
}

export function getLatestBlockhash(config: Configuration = {}) {
  return callSolanaRpc<{ blockhash: string; lastValidBlockHeight: number }>(
    'getLatestBlockhash',
    [config]
  );
}

export function sendTransaction(
  transactionData: string,
  config: Configuration = {}
) {
  return callSolanaRpc<string>('sendTransaction', [transactionData, config]);
}

export interface TransactionObject {
  signature: string;
  slot: number;
  err?: { InstructionError: [number, string] } | null;
  memo?: string;
  blockTime: number | null;
  confirmationStatus: CommitmentType | null;
}

export function getSignaturesForAddress(
  address: string,
  config: Configuration = {}
) {
  return callSolanaRpc<Array<TransactionObject>>('getSignaturesForAddress', [
    address,
    config,
  ]);
}

export interface SignatureStatus {
  err?: { InstructionError: [number, string] } | null;
  confirmationStatus: CommitmentType | null;
  confirmations: number | null;
  slot: number | null;
  status:
    | {
        Ok: null;
      }
    | {
        Err: { InstructionError: [number, string] };
      };
}

export function getSignatureStatuses(
  signatures: string[],
  config: Configuration = {}
) {
  return callSolanaRpc<Array<SignatureStatus>>('getSignatureStatuses', [
    signatures,
    config,
  ]);
}
