import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useForm } from "react-hook-form";
import { register as webauthnRegister } from "./webauthn";

interface RegisterFormInputs {
  username: string;
  displayName: string;
}

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>();

  function onSubmit(data: RegisterFormInputs) {
    webauthnRegister(data.username, data.displayName);
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
        {...register("username")}
        error={!!errors.username}
        helperText={errors.username ? errors.username.message : ""}
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
    </Stack>
  );
}

export default Register;
