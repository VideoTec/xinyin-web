import { useEffect, useState } from 'react';
import { rotate360deg } from './customStyle';
import { useConfirm } from 'material-ui-confirm';
import {
  getAccountInfo,
  getBalance,
  getSignatureStatuses,
} from '../rpc/solana-rpc';
import { transfer } from '../rpc/transfer';
import { getErrorMsg, shortTransferID } from '../utils';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import TransferDlg from './transferDlg';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import RefreshIcon from '@mui/icons-material/Refresh';
import Avatar from '@mui/material/Avatar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WalletDlg from './walletDlg';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useClusterState } from '../store/cluster-store';
import { removeWallet } from '../store/slice-wallets';

enum TransferStatus {
  /** 初始化 */
  Init,
  /** 正在RPC调用中，发起转账 */
  InRPC,
  /** 循环查询状态中，等待链上确认 */
  LoopStatus,
  /** 转账成功 */
  Success,
  /** 转账失败 */
  Failed,
}

export default function Wallet({
  address,
  name,
}: {
  address: string;
  name: string;
}) {
  const dispatch = useDispatch();
  const confirm = useConfirm();
  const [loadingError, setLoadingError] = useState<string>('');
  const [owner, setOwner] = useState('');
  const [balance, setBalance] = useState('');
  const [transferStatus, setTransferStatus] = useState(TransferStatus.Init);
  const [transferMessage, setTransferMessage] = useState('');
  const [showAddress, setShowAddress] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [txId, setTxId] = useState('');
  const currentCluster = useClusterState();

  const isNoneAccount = owner === '';

  const isTransferring =
    transferStatus === TransferStatus.InRPC ||
    transferStatus === TransferStatus.LoopStatus;

  const shortTxId = shortTransferID(txId);

  const {
    isFetching: isAccountLoading,
    error: accountError,
    data: accountData,
    refetch: refetchAccount,
  } = useQuery({
    queryKey: ['accountInfo', address, currentCluster],
    queryFn: () => getAccountInfo(address, { encoding: 'base64' }),
    retry: 0,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const {
    isFetching: isBalanceLoading,
    error: balanceError,
    data: balanceData,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ['balance', address],
    queryFn: () => getBalance(address, { encoding: 'base64' }),
    retry: 0,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: transferStatusData } = useQuery({
    queryKey: ['transferStatus', txId],
    queryFn: () =>
      getSignatureStatuses([txId], {
        searchTransactionHistory: false,
      }),
    enabled: TransferStatus.LoopStatus === transferStatus,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: () => {
      return transferStatus === TransferStatus.LoopStatus ? 3000 : false;
    },
  });

  const transferMutation = useMutation({
    mutationFn: (data: { toAddress: string; lamports: number; pwd: string }) =>
      transfer(address, data.toAddress, data.lamports, data.pwd),
    onSuccess: (data) => {
      setTxId(data);
      setTransferStatus(TransferStatus.LoopStatus);
      setTransferMessage(`发起转账成功，签名 ID: ${shortTxId}`);
    },
    onError: (error) => {
      setTransferStatus(TransferStatus.Failed);
      setTransferMessage(`转账失败，错误信息: ${getErrorMsg(error)}`);
    },
  });

  useEffect(() => {
    if (transferStatusData) {
      const status = transferStatusData[0];
      if (status) {
        if (status.confirmationStatus === 'finalized') {
          setTransferStatus(TransferStatus.Success);
          setTransferMessage(`转账成功，签名 ID: ${shortTxId}`);
          refetchBalance();
        } else if (status.err) {
          setTransferStatus(TransferStatus.Failed);
          setTransferMessage(
            `转账失败，签名 ID: ${shortTxId}，错误信息: ${JSON.stringify(
              status.err
            )}`
          );
        } else {
          setTransferStatus(TransferStatus.LoopStatus);
          setTransferMessage(
            `转账状态: ${status.confirmationStatus}, 确认数: ${
              status.confirmations ?? 'max'
            }，签名 ID: ${shortTxId}`
          );
        }
      }
    }
  }, [transferStatusData, refetchBalance, shortTxId]);

  useEffect(() => {
    if (accountData) {
      setOwner(accountData.owner);
      const sol = accountData.lamports / 1e9;
      setBalance(sol.toString());
    } else {
      setOwner('');
      setBalance('0');
    }
  }, [accountData]);

  useEffect(() => {
    if (balanceData) {
      const sol = balanceData / 1e9;
      setBalance(sol.toString());
    } else {
      setOwner('');
      setBalance('0');
    }
  }, [balanceData]);

  useEffect(() => {
    if (accountError) {
      setLoadingError(getErrorMsg(accountError));
    } else if (balanceError) {
      setLoadingError(getErrorMsg(balanceError));
    }
  }, [accountError, balanceError]);

  async function handleDelete() {
    const { confirmed } = await confirm({
      title: '删除钱包',
      description: `确定要删除钱包 ${name} 吗？`,
      confirmationText: '删除',
      cancellationText: '取消',
    });
    if (confirmed) {
      dispatch(removeWallet(address));
    }
  }

  async function handleTransfer(
    toAddress: string,
    lamports: number,
    pwd: string
  ) {
    setTransferStatus(TransferStatus.InRPC);
    setTransferMessage('正在发起转账，请稍候...');

    transferMutation.mutate({
      toAddress,
      lamports,
      pwd,
    });
  }

  //TODO: transferMessage 点击，跳转 solscan.io
  return (
    <Card key={address}>
      <CardHeader
        title={
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={'space-between'}
          >
            <Chip
              label={name}
              color="primary"
              variant="outlined"
              deleteIcon={
                <WalletDlg initAddress={address} initName={name} type="modify">
                  {({ triggerOpen }) => (
                    <EditIcon
                      style={{ marginRight: 12 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerOpen();
                      }}
                    />
                  )}
                </WalletDlg>
              }
              onDelete={() => {
                console.log('Delete wallet');
              }}
            />
            {isNoneAccount ? (
              <Chip
                label={isAccountLoading ? '加载中...' : '空账户'}
                variant="outlined"
                color={isAccountLoading ? 'primary' : 'error'}
                onDelete={() => {
                  if (!isAccountLoading) refetchAccount();
                }}
                deleteIcon={
                  <RefreshIcon
                    sx={{
                      animation: isAccountLoading ? rotate360deg : undefined,
                    }}
                  />
                }
              />
            ) : (
              <Chip
                label={balance}
                variant="outlined"
                color="primary"
                avatar={<Avatar>SOL</Avatar>}
                onDelete={() => {
                  if (!isBalanceLoading) refetchBalance();
                }}
                deleteIcon={
                  <RefreshIcon
                    sx={{
                      animation: isBalanceLoading ? rotate360deg : undefined,
                    }}
                  />
                }
              />
            )}
          </Stack>
        }
        sx={{ cursor: 'pointer' }}
        onClick={() => {
          setShowAddress(!showAddress);
        }}
      />
      <CardActions sx={{ justifyContent: 'end' }}>
        <>
          <IconButton>
            <DeleteIcon onClick={handleDelete} />
          </IconButton>
          <TransferDlg
            fromAddress={address}
            fromName={name}
            onResult={handleTransfer}
            renderOpenBtn={({ triggerOpen }) => (
              <Button
                variant="outlined"
                onClick={triggerOpen}
                id="transfer-btn"
                disabled={isTransferring || isBalanceLoading || isNoneAccount}
              >
                转账
              </Button>
            )}
          />
        </>
      </CardActions>
      <Collapse in={transferStatus !== TransferStatus.Init}>
        <Alert
          severity={
            transferStatus === TransferStatus.Failed
              ? 'error'
              : transferStatus === TransferStatus.Success
              ? 'success'
              : 'info'
          }
          sx={{ wordBreak: 'break-word' }}
          icon={
            isTransferring ? (
              <RefreshIcon sx={{ animation: rotate360deg }} />
            ) : transferStatus === TransferStatus.Success ? (
              <CheckCircleIcon />
            ) : (
              <ErrorIcon />
            )
          }
          onClose={
            isTransferring
              ? undefined
              : () => {
                  setTransferStatus(TransferStatus.Init);
                  setTransferMessage('');
                }
          }
        >
          {transferMessage}
        </Alert>
      </Collapse>
      <Collapse in={loadingError !== ''}>
        <Alert
          severity="error"
          sx={{ wordBreak: 'break-word' }}
          onClose={() => setLoadingError('')}
        >
          {loadingError}
        </Alert>
      </Collapse>
      <Collapse in={showAddress}>
        <Alert
          sx={{ wordBreak: 'break-all' }}
          action={
            <Stack>
              <Button size="small" onClick={() => setShowAddress(false)}>
                隐藏
              </Button>
              {addressCopied ? (
                <Chip label="copied" color="success" size="small" />
              ) : (
                <Button
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(address).then(() => {
                      setAddressCopied(true);
                      setTimeout(() => {
                        setAddressCopied(false);
                      }, 1000);
                    });
                  }}
                >
                  复制
                </Button>
              )}
            </Stack>
          }
        >
          {address}
        </Alert>
      </Collapse>
    </Card>
  );
}
