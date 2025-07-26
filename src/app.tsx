import { useState } from "react";
import { waitWorkerReady } from "./xinyin/xinyinMain";
import { useEffect, memo } from "react";
import { WalletList } from "./wallets";
import { WalletsCtx } from "./walletsCtx";
import { WalletDlg } from "./walletDlg";
import { XinyinDlg } from "./xinyinDlg";
import { useImmerReducer } from "use-immer";
import {
  initWallets,
  walletsReducer,
  type Wallet,
  type WalletDispatchAction,
} from "./walletsData";
import type { Dispatch } from "react";
import { ImportWords32Icon, GenerateWords32Icon } from "./icons";
import { useRegisterSW } from "virtual:pwa-register/react";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import AddIcon from "@mui/icons-material/Add";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";

type WorkerStatus = "loading" | "success" | "error";

// TODO : 添加错误处理逻辑，确保在 worker 初始化失败时给出友好的提示
// TODO : speedDial 按钮，关闭时，弹出，添加钱包对话框，类似 x 的发帖效果
const FixedButtons = memo(
  ({ dispatch }: { dispatch: Dispatch<WalletDispatchAction> }) => {
    return (
      <WalletsCtx value={{ dispatch }}>
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
                {({ triggerOpen }) => (
                  <ImportWords32Icon onClick={triggerOpen} />
                )}
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
      </WalletsCtx>
    );
  }
);
FixedButtons.displayName = "FixedButtons";

const WalletListWrapper = memo(
  ({
    wallets,
    dispatch,
  }: {
    wallets: Wallet[];
    dispatch: Dispatch<WalletDispatchAction>;
  }) => {
    return (
      <WalletsCtx value={{ wallets, dispatch }}>
        <WalletList />
      </WalletsCtx>
    );
  }
);
WalletListWrapper.displayName = "WalletListWrapper";

function WalletApp() {
  const [wallets, dispatch] = useImmerReducer(walletsReducer, initWallets());
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
      <WalletListWrapper wallets={wallets} dispatch={dispatch} />
      <FixedButtons dispatch={dispatch} />
    </>
  );
}

function App() {
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus>("loading");
  const [workerError, setWorkerError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    waitWorkerReady()
      .then(() => {
        if (isMounted) setWorkerStatus("success");
      })
      .catch((error) => {
        if (isMounted) {
          setWorkerStatus("error");
          setWorkerError(error.message || "未知错误");
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Stack alignItems="center">
      {workerStatus === "error" && (
        <Typography variant="h6" mt={2}>
          初始化失败：{workerError}
        </Typography>
      )}
      {workerStatus === "loading" && (
        <>
          <CircularProgress />
          <Typography variant="h6" mt={2}>
            正在初始化，请稍候...
          </Typography>
        </>
      )}
      {workerStatus === "success" && <WalletApp />}
    </Stack>
  );
}

export default App;
