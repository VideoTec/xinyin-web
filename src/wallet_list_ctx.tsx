import { createContext, type Dispatch, type ReactNode } from "react";
import { useImmerReducer } from "use-immer";
import {
  type Wallet,
  initWallets,
  type WalletDispatchAction,
  walletsReducer,
} from "./wallet_data";

export const WalletListCtx = createContext<{
  wallets: Wallet[];
  dispatch: Dispatch<WalletDispatchAction>;
} | null>(null);

export function WalletListProvider({ children }: { children: ReactNode }) {
  const [wallets, dispatch] = useImmerReducer(walletsReducer, initWallets());

  return (
    <WalletListCtx value={{ wallets, dispatch }}>{children}</WalletListCtx>
  );
}
