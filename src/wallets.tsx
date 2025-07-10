import { Wallet } from "./wallet";
import Typography from "@mui/material/Typography";
import { useContext } from "react";
import { WalletsCtx } from "./walletsCtx";
import { WalletDetailDialog } from "./walletDetail";
import { XinyinDlg } from "./xinyinDlg";
import AddIcon from "@mui/icons-material/Add";
import ImportExport from "@mui/icons-material/ImportExport";
import Fab from "@mui/material/Fab";
import Box from "@mui/material/Box";

export function WalletList() {
  const { wallets } = useContext(WalletsCtx);

  return (
    <>
      <Box sx={{ position: "fixed", right: 32, bottom: 32 }}>
        <WalletDetailDialog
          type="add"
          openBtn={
            <Fab color="primary">
              <AddIcon />
            </Fab>
          }
        />
        <XinyinDlg>
          {({ onClick }) => (
            <Fab color="primary" onClick={onClick}>
              <ImportExport />
            </Fab>
          )}
        </XinyinDlg>
      </Box>
      {(!wallets || wallets.length === 0) && (
        <Typography variant="h6">没有可用的钱包</Typography>
      )}
      {wallets.length > 0 &&
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
