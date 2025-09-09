import { useEffect } from 'react';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { authStatusSelector } from '../store/slice-auth';
import { useWorkersState, WorkerStatus } from '../store/worker-store';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import { useRegisterSW } from 'virtual:pwa-register/react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { Snackbar } from '@mui/material';

export default function GlobalWidget({
  children,
}: {
  children?: React.ReactNode;
}) {
  const authStatus = useSelector(authStatusSelector);
  const workersState = useWorkersState();
  const navigate = useNavigate();
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: false,
  });

  useEffect(() => {
    if (authStatus === 'loggedOut') {
      navigate('/login');
    }
  }, [authStatus, navigate]);

  return (
    <Stack alignItems="center" sx={{ width: '100%' }}>
      <Snackbar
        open={offlineReady}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={6000}
        onClose={() => setOfflineReady(false)}
        message="应用安装完成！现在可以离线使用了"
      />
      <Collapse in={needRefresh}>
        <Alert
          action={<Button onClick={() => updateServiceWorker()}>刷新</Button>}
          sx={{ mb: 2 }}
        >
          有新版本可用
        </Alert>
      </Collapse>
      {workersState.xinyin.status === WorkerStatus.Loading && (
        <Typography variant="h6" mt={2}>
          心印模块，正在初始化...
        </Typography>
      )}
      {workersState.xinyin.status === WorkerStatus.Error && (
        <Typography variant="h6" mt={2}>
          心印模块，加载失败：{workersState.xinyin.error}
        </Typography>
      )}
      {workersState.sqlite.status === WorkerStatus.Loading && (
        <Typography variant="h6" mt={2}>
          数据库模块，正在初始化...
        </Typography>
      )}
      {workersState.sqlite.status === WorkerStatus.Error && (
        <Typography variant="h6" mt={2}>
          数据库模块，加载失败2：{workersState.sqlite.error}
        </Typography>
      )}
      {workersState.xinyin.status === WorkerStatus.Ready &&
        workersState.sqlite.status === WorkerStatus.Ready &&
        children}
    </Stack>
  );
}
