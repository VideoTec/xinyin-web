import { Wallet } from "./wallet";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import { WalletsCtx } from "./walletsCtx";
import Button from "@mui/material/Button";
import { WalletDetail } from "./walletDetail";

export function WalletList() {
  const { wallets, dispatch } = useContext(WalletsCtx);

  function handleAddWallet() {
    const newWallet = {
      address: `0x${Math.random().toString(16).slice(2, 42)}`,
      name: `钱包${wallets.length + 1}`,
    };

    if (wallets.some((wallet) => wallet.address === newWallet.address)) {
      alert("钱包地址已存在，无法添加重复的钱包 " + newWallet.address);
      return;
    }
    dispatch({ type: "add", wallet: newWallet });
  }

  if (!wallets || wallets.length === 0) {
    return (
      <>
        <Button variant="contained" onClick={handleAddWallet}>
          添加钱包
        </Button>
        <Typography variant="h6">没有可用的钱包</Typography>
      </>
    );
  }

  return (
    <>
      <WalletDetail address="" walletName="" type="add" />
      <Button variant="contained" onClick={handleAddWallet}>
        添加钱包
      </Button>
      {wallets.map((wallet) => (
        <Wallet
          address={wallet.address}
          name={wallet.name}
          key={wallet.address}
        />
      ))}
    </>
  );
}
