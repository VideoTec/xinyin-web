import { cloneElement, useContext, useState, type ReactElement } from "react";
import { WalletsCtx } from "./walletsCtx";
import TextField from "@mui/material/TextField";
import Button, { type ButtonProps } from "@mui/material/Button";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

export function WalletDetailDialog({
  initAddress = "",
  initName = "",
  type = "add",
  openBtn,
}: {
  initAddress?: string;
  initName?: string;
  type?: "add" | "modify";
  openBtn: ReactElement<ButtonProps, typeof Button>;
}) {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState(initAddress);
  const [walletName, setWalletName] = useState(initName);
  const { dispatch } = useContext(WalletsCtx);

  const title = type === "add" ? "添加钱包" : "修改钱包";

  const OpenBtn = cloneElement(openBtn, {
    onClick: () => {
      setAddress(initAddress);
      setWalletName(initName);
      setOpen(true);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const wallet = {
      address,
      name: walletName,
    };
    dispatch({ type, wallet });
    setOpen(false);
  }

  return (
    <>
      {OpenBtn}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent sx={{ paddingBottom: 0 }}>
          <form onSubmit={handleSubmit} style={{ paddingTop: 8 }}>
            <TextField
              sx={{ marginBottom: 2 }}
              fullWidth
              label="钱包地址"
              helperText="钱包地址必须是以0x开头的20字节地址"
              value={address}
              disabled={type === "modify"}
              onChange={(e) => setAddress(e.target.value)}
            />
            <TextField
              label="钱包名称"
              fullWidth
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
            />
            <DialogActions>
              <Button onClick={() => setOpen(false)}>取消</Button>
              <Button type="submit">确认</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
