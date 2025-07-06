import { Wallet } from "./wallet";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import { WalletsCtx } from "./wallets_ctx";
import Button from "@mui/material/Button";

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
      <Stack alignItems="center" justifyContent="center" minHeight="100vh">
        <Button variant="contained" onClick={handleAddWallet}>
          添加钱包
        </Button>
        <Typography variant="h6">没有可用的钱包</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} alignItems="center">
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
    </Stack>
  );
}
