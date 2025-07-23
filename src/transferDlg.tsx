import { useForm, Controller } from "react-hook-form";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { useContext, useState, type ReactElement } from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { WalletsCtx } from "./walletsCtx";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { FormControl, FormHelperText } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";

interface TransferData {
  toAddress: string;
  psw: string;
  sol: number;
}

export default function TransferDlg({
  fromAddress,
  fromName,
  renderOpenBtn,
  onResult,
}: {
  fromAddress: string;
  fromName: string;
  renderOpenBtn: (props: { triggerOpen: () => void }) => ReactElement;
  onResult: (toAddress: string, lamports: number, psw: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { wallets } = useContext(WalletsCtx)!;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    control,
  } = useForm<TransferData>({
    defaultValues: {
      toAddress: "",
      psw: "",
      sol: 0,
    },
  });

  const handleOpen = () => {
    setOpen(true);
    reset({
      toAddress: "",
      psw: "",
      sol: 0,
    });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = (data: TransferData) => {
    handleClose();
    onResult(data.toAddress, data.sol * 1e9, data.psw);
  };

  return (
    <>
      {renderOpenBtn({ triggerOpen: handleOpen })}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        disableRestoreFocus={true}
        disableAutoFocus={false}
        aria-labelledby="modal-title"
      >
        <DialogTitle id="modal-title">转账</DialogTitle>
        <DialogContent>
          <Stack
            component="form"
            id="transfer-form"
            spacing={2}
            sx={{ paddingTop: 2 }}
            onSubmit={handleSubmit(onSubmit)}
          >
            <TextField
              label="扣款账户"
              value={fromName}
              helperText={fromAddress}
              disabled
              autoComplete="username"
            />
            <TextField
              label="密码"
              type="password"
              autoComplete="current-password"
              {...register("psw", { required: true })}
              error={!!errors.psw}
              helperText={errors.psw ? "密码不能为空" : "请输入密码"}
            />
            <FormControl fullWidth error={!!errors.toAddress}>
              <InputLabel id="to-address-label">收款账户</InputLabel>
              <Controller
                name="toAddress"
                control={control}
                rules={{ required: "必须选择收款账户" }}
                render={({ field }) => (
                  <Select
                    labelId="to-address-label"
                    label="收款账户"
                    {...field}
                  >
                    {wallets!.map((wallet) => (
                      <MenuItem key={wallet.address} value={wallet.address}>
                        {wallet.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              <FormHelperText>
                {watch("toAddress") ? watch("toAddress") : "请选择收款账户"}
              </FormHelperText>
            </FormControl>
            <TextField
              label="金额 (以 SOL 为单位)"
              {...register("sol", {
                required: true,
                min: 0.0001,
                valueAsNumber: true,
              })}
              error={!!errors.sol}
              helperText={errors.sol ? "金额必须大于 0.0001" : "请输入金额"}
            />
            <DialogActions>
              <Button onClick={handleClose}>取消</Button>
              <Button type="submit">确认</Button>
            </DialogActions>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
