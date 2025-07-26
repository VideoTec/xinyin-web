import { useContext, useState, useTransition, type ReactElement } from "react";
import { WalletsCtx } from "./walletsCtx";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { Wallet } from "./walletsData";
import { shortSolanaAddress, isValidSolanaAddress } from "./rpc/utils";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

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
    watch,
    setValue,
  } = useForm<Wallet>({
    defaultValues: {
      address: initAddress,
      name: initName,
    },
  });

  const title = type === "add" ? "添加钱包" : "修改钱包";

  // TODO : 这里可以添加验证逻辑，确保地址格式正确，并且 name address 没有重复

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

  // FIXME: 确保地址格式正确, 显示错误原因
  // TODO: 地址栏，全选，复制 方案
  return (
    <>
      {children({ triggerOpen: handleOpen })}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        disableAutoFocus={false}
        disableRestoreFocus={true}
        onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
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
                validate: isValidSolanaAddress,
              })}
              error={!!errors.address}
              helperText={errors.address && errors.address.message}
            />
            <TextField
              label="钱包名称"
              fullWidth
              onFocus={() => {
                const address = watch("address");
                const name = watch("name");
                if (
                  !name &&
                  address &&
                  isValidSolanaAddress(address) === true
                ) {
                  setValue("name", shortSolanaAddress(address));
                }
              }}
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
