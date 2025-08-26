import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useForm } from "react-hook-form";
import { createPasskey, registerWithPasskey } from "./webauthn";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInfo } from "./schemaUtils";

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

  async function onSubmit(data: RegisterInfo) {
    setErr(null);
    setInfo(null);
    try {
      setInfo("正在生成 Passkey...");
      const cred = await createPasskey(data.userName, data.displayName);
      setInfo("Passkey 生成成功, 正在注册...");
      const result = await registerWithPasskey(cred);
      setInfo("注册成功: " + result.userName);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Unknown error");
    }
  }

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      alignItems="center"
      justifyContent="center"
      sx={{ height: "100vh" }}
    >
      <h1>注册</h1>
      <TextField
        label="用户名"
        variant="outlined"
        margin="normal"
        fullWidth
        placeholder="请输入用户名"
        {...register("userName")}
        error={!!errors.userName}
        helperText={errors.userName ? errors.userName.message : ""}
      />
      <TextField
        label="昵称"
        variant="outlined"
        margin="normal"
        placeholder="请输入昵称"
        fullWidth
        {...register("displayName")}
        error={!!errors.displayName}
        helperText={errors.displayName ? errors.displayName.message : ""}
      />
      <Button variant="contained" color="primary" type="submit">
        注册
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
    </Stack>
  );
}

export default Register;
