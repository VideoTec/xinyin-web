import { useState, useTransition, type ReactElement } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import {
  addWallet,
  updateWallet,
  walletsSelector,
} from '../store/slice-wallets';
import { shortSolanaAddress, isValidSolanaAddress } from '../utils';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import CheckBox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import { useAppDispatch, useAppSelector } from '../store/store';
import type { Wallet } from '../types/wallet';
import { useClusterState } from '../store/cluster-store';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';

export default function WalletDlg({
  srcWallet,
  type = 'add',
  children,
}: {
  srcWallet?: Wallet;
  type?: 'add' | 'modify';
  children: (props: { triggerOpen: () => void }) => ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const wallets = useAppSelector(walletsSelector);
  const dispatch = useAppDispatch();
  const currentCluster = useClusterState();
  const [isPending] = useTransition();
  const [addressCopied, setAddressCopied] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm<Wallet>({
    defaultValues: srcWallet,
  });

  const title = type === 'add' ? '添加钱包' : '修改钱包';

  function handleOpen() {
    reset(srcWallet);
    setOpen(true);
  }

  const onSubmit: SubmitHandler<Wallet> = async (data) => {
    setOpen(false);

    if (type === 'modify') {
      dispatch(updateWallet(data));
    } else if (type === 'add') {
      data.$cluster = currentCluster;
      data.$hasKey = false;
      data.$isMine = false;
      dispatch(addWallet(data));
    }
  };

  const validateAddress = (address: string) => {
    const isValid = isValidSolanaAddress(address);
    if (isValid !== true) return isValid;

    if (type === 'add' && wallets?.some((w) => w.$address === address)) {
      return '钱包地址已存在';
    }
    return true;
  };

  const validateName = (name?: string) => {
    if (
      wallets?.some(
        (w) => w.$name === name && srcWallet?.$address !== w.$address
      )
    ) {
      return '钱包名称已存在';
    }
    return true;
  };

  return (
    <>
      {children({ triggerOpen: handleOpen })}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        disableAutoFocus={false}
        disableRestoreFocus={true}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent sx={{ paddingBottom: 0 }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ paddingTop: 8 }}>
            <TextField
              sx={{ marginBottom: 2 }}
              fullWidth
              label="钱包地址"
              disabled={type === 'modify'}
              {...register('$address', {
                required: '必须填写钱包地址',
                validate: validateAddress,
              })}
              error={!!errors.$address}
              helperText={errors.$address && errors.$address.message}
              slotProps={{
                input: {
                  endAdornment:
                    type === 'modify' &&
                    (addressCopied ? (
                      <CheckIcon color="success" fontSize="small" />
                    ) : (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          navigator.clipboard
                            .writeText(srcWallet?.$address || '')
                            .then(() => {
                              setAddressCopied(true);
                              setTimeout(() => {
                                setAddressCopied(false);
                              }, 1000);
                            });
                        }}
                      >
                        <CopyIcon />
                      </IconButton>
                    )),
                },
              }}
            />
            <TextField
              label="钱包名称"
              fullWidth
              onFocus={() => {
                const address = watch('$address');
                const name = watch('$name');
                if (
                  !name &&
                  address &&
                  isValidSolanaAddress(address) === true
                ) {
                  // FIXME: 自动生成钱包名称，提交时，错误交易，label 会覆盖内容
                  setValue('$name', shortSolanaAddress(address));
                }
              }}
              {...register('$name', {
                required: '必须填写钱包名称',
                validate: validateName,
              })}
              error={!!errors.$name}
              helperText={errors.$name && errors.$name.message}
            />
            <Controller
              name="$isMine"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <CheckBox
                      checked={field.value}
                      onChange={(_, checked) => field.onChange(checked)}
                    />
                  }
                  label="我拥有这个钱包"
                />
              )}
            />
            <Controller
              name="$hasKey"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <CheckBox
                      checked={field.value}
                      onChange={(_, checked) => field.onChange(checked)}
                    />
                  }
                  label="我有这个钱包的私钥"
                />
              )}
            />
            <DialogActions>
              <Button onClick={() => setOpen(false)}>取消</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? '处理中...' : '确认'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
