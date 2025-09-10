import { useEffect, useState } from 'react';
import { rotate360deg } from './customStyle';
import { useConfirm } from 'material-ui-confirm';
import type { Wallet } from '../types/wallet';
import { getBalance, getSignatureStatuses } from '../rpc/solana-rpc';
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
import { useAppDispatch } from '../store/store';
import { useClusterState } from '../store/cluster-store';
import { removeWallet, updateWallet } from '../store/slice-wallets';

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

export default function Wallet({ wallet }: { wallet: Wallet }) {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const [transferStatus, setTransferStatus] = useState(TransferStatus.Init);
  const [transferMessage, setTransferMessage] = useState('');
  const [showAddress, setShowAddress] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [txId, setTxId] = useState('');
  const currentCluster = useClusterState();

  const walletAddress = wallet.$address;

  const {
    isFetching: isBalanceLoading,
    error: balanceError,
    data: balanceData,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ['balance', wallet.$address, currentCluster],
    queryFn: () => getBalance(wallet.$address, { encoding: 'base64' }),
    enabled: false,
    retry: 0,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (balanceData !== undefined) {
      dispatch(
        updateWallet({ $address: walletAddress, $balance: balanceData })
      );
    }
  }, [balanceData, dispatch, walletAddress]);

  const balance = wallet.$balance ? wallet.$balance / 1e9 + '' : '';

  const isNoneAccount = balance === '0';

  const isTransferring =
    transferStatus === TransferStatus.InRPC ||
    transferStatus === TransferStatus.LoopStatus;

  const shortTxId = shortTransferID(txId);

  const loadingError = balanceError ? getErrorMsg(balanceError) : '';

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
      transfer(wallet.$address, data.toAddress, data.lamports, data.pwd),
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
    if (!transferStatusData) return;

    const status = transferStatusData[0];
    if (!status) return;

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
  }, [transferStatusData, refetchBalance, shortTxId]);

  const handleDelete = async () => {
    try {
      const { confirmed } = await confirm({
        title: '删除钱包',
        description: `确定要删除钱包 ${wallet.$name} 吗？`,
        confirmationText: '删除',
        cancellationText: '取消',
      });

      if (confirmed) {
        dispatch(removeWallet(wallet.$address));
      }
    } catch {
      // 用户取消操作，不需要处理
      console.log('用户取消删除操作');
    }
  };

  const handleTransfer = async (
    toAddress: string,
    lamports: number,
    pwd: string
  ) => {
    setTransferStatus(TransferStatus.InRPC);
    setTransferMessage('正在发起转账，请稍候...');

    transferMutation.mutate({
      toAddress,
      lamports,
      pwd,
    });
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(wallet.$address);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 1000);
    } catch (error) {
      console.error('复制地址失败:', error);
    }
  };

  //TODO: transferMessage 点击，跳转 solscan.io
  return (
    <Card key={wallet.$address}>
      <CardHeader
        title={
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={'space-between'}
          >
            <Chip
              label={wallet.$name}
              color="primary"
              variant="outlined"
              deleteIcon={
                <WalletDlg srcWallet={wallet} type="modify">
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
            fromAddress={wallet.$address}
            fromName={wallet.$name!}
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
        <Alert severity="error" sx={{ wordBreak: 'break-word' }}>
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
                <Button size="small" onClick={handleCopyAddress}>
                  复制
                </Button>
              )}
            </Stack>
          }
        >
          {wallet.$address}
        </Alert>
      </Collapse>
    </Card>
  );
}
