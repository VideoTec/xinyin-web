import { TextField, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { getCredForUser, loginWithCredential } from '../../restful/webauthn';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import { type LoginInfo, loginSchema } from '../../utils/schema-utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, NavLink } from 'react-router';
import { getMe } from '../../restful/user';
import { useDispatch } from 'react-redux';
import { reset } from '../../store/slice-auth';

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInfo>({
    resolver: zodResolver(loginSchema),
  });
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // console.log('Login component unmounted');
    dispatch(reset());
  }, [dispatch]);

  async function handleLogin(data: LoginInfo) {
    setErr(null);
    setInfo('开始读取Passkey...');
    try {
      const credential = await getCredForUser(data.userName);
      setInfo('读取到了 Passkey, 正在登录...');
      const r = await loginWithCredential(credential);
      setInfo(`登录结果: ${r.message}，获取用户信息...`);
      await getMe();
      navigate('/');
    } catch (error) {
      setErr(error instanceof Error ? error.message : '未知错误');
      setInfo(null);
    }
  }

  return (
    <Stack
      component="form"
      alignItems="center"
      justifyContent="center"
      sx={{ height: '100vh', width: '100%' }}
      onSubmit={handleSubmit(handleLogin)}
    >
      <h1>登录</h1>
      <TextField
        label="用户名"
        variant="outlined"
        margin="normal"
        fullWidth
        placeholder="请输入用户名"
        error={!!errors.userName}
        helperText={errors.userName ? errors.userName.message : ''}
        {...register('userName')}
      />
      <Button variant="contained" color="primary" type="submit">
        登录
      </Button>
      <NavLink to="/register">
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          还没有账号？注册
        </Typography>
      </NavLink>

      <Collapse in={!!err} sx={{ width: '100%', marginTop: 2 }}>
        <Alert
          severity="error"
          onClose={() => setErr(null)}
          sx={{ wordBreak: 'break-all' }}
        >
          {err}
        </Alert>
      </Collapse>
      <Collapse in={!!info} sx={{ width: '100%', marginTop: 2 }}>
        <Alert severity="info" onClose={() => setInfo(null)}>
          {info}
        </Alert>
      </Collapse>
    </Stack>
  );
}

export default Login;
