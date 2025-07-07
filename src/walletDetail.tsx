import { useContext, useState } from "react";
import { WalletsCtx } from "./walletsCtx";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export function WalletDetail({
  address,
  walletName,
  type,
}: {
  address: string;
  walletName: string;
  type: "add" | "modify";
}) {
  const { dispatch } = useContext(WalletsCtx);
  const [addr, setAddr] = useState(address);
  const [name, setName] = useState(walletName);

  function handleSubmit() {
    const wallet = {
      address: addr,
      name,
    };
    dispatch({ type, wallet });
  }

  return (
    <Stack alignItems="center" spacing={2} component="form" autoComplete="off">
      <TextField
        fullWidth
        size="small"
        error={!addr.startsWith("0x") || addr.length !== 42}
        variant="filled"
        label="钱包地址"
        helperText="钱包地址必须是以0x开头的20字节地址"
        value={addr}
        disabled={type === "modify"}
        onChange={(e) => setAddr(e.target.value)}
      />
      <TextField
        size="small"
        label="钱包名称"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button variant="contained" onClick={handleSubmit}>
        保存
      </Button>
    </Stack>
  );
}
