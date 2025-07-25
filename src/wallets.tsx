import { Wallet } from "./wallet";
import { useContext } from "react";
import { WalletsCtx } from "./walletsCtx";
import Typography from "@mui/material/Typography";
import Gride from "@mui/material/Grid";

export function WalletList() {
  const { wallets } = useContext(WalletsCtx)!;

  return (
    <>
      {(!wallets || wallets.length === 0) && (
        <Typography variant="h6" sx={{ textAlign: "center" }}>
          没有可用的钱包
        </Typography>
      )}
      {wallets && wallets.length > 0 && (
        <Gride container spacing={1}>
          {wallets.map((wallet) => (
            <Gride key={wallet.address} size={{ xs: 12, md: 4 }}>
              <Wallet
                address={wallet.address}
                name={wallet.name}
                key={wallet.address}
              />
            </Gride>
          ))}
        </Gride>
      )}
    </>
  );
}
