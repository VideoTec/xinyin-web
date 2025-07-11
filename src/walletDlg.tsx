import {
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { WalletsCtx } from "./walletsCtx";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { Wallet } from "./walletsData";
import bs58 from "bs58";

export function WalletDlg({
  initAddress = "",
  initName = "",
  type = "add",
  children,
}: {
  initAddress?: string;
  initName?: string;
  type?: "add" | "modify";
  children: (props: { triggerOpen: () => void }) => ReactElement;
}) {
  const renderCount = useRef(0);
  renderCount.current += 1;
  const instanceId = useRef(Math.random().toString(36).slice(2));

  useEffect(() => {
    console.log(
      `WalletDetailDialog(${instanceId.current}) 渲染次数:`,
      renderCount.current
    );
  });
  const [open, setOpen] = useState(false);
  const { dispatch } = useContext(WalletsCtx);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Wallet>({
    defaultValues: {
      address: initAddress,
      name: initName,
    },
  });

  const title = type === "add" ? "添加钱包" : "修改钱包";

  function handleOpen() {
    reset({
      address: initAddress,
      name: initName,
    });
    setOpen(true);
  }

  const onSubmit: SubmitHandler<Wallet> = (data) => {
    console.log("提交数据", data);
    const wallet = {
      address: data.address,
      name: data.name,
    };
    dispatch({ type, wallet });
    setOpen(false);
  };

  function validateAddress(value: string) {
    try {
      const decoded = bs58.decode(value);
      if (decoded.length !== 32) {
        return "钱包地址必须是 32 字节的 Base58 编码字符串";
      }
    } catch (e) {
      return "钱包地址格式不正确: " + e;
    }
    return true;
  }

  return (
    <>
      {children({ triggerOpen: handleOpen })}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent sx={{ paddingBottom: 0 }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ paddingTop: 8 }}>
            <TextField
              sx={{ marginBottom: 2 }}
              fullWidth
              label="钱包地址"
              disabled={type === "modify"}
              {...register("address", {
                required: "必须填写钱包地址",
                validate: validateAddress,
              })}
              error={!!errors.address}
              helperText={errors.address && errors.address.message}
            />
            <TextField
              label="钱包名称"
              fullWidth
              {...register("name", { required: "必须填写钱包名称" })}
              error={!!errors.name}
              helperText={errors.name && errors.name.message}
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
