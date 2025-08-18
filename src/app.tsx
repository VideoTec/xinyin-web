import { useState } from "react";
import { waitWorkerReady } from "./xinyin/xinyinMain";
import { useEffect } from "react";
import { WalletList } from "./wallets";
import { WalletsCtx } from "./walletsCtx";
import { useImmerReducer } from "use-immer";
import { initWallets, walletsReducer } from "./walletsData";
import CircularProgress from "@mui/material/CircularProgress";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { green } from "@mui/material/colors";
import { Button, IconButton } from "@mui/material";
import { ImportWords32Icon, GenerateWords32Icon } from "./icons";
import XinyinDlg from "./xinyinDlg";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import {
  SolanaClusterType,
  getCurrentCluster,
  setSolanaCluster as gSetSolanaCluster,
} from "./rpc/solanaRpcClient";
import { register, login } from "./webauth";

type WorkerStatus = "loading" | "success" | "error";

function App() {
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus>("loading");
  const [workerError, setWorkerError] = useState<string | null>(null);
  const [wallets, dispatch] = useImmerReducer(walletsReducer, initWallets());
  const [solanaCluster, setSolanaCluster] = useState<SolanaClusterType>(
    getCurrentCluster()
  );

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

  // TODO : 添加错误处理逻辑，确保在 worker 初始化失败时给出友好的提示
  return (
    <WalletsCtx value={{ wallets, dispatch }}>
      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar>
          <Avatar sx={{ bgcolor: green[600] }}>Xy</Avatar>
          <Typography variant="h6" sx={{ ml: 1 }} flexGrow={1}>
            数字钱包
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => {
              // window.location.href = "https://solana.wangxiang.work/login";
              register();
            }}
          >
            注册
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => {
              // window.location.href = "https://solana.wangxiang.work/login";
              login();
            }}
          >
            登录
          </Button>
          <XinyinDlg type="generate">
            {({ triggerOpen }) => (
              <IconButton sx={{ mr: 1 }} onClick={triggerOpen}>
                <GenerateWords32Icon />
              </IconButton>
            )}
          </XinyinDlg>
          <XinyinDlg type="import">
            {({ triggerOpen }) => (
              <IconButton sx={{ mr: 1 }} onClick={triggerOpen}>
                <ImportWords32Icon />
              </IconButton>
            )}
          </XinyinDlg>{" "}
          <ToggleButtonGroup
            value={solanaCluster}
            exclusive
            size="small"
            onChange={(_, newCluster) => {
              if (newCluster) {
                setSolanaCluster(newCluster);
                gSetSolanaCluster(newCluster);
              }
            }}
            aria-label="text alignment"
          >
            <ToggleButton
              value={SolanaClusterType.mainnetBeta}
              aria-label="left aligned"
              sx={{ fontSize: "0.5rem" }}
            >
              Main
            </ToggleButton>
            <ToggleButton
              value={SolanaClusterType.devnet}
              aria-label="centered"
              sx={{ fontSize: "0.5rem" }}
            >
              Devnet
            </ToggleButton>
            <ToggleButton
              value={SolanaClusterType.testnet}
              aria-label="right aligned"
              sx={{ fontSize: "0.5rem" }}
            >
              Testnet
            </ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
      </AppBar>
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
        {workerStatus === "success" && <WalletList />}
      </Stack>
    </WalletsCtx>
  );
}

export default App;
