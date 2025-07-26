import { createContext, type Dispatch } from "react";
import { type Wallet, type WalletDispatchAction } from "./walletsData";

export const WalletsCtx = createContext<{
  wallets?: Wallet[];
  dispatch: Dispatch<WalletDispatchAction>;
} | null>(null);
