import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useForm } from 'react-hook-form';
import { createPasskey, registerWithPasskey } from './webauthn';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInfo } from './schemaUtils';
import { useNavigate, NavLink } from 'react-router';
import { getMe } from './store';
import Typography from '@mui/material/Typography';

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(data: RegisterInfo) {
    setErr(null);
    setInfo(null);
    try {
      setInfo('正在生成 Passkey...');
      const cred = await createPasskey(data.userName, data.displayName);
      setInfo('Passkey 生成成功, 正在注册...');
      const result = await registerWithPasskey(cred);
      setInfo(`注册结果: ${result.message}，获取用户信息...`);
      await getMe();
      navigate('/');
    } catch (error) {
      setInfo(null);
      setErr(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      alignItems="center"
      justifyContent="center"
      sx={{ height: '100vh' }}
    >
      <h1>注册</h1>
      <TextField
        label="用户名"
        variant="outlined"
        margin="normal"
        fullWidth
        placeholder="请输入用户名"
        {...register('userName')}
        error={!!errors.userName}
        helperText={errors.userName ? errors.userName.message : ''}
      />
      <TextField
        label="昵称"
        variant="outlined"
        margin="normal"
        placeholder="请输入昵称"
        fullWidth
        {...register('displayName')}
        error={!!errors.displayName}
        helperText={errors.displayName ? errors.displayName.message : ''}
      />
      <Button variant="contained" color="primary" type="submit">
        注册
      </Button>
      <NavLink to="/login">
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          已有账号？登录
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

export default Register;
