import { useEffect } from 'react';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { authStatusSelector } from './authSlice';
import { useWorkersState, WorkerStatus } from './worker-store';
import Stack from '@mui/material/Stack';

export default function GlobalWidget({
  children,
}: {
  children?: React.ReactNode;
}) {
  const authStatus = useSelector(authStatusSelector);
  const workersState = useWorkersState();
  const navigate = useNavigate();

  useEffect(() => {
    if (authStatus === 'loggedOut') {
      navigate('/login');
    }
  }, [authStatus, navigate]);

  return (
    <Stack alignItems="center">
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
          数据库模块，加载失败：{workersState.sqlite.error}
        </Typography>
      )}
      {workersState.xinyin.status === WorkerStatus.Ready &&
        workersState.sqlite.status === WorkerStatus.Ready &&
        children}
    </Stack>
  );
}
