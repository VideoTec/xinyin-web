import { useContext, useEffect, useState, useCallback } from "react";
import { WalletsCtx } from "./walletsCtx";
import { rotate360deg } from "./customStyle";
import { useConfirm } from "material-ui-confirm";
import { getAccountInfo, getBalance } from "./rpc/solanaRpc";
import { transfer, loopGetTransferStatus } from "./rpc/transfer";
import { getErrorMsg, shortTransferID } from "./rpc/utils";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import TransferDlg from "./transferDlg";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import RefreshIcon from "@mui/icons-material/Refresh";
import Avatar from "@mui/material/Avatar";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WalletDlg from "./walletDlg";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";

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

export function Wallet({ address, name }: { address: string; name: string }) {
  const { dispatch } = useContext(WalletsCtx)!;
  const confirm = useConfirm();
  const [accountLoading, setAccountLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string>("");
  const [transferID, setTransferID] = useState("");
  const [owner, setOwner] = useState("");
  const [balance, setBalance] = useState("");
  const [transferStatus, setTransferStatus] = useState(TransferStatus.Init);
  const [transferMessage, setTransferMessage] = useState("");
  const [showAddress, setShowAddress] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const isNoneAccount = owner === "";
  const isTransferring =
    transferStatus === TransferStatus.InRPC ||
    transferStatus === TransferStatus.LoopStatus;

  const loadBalance = useCallback(async () => {
    setBalanceLoading(true);
    getBalance(address, { encoding: "base64" })
      .then((balance) => {
        if (balance === 0) {
          setOwner("");
          return;
        }
        const sol = balance / 1e9; // Convert lamports to SOL
        setBalance(sol.toString());
      })
      .catch((error) => {
        setLoadingError(getErrorMsg(error));
      })
      .finally(() => {
        setBalanceLoading(false);
      });
  }, [address]);

  const loadAccount = useCallback(async () => {
    setAccountLoading(true);
    getAccountInfo(address, { encoding: "base64" })
      .then(
        (data) => {
          if (data) {
            setOwner(data.owner);
            const sol = data.lamports / 1e9; // Convert lamports to SOL
            setBalance(sol.toString());
            setLoadingError("");
          } else {
            setLoadingError("未找到账户信息");
          }
        },
        (error) => {
          setLoadingError(getErrorMsg(error));
        }
      )
      .finally(() => {
        setAccountLoading(false);
      });
  }, [address]);

  // TODO: 缓存账户信息，避免每次启动都加载
  useEffect(() => {
    loadAccount();
  }, [address, loadAccount]);

  // FIXME: return 不能停止 loop
  useEffect(() => {
    if (transferID) {
      setTransferStatus(TransferStatus.LoopStatus);
      setTransferMessage(
        `正在查询转账状态，签名 ID: ${shortTransferID(transferID)}`
      );

      return loopGetTransferStatus(
        transferID,
        (status) => {
          setTransferMessage(
            `转账状态: ${status.confirmationStatus}, 确认数: ${status.confirmations}`
          );
        },
        (error) => {
          if (!error) {
            loadBalance();
            setTransferStatus(TransferStatus.Success);
            setTransferMessage(
              `转账成功，签名 ID: ${shortTransferID(transferID)}`
            );
          } else {
            setTransferStatus(TransferStatus.Failed);
            setTransferMessage(
              `查询转账状态失败，签名 ID: ${shortTransferID(
                transferID
              )}，错误信息: ${getErrorMsg(error)}`
            );
          }
        }
      );
    }
  }, [transferID, loadBalance]);

  // FIXME 显示、隐藏确认框迟钝，release 版本没有问题
  async function handleDelete() {
    const { confirmed } = await confirm({
      title: "删除钱包",
      description: `确定要删除钱包 ${name} 吗？`,
      confirmationText: "删除",
      cancellationText: "取消",
    });
    if (confirmed) {
      dispatch({ type: "delete", address });
    }
  }

  async function handleTransfer(
    toAddress: string,
    lamports: number,
    pwd: string
  ) {
    setTransferStatus(TransferStatus.InRPC);
    setTransferMessage("正在发起转账，请稍候...");
    transfer(address, toAddress, lamports, pwd)
      .then((signature) => {
        setTransferMessage(
          `转账已发起: ${signature.slice(0, 4)}...${signature.slice(-4)}`
        );
        setTransferID(signature);
      })
      .catch((error) => {
        setTransferStatus(TransferStatus.Failed);
        setTransferMessage(`发起转账失败，错误信息: ${getErrorMsg(error)}`);
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
            justifyContent={"space-between"}
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
                console.log("Delete wallet");
              }}
            />
            {isNoneAccount ? (
              <Chip
                label={accountLoading ? "加载中..." : "空账户"}
                variant="outlined"
                color={accountLoading ? "primary" : "error"}
                onDelete={() => {
                  if (!accountLoading) loadAccount();
                }}
                deleteIcon={
                  <RefreshIcon
                    sx={{
                      animation: accountLoading ? rotate360deg : undefined,
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
                  if (!balanceLoading) loadBalance();
                }}
                deleteIcon={
                  <RefreshIcon
                    sx={{
                      animation: balanceLoading ? rotate360deg : undefined,
                    }}
                  />
                }
              />
            )}
          </Stack>
        }
        sx={{ cursor: "pointer" }}
        onClick={() => {
          setShowAddress(!showAddress);
        }}
      />
      <CardActions sx={{ justifyContent: "end" }}>
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
                disabled={isTransferring || balanceLoading || isNoneAccount}
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
              ? "error"
              : transferStatus === TransferStatus.Success
              ? "success"
              : "info"
          }
          sx={{ wordBreak: "break-word" }}
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
                  setTransferMessage("");
                  setTransferID("");
                }
          }
        >
          {transferMessage}
        </Alert>
      </Collapse>
      <Collapse in={loadingError !== ""}>
        <Alert
          severity="error"
          sx={{ wordBreak: "break-word" }}
          onClose={() => setLoadingError("")}
        >
          {loadingError}
        </Alert>
      </Collapse>
      <Collapse in={showAddress}>
        <Alert
          sx={{ wordBreak: "break-all" }}
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
