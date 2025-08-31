import { useEffect, useState } from 'react';
import { waitWorkerReady } from './xinyin/xinyinMain';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { authStatusSelector } from './authSlice';

type WorkerStatus = 'loading' | 'success' | 'error';

export default function GlobalWidget({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus>('loading');
  const [workerError, setWorkerError] = useState<string | null>(null);
  const authStatus = useSelector(authStatusSelector);
  const navigate = useNavigate();

  useEffect(() => {
    if (authStatus === 'loggedOut') {
      navigate('/login');
    }
  }, [authStatus, navigate]);

  useEffect(() => {
    let isMounted = true;
    waitWorkerReady()
      .then(() => {
        if (isMounted) setWorkerStatus('success');
      })
      .catch((error) => {
        if (isMounted) {
          setWorkerStatus('error');
          setWorkerError(error.message || '未知错误');
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {workerStatus === 'error' && (
        <Typography variant="h6" mt={2}>
          初始化失败：{workerError}
        </Typography>
      )}
      {workerStatus === 'loading' && (
        <>
          <CircularProgress />
          <Typography variant="h6" mt={2}>
            正在初始化，请稍候...
          </Typography>
        </>
      )}
      {workerStatus === 'success' && children}
    </>
  );
}
