import { Wallet } from "./wallet";
import { useContext } from "react";
import { WalletsCtx } from "./walletsCtx";
import { ImportWords32Icon, GenerateWords32Icon } from "./icons";
import { useRegisterSW } from "virtual:pwa-register/react";
import Typography from "@mui/material/Typography";
import Gride from "@mui/material/Grid";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import WalletDlg from "./walletDlg";
import XinyinDlg from "./xinyinDlg";
import AddIcon from "@mui/icons-material/Add";

// TODO : speedDial 按钮，关闭时，弹出，添加钱包对话框，类似 x 的发帖效果
export function WalletList() {
  const { wallets } = useContext(WalletsCtx)!;
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: false,
  });

  return (
    <>
      <Collapse in={needRefresh}>
        <Alert
          action={<Button onClick={() => updateServiceWorker()}>刷新</Button>}
          sx={{ mb: 2 }}
        >
          有新版本可用
        </Alert>
      </Collapse>
      <Snackbar
        open={offlineReady}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
        onClose={() => setOfflineReady(false)}
        message="应用安装完成！现在可以离线使用了"
      />
      <SpeedDial
        ariaLabel="SpeedDial actions"
        sx={{ position: "fixed", right: 32, bottom: 18 }}
        icon={<SpeedDialIcon />}
        FabProps={{ color: "primary" }}
        direction="up"
      >
        <SpeedDialAction
          icon={
            <WalletDlg type="add">
              {({ triggerOpen }) => <AddIcon onClick={triggerOpen} />}
            </WalletDlg>
          }
          slotProps={{ tooltip: { placement: "left", title: "添加钱包" } }}
        />
        <SpeedDialAction
          icon={
            <XinyinDlg type="import">
              {({ triggerOpen }) => <ImportWords32Icon onClick={triggerOpen} />}
            </XinyinDlg>
          }
          slotProps={{
            tooltip: { placement: "left", title: "导入助记词" },
          }}
        />
        <SpeedDialAction
          icon={
            <XinyinDlg type="generate">
              {({ triggerOpen }) => (
                <GenerateWords32Icon color="action" onClick={triggerOpen} />
              )}
            </XinyinDlg>
          }
          slotProps={{
            tooltip: { placement: "left", title: "生成助记词" },
          }}
        />
      </SpeedDial>
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
