import { useState } from "react";
import { waitWorkerReady } from "./xinyin/xinyinMain";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useEffect, memo } from "react";
import { WalletList } from "./wallets";
import { WalletsCtx } from "./walletsCtx";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { WalletDlg } from "./walletDlg";
import { XinyinDlg } from "./xinyinDlg";
import AddIcon from "@mui/icons-material/Add";
import ImportExport from "@mui/icons-material/ImportExport";
import Fab from "@mui/material/Fab";
import { useImmerReducer } from "use-immer";
import {
  initWallets,
  walletsReducer,
  type Wallet,
  type WalletDispatchAction,
} from "./walletsData";
import type { Dispatch } from "react";

type WorkerStatus = "loading" | "success" | "error";

const FixedButtons = memo(
  ({ dispatch }: { dispatch: Dispatch<WalletDispatchAction> }) => {
    return (
      <WalletsCtx value={{ dispatch }}>
        <Box sx={{ position: "fixed", right: 32, bottom: 32 }}>
          <WalletDlg type="add">
            {({ triggerOpen }) => (
              <Fab color="primary" onClick={triggerOpen}>
                <AddIcon />
              </Fab>
            )}
          </WalletDlg>
          <XinyinDlg type="import">
            {({ triggerOpen }) => (
              <Fab color="primary" onClick={triggerOpen}>
                <ImportExport />
              </Fab>
            )}
          </XinyinDlg>
        </Box>
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

  return (
    <>
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
