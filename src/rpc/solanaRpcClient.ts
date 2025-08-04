let JsonRpcId = 0;

interface SolanaRpcResult<T> {
  context: {
    slot: number;
    apiVersion: string;
  };
  value: T;
}

interface JsonRpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: SolanaRpcResult<T> | T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

import { objectHasKey } from "./utils";

export enum SolanaClusterType {
  "mainnetBeta" = "mainnet-beta",
  "devnet" = "devnet",
  "testnet" = "testnet",
}
let currentCluster: SolanaClusterType = SolanaClusterType.devnet;

export function getCurrentCluster(): SolanaClusterType {
  return currentCluster;
}

export function setSolanaCluster(cluster: SolanaClusterType) {
  currentCluster = cluster;
}

export async function callSolanaRpc<T>(
  method: string,
  params: unknown[]
): Promise<T> {
  const jsonrpc = {
    jsonrpc: "2.0",
    method,
    params,
    id: JsonRpcId++,
  };

  const url =
    currentCluster === "mainnet-beta"
      ? "https://dry-silence-6b88.wangxiangc.workers.dev/"
      : currentCluster === "testnet"
      ? "https://api.testnet.solana.com"
      : "https://api.devnet.solana.com";

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    referrerPolicy: "no-referrer",
    body: JSON.stringify(jsonrpc),
  });

  if (!response.ok) {
    throw new Error(`${method} HTTP error! status: ${response.status}`);
  }

  const data = (await response.json()) as JsonRpcResponse<T>;
  if (!data) {
    throw new Error(`No data in JSON-RPC ${method} response`);
  }

  if (data.error) {
    throw new Error(
      `JSON-RPC ${method} error! code: ${data.error.code}, message: ${data.error.message}`
    );
  }

  if (!data.result) {
    throw new Error(`No result in JSON-RPC ${method} response`);
  }

  const result = data.result;

  if (objectHasKey(result, "value")) {
    return (result as SolanaRpcResult<T>).value;
  }

  //TODO handle non-value result
  return result as T;
}
