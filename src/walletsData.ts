export interface Wallet {
  address: string;
  name: string;
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

// 异步localStorage操作，避免阻塞主线程
function setItemAsync(key: string, value: string) {
  return new Promise<void>((resolve) => {
    // 使用 requestIdleCallback 或 setTimeout 来避免阻塞
    const callback = () => {
      try {
        localStorage.setItem(key, value);
        resolve();
      } catch (error) {
        console.error("localStorage.setItem failed:", error);
        resolve(); // 即使失败也要resolve，避免阻塞
      }
    };

    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(callback);
    } else {
      setTimeout(callback, 0);
    }
  });
}

function removeItemAsync(key: string) {
  return new Promise<void>((resolve) => {
    const callback = () => {
      try {
        localStorage.removeItem(key);
        resolve();
      } catch (error) {
        console.error("localStorage.removeItem failed:", error);
        resolve();
      }
    };

    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(callback);
    } else {
      setTimeout(callback, 0);
    }
  });
}

function clearAsync() {
  return new Promise<void>((resolve) => {
    const callback = () => {
      try {
        localStorage.clear();
        resolve();
      } catch (error) {
        console.error("localStorage.clear failed:", error);
        resolve();
      }
    };

    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(callback);
    } else {
      setTimeout(callback, 0);
    }
  });
}

export function walletsReducer(
  draft: Wallet[],
  action: WalletDispatchAction
): Wallet[] {
  switch (action.type) {
    case "add": {
      const existingIndex = draft.findIndex(
        (wallet) => wallet.address === action.wallet.address
      );
      if (existingIndex !== -1) {
        console.warn(
          `Wallet with address ${action.wallet.address} already exists.`
        );
        return draft; // 如果已存在，直接返回当前状态
      }
      const w = action.wallet;
      draft.push(w);
      // 异步更新localStorage，不阻塞UI
      setItemAsync(w.address, w.name).catch(console.error);
      break;
    }
    case "delete": {
      removeItemAsync(action.address).catch(console.error);
      return draft.filter((wallet) => wallet.address !== action.address);
    }
    case "clear": {
      clearAsync().catch(console.error);
      draft.length = 0;
      break;
    }
    case "modify": {
      const index = draft.findIndex(
        (wallet) => wallet.address === action.wallet.address
      );
      if (index !== -1) {
        draft[index] = action.wallet;
        setItemAsync(action.wallet.address, action.wallet.name).catch(
          console.error
        );
      }
      break;
    }
  }
  return draft;
}
