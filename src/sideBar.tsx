import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { userSelector, logout } from './authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { post } from './restful-api';
import { getMe } from './store';
import XinyinDlg from './xinyinDlg';

export default function SideBar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const user = useSelector(userSelector);
  const dispatch = useDispatch();
  return (
    <Drawer
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 260,
          },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          p: 2,
          backgroundColor: 'grey.100',
        }}
      >
        <Box sx={{ mb: 2 }}>
          <XinyinDlg type="generate">
            {({ triggerOpen }) => (
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ mb: 1 }}
                onClick={triggerOpen}
              >
                生成心印助记字
              </Button>
            )}
          </XinyinDlg>
          <XinyinDlg type="import">
            {({ triggerOpen }) => (
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={triggerOpen}
              >
                导入心印助记字
              </Button>
            )}
          </XinyinDlg>
        </Box>
        <Box
          sx={{
            mt: 'auto',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {user ? (
            <>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                  fontSize: 32,
                  mb: 2,
                }}
              >
                {user.displayName?.[0] || user.userName?.[0] || 'U'}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {user.displayName || user.userName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                @{user.userName}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={async () => {
                  await post<{ message: string }>('token/logout');
                  dispatch(logout());
                }}
                sx={{ mt: 2 }}
              >
                登出
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={async () => {
                getMe();
                // FIXME 测试申请持久存储权限
                let r = await navigator.storage.persisted();
                console.log('Persisted storage result:', r);
                r = await navigator.storage.persist();
                console.log('persist storage result:', r);
              }}
            >
              登录
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
