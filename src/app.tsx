import { useState } from "react";
// import XinYinInput from "./xinyin_input";
import { waitWorkerReady } from "./xinyin/xinyinMain";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useEffect } from "react";
import { WalletList } from "./wallets";
import { WalletsCtxProvider } from "./walletsCtx";
import Stack from "@mui/material/Stack";

type WorkerStatus = "loading" | "success" | "error";

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
      {workerStatus === "success" && (
        <WalletsCtxProvider>
          <WalletList />
        </WalletsCtxProvider>
      )}
    </Stack>
  );
}

export default App;
