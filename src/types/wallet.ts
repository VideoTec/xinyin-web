import type { SolanaClusterType } from './common';

export interface Wallet {
  $address: string;
  $name?: string;
  $cluster?: SolanaClusterType;
  $balance?: number;
  $hasKey?: boolean;
  $isMine?: boolean;
}
