import { Wallet } from "./wallet";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import { WalletsCtx } from "./walletsCtx";

export function WalletList() {
  const { wallets } = useContext(WalletsCtx)!;

  return (
    <>
      {(!wallets || wallets.length === 0) && (
        <Typography variant="h6" sx={{ textAlign: "center" }}>
          没有可用的钱包
        </Typography>
      )}
      {wallets &&
        wallets.length > 0 &&
        wallets.map((wallet) => (
          <Wallet
            address={wallet.address}
            name={wallet.name}
            key={wallet.address}
          />
        ))}
    </>
  );
}
