export interface Wallet {
    address: string,
    name: string
}

export function initWallets(): Wallet[] {
    const wallets: Wallet[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const address = localStorage.key(i);
        if (address) {
            const name = localStorage.getItem(address) || "";
            wallets.push({ address, name });
        }
    }
    return wallets;
}

export type WalletDispatchAction =
  | {
      type: "clear";
    }
  | {
      type: "add";
      wallet: Wallet;
    }
  | {
      type: "delete";
      address: string;
    }
  | {
      type: "modify";
      wallet: Wallet;
    };

export function walletsReducer(
  draft: Wallet[],
  action: WalletDispatchAction
): Wallet[] {
  switch (action.type) {
    case "add": {
      const w = action.wallet;
      draft.push(w);
      localStorage.setItem(w.address, w.name);
      break;
    }
    case "delete": {
      localStorage.removeItem(action.address);
      return draft.filter((wallet) => wallet.address !== action.address);
    }
    case "clear": {
      draft.length = 0; // 清空钱包列表
      break;
    }
    case "modify": {
      const index = draft.findIndex(
        (wallet) => wallet.address === action.wallet.address
      );
      if (index !== -1) {
        draft[index] = action.wallet;
      }
      break;
    }
  }
  return draft;
}