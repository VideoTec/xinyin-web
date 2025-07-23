import { useContext, useState, useTransition, type ReactElement } from "react";
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
// import bs58 from "bs58"; // 暂时注释，地址验证功能待完善

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
  const [open, setOpen] = useState(false);
  const { dispatch } = useContext(WalletsCtx)!;
  const [isPending, startTransition] = useTransition();
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
    // 立即关闭对话框
    setOpen(false);

    // 使用 startTransition 将数据更新标记为非紧急
    startTransition(() => {
      const wallet = {
        address: data.address,
        name: data.name,
      };

      // 使用微任务队列来确保UI更新不被阻塞
      queueMicrotask(() => {
        dispatch({ type, wallet });
      });
    });
  };

  function validateAddress() {
    // try {
    //   const decoded = bs58.decode(value);
    //   if (decoded.length !== 32) {
    //     return "钱包地址必须是 32 字节的 Base58 编码字符串";
    //   }
    // } catch (e) {
    //   return "钱包地址格式不正确: " + e;
    // }
    return true;
  }

  return (
    <>
      {children({ triggerOpen: handleOpen })}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        disableAutoFocus={false}
        disableRestoreFocus={true}
      >
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
              <Button type="submit" disabled={isPending}>
                {isPending ? "处理中..." : "确认"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
