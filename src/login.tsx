import { TextField } from "@mui/material";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { getCredForUser, loginWithCredential } from "./webauthn";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import { type LoginInfo, loginSchema } from "./schemaUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { getData, getErrorMsg } from "./restfullUtils";

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

  async function handleLogin(data: LoginInfo) {
    setErr(null);
    setInfo("开始读取Passkey...");
    try {
      const credential = await getCredForUser(data.userName);
      setInfo("读取到了 Passkey, 正在登录...");
      const r = await loginWithCredential(credential);
      setInfo(`登录成功: ${r.userName}`);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "未知错误");
    }
  }

  async function handleGoogleLogin() {
    window.location.href = `${
      import.meta.env.VITE_WEBAUTHN_HOST
    }/oauth2-login/google`;
  }

  async function handleGetUserInfo() {
    try {
      const u = await fetch(`${import.meta.env.VITE_WEBAUTHN_HOST}/auth/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!u.ok) {
        throw new Error(`获取用户信息失败: ${await getErrorMsg(u)}`);
      }

      const user = await getData<{ userName: string; id: number }>(u);
      setInfo(`用户信息: ${user.userName}`);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "未知错误");
    }
  }

  async function handleRefreshToken() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_WEBAUTHN_HOST}/token/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`刷新Token失败: ${await getErrorMsg(response)}`);
      }

      const r = await getData<{ msg: string }>(response);

      setInfo(`刷新Token成功: ${r.msg}`);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "未知错误");
    }
  }

  return (
    <Stack
      component="form"
      alignItems="center"
      justifyContent="center"
      sx={{ height: "100vh" }}
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
        helperText={errors.userName ? errors.userName.message : ""}
        {...register("userName")}
      />
      <Button variant="contained" color="primary" type="submit">
        登录
      </Button>
      <Collapse in={!!err} sx={{ width: "100%", marginTop: 2 }}>
        <Alert
          severity="error"
          onClose={() => setErr(null)}
          sx={{ wordBreak: "break-all" }}
        >
          {err}
        </Alert>
      </Collapse>
      <Collapse in={!!info} sx={{ width: "100%", marginTop: 2 }}>
        <Alert severity="info" onClose={() => setInfo(null)}>
          {info}
        </Alert>
      </Collapse>
      <Button variant="contained" color="primary" onClick={handleGoogleLogin}>
        使用Google登录
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleGetUserInfo}
        sx={{ marginTop: 2 }}
      >
        获取用户信息
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleRefreshToken}
        sx={{ marginTop: 2 }}
      >
        刷新Token
      </Button>
    </Stack>
  );
}

export default Login;
