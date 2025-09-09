import { post, ApiError, ApiErrorCode } from '../restful/restful-api';
import store from '../store/store';

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

import { objectHasKey } from './utils';

export async function callSolanaRpc<T>(
  method: string,
  params: unknown[]
): Promise<T> {
  const jsonrpc = {
    jsonrpc: '2.0',
    method,
    params,
    id: JsonRpcId++,
  };

  let rpcResponse: JsonRpcResponse<T>;
  const currentCluster = store.getState().solanaCluster.cluster;
  if (currentCluster === 'mainnet-beta') {
    rpcResponse = await post<JsonRpcResponse<T>>('auth/solana-rpc', {
      json: jsonrpc,
    });
  } else {
    const url =
      currentCluster === 'testnet'
        ? 'https://api.testnet.solana.com'
        : 'https://api.devnet.solana.com';

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonrpc),
    });

    if (!response.ok) {
      throw new ApiError(
        `${method} HTTP error! status: ${response.status}`,
        ApiErrorCode.SolanaRpcError
      );
    }
    rpcResponse = (await response.json()) as JsonRpcResponse<T>;
  }

  return parseSolanaRpcResult(rpcResponse);
}

function parseSolanaRpcResult<T>(data: JsonRpcResponse<T>): T {
  if (data.error) {
    throw new ApiError(
      `JSON-RPC error! code: ${data.error.code}, message: ${data.error.message}`,
      ApiErrorCode.SolanaRpcError
    );
  }

  if (!data.result) {
    throw new ApiError(
      `No result in JSON-RPC response`,
      ApiErrorCode.SolanaRpcError
    );
  }

  const result = data.result;

  if (objectHasKey(result, 'value')) {
    return (result as SolanaRpcResult<T>).value;
  }

  return result as T;
}
