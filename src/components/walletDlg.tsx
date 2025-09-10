import { useState, useTransition, type ReactElement } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
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
import IconButton from '@mui/material/IconButton';
import { useAppDispatch, useAppSelector } from '../store/store';
import { useClusterState } from '../store/cluster-store';
import type { Wallet } from '../types/wallet';

export default function WalletDlg({
  initAddress = '',
  initName = '',
  type = 'add',
  children,
}: {
  initAddress?: string;
  initName?: string;
  type?: 'add' | 'modify';
  children: (props: { triggerOpen: () => void }) => ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const wallets = useAppSelector(walletsSelector);
  const dispatch = useAppDispatch();
  const solanaCluster = useClusterState();
  const [isPending] = useTransition();
  const [addressCopied, setAddressCopied] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<Wallet>({
    defaultValues: {
      $address: initAddress,
      $name: initName,
      $cluster: solanaCluster,
      $balance: 0,
      $hasKey: false,
      $isMine: false,
    },
  });

  const title = type === 'add' ? '添加钱包' : '修改钱包';

  function handleOpen() {
    reset({
      $address: initAddress,
      $name: initName,
      $cluster: solanaCluster,
      $balance: 0,
      $hasKey: false,
      $isMine: false,
    });
    setOpen(true);
  }

  const onSubmit: SubmitHandler<Wallet> = (data) => {
    // 立即关闭对话框
    setOpen(false);

    if (type === 'modify') {
      dispatch(updateWallet(data));
    } else if (type === 'add') {
      dispatch(addWallet(data));
    }
  };

  function validateAddress(address: string) {
    const isValid = isValidSolanaAddress(address);
    if (isValid !== true) return isValid;

    if (
      type === 'add' &&
      wallets &&
      wallets.some((w) => w.$address === address)
    )
      return '钱包地址已存在';
    return true;
  }

  function validateName(name: string) {
    if (wallets && wallets.some((w) => w.$name === name)) {
      return '钱包名称已存在';
    }
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
        onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
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
                            .writeText(initAddress)
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
