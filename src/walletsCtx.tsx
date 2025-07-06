import { createContext, type Dispatch, type ReactNode } from "react";
import { useImmerReducer } from "use-immer";
import {
  type Wallet,
  initWallets,
  type WalletDispatchAction,
  walletsReducer,
} from "./walletsData";

export const WalletsCtx = createContext<{
  wallets: Wallet[];
  dispatch: Dispatch<WalletDispatchAction>;
} | null>(null);

export function WalletsCtxProvider({ children }: { children: ReactNode }) {
  const [wallets, dispatch] = useImmerReducer(walletsReducer, initWallets());

  return <WalletsCtx value={{ wallets, dispatch }}>{children}</WalletsCtx>;
}
