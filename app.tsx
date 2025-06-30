import { useState } from "react";
import XinYinInput from "./xinyin_input";
import { waitWorkerReady } from "./xinyin_main";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useEffect } from "react";

type WorkerStatus = "loading" | "success" | "error";

function App() {
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus>("loading");
  const [workerError, setWorkerError] = useState<string | null>(null);

  // 使用 useEffect 避免每次渲染都调用 waitWorkerReady
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

  if (workerStatus === "loading") {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          正在初始化，请稍候...
        </Typography>
      </Box>
    );
  }

  if (workerStatus === "error") {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Typography variant="h6" mt={2}>
          初始化失败：{workerError}
        </Typography>
      </Box>
    );
  }

  // workerStatus === "success"
  return (
    <Stack alignItems="center">
      <XinYinInput />
    </Stack>
  );
}

export default App;
