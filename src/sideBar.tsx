import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { NavLink } from 'react-router';
import { userSelector, logout } from './authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { post } from './restful-api';
// import { getMe } from './store';

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
      slotProps={{ paper: { sx: { width: 260 } } }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
          backgroundColor: 'grey.100',
          minHeight: '100vh',
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
                // await getMe();
                dispatch(logout());
              }}
              sx={{ mt: 2 }}
            >
              登出
            </Button>
          </>
        ) : (
          <NavLink
            to="/login"
            style={{ textDecoration: 'none', width: '100%' }}
          >
            <Button variant="outlined" color="primary" fullWidth sx={{ mt: 2 }}>
              登录
            </Button>
          </NavLink>
        )}
      </Box>
      {/* 这里可以添加更多导航项 */}
    </Drawer>
  );
}
