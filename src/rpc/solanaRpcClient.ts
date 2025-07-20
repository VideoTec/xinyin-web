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
  result?: SolanaRpcResult<T>;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
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

  const response = await fetch("https://api.devnet.solana.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jsonrpc),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = (await response.json()) as JsonRpcResponse<T>;
  if (data.error) {
    throw new Error(
      `JSON-RPC error! code: ${data.error.code}, message: ${data.error.message}`
    );
  }
  if (!data.result) {
    throw new Error("No result in JSON-RPC response");
  }
  return data.result.value;
}
