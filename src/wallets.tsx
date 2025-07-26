import { Wallet } from "./wallet";
import { useContext, useEffect, useRef, useState } from "react";
import { WalletsCtx } from "./walletsCtx";
// import { ImportWords32Icon, GenerateWords32Icon } from "./icons";
import { useRegisterSW } from "virtual:pwa-register/react";
import Typography from "@mui/material/Typography";
import Gride from "@mui/material/Grid";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import WalletDlg from "./walletDlg";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import Divider from "@mui/material/Divider";

export function WalletList() {
  const { wallets } = useContext(WalletsCtx)!;
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: false,
  });
  const [showDivider, setShowDivider] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const gridElement = gridRef.current;
    if (!gridElement) return;

    const observer = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        const entry = entries[0];
        const gridHeight = entry.contentRect.height;
        const screenHeight = window.innerHeight;
        setShowDivider(gridHeight > screenHeight - 120);
      }
    });

    observer.observe(gridElement);

    return () => {
      observer.disconnect();
    };
  }, []);

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
      <Fab sx={{ position: "fixed", right: 16, bottom: 16 }}>
        <WalletDlg type="add">
          {({ triggerOpen }) => (
            <AddIcon onClick={triggerOpen} color="primary" />
          )}
        </WalletDlg>
      </Fab>
      {(!wallets || wallets.length === 0) && (
        <Typography variant="h6" sx={{ textAlign: "center" }}>
          没有可用的钱包
        </Typography>
      )}
      {wallets && wallets.length > 0 && (
        <Gride container spacing={1} width={"100%"} ref={gridRef}>
          {wallets.map((wallet) => (
            <Gride key={wallet.address} size={{ xs: 12, sm: 6, md: 4 }}>
              <Wallet
                address={wallet.address}
                name={wallet.name}
                key={wallet.address}
              />
            </Gride>
          ))}
          {showDivider && (
            <Divider sx={{ width: "100%", mt: 4, mb: 2 }}>结束了</Divider>
          )}
        </Gride>
      )}
    </>
  );
}
