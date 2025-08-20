import { TextField } from "@mui/material";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { login } from "./webauthn";
import { useState } from "react";

function Login() {
  const [userName, setUserName] = useState("");

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // 处理登录逻辑
    login(userName);
  }

  return (
    <Stack
      component="form"
      alignItems="center"
      justifyContent="center"
      sx={{ height: "100vh" }}
      onSubmit={handleLogin}
    >
      <h1>登录</h1>
      <TextField
        label="用户名"
        variant="outlined"
        margin="normal"
        fullWidth
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <Button variant="contained" color="primary" type="submit">
        登录
      </Button>
    </Stack>
  );
}

export default Login;
