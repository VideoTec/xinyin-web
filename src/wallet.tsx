import { useContext, useEffect, useState, useCallback } from "react";
import { WalletsCtx } from "./walletsCtx";
import { rotate360deg } from "./customStyle";
import { useConfirm } from "material-ui-confirm";
import { getAccountInfo, getBalance } from "./rpc/solanaRpc";
import { transfer, loopGetTransferStatus } from "./rpc/transfer";
import { shortSolanaAddress, getErrorMsg, shortTransferID } from "./rpc/utils";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CircularProgress from "@mui/material/CircularProgress";
import TransferDlg from "./transferDlg";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import RefreshIcon from "@mui/icons-material/Refresh";
import Avatar from "@mui/material/Avatar";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import Typography from "@mui/material/Typography";
import WalletDlg from "./walletDlg";

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

type TitleActionsProps = {
  address: string;
  name: string;
  className?: string;
  onDelete: () => void;
};

function TitleActions(props: TitleActionsProps) {
  const { address, name, onDelete, ...rest } = props;

  return (
    <Stack direction={"row"} alignItems={"center"}>
      <WalletDlg initAddress={address} initName={name} type="modify">
        {({ triggerOpen }) => (
          <EditIcon
            style={{ marginRight: 12 }}
            {...rest}
            className={rest.className}
            onClick={(e) => {
              e.stopPropagation();
              triggerOpen();
            }}
          />
        )}
      </WalletDlg>
      <DeleteIcon
        {...rest}
        className={rest.className}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      />
    </Stack>
  );
}

export function Wallet({ address, name }: { address: string; name: string }) {
  const { dispatch } = useContext(WalletsCtx)!;
  const confirm = useConfirm();
  const [accountLoading, setAccountLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [transferID, setTransferID] = useState("");
  const [owner, setOwner] = useState("");
  const [balance, setBalance] = useState("");
  const [transferStatus, setTransferStatus] = useState(TransferStatus.Init);
  const [transferMessage, setTransferMessage] = useState("");

  const isNoneAccount = owner === "";
  const isTransferring =
    transferStatus === TransferStatus.InRPC ||
    transferStatus === TransferStatus.LoopStatus;

  const loadBalance = useCallback(async () => {
    setBalanceLoading(true);
    const balance = await getBalance(address, { encoding: "base64" });
    const sol = balance / 1e9; // Convert lamports to SOL
    setBalance(sol.toString());
    setBalanceLoading(false);
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
          } else {
            console.warn("No account info found for address:", address);
          }
        },
        (error) => {
          console.error("Error fetching wallet data:", error);
        }
      )
      .finally(() => {
        setAccountLoading(false);
      });
  }, [address]);

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

  //TODO : 地址点击，弹窗，显示完整地址
  return (
    <Accordion key={address}>
      <AccordionSummary aria-controls="panel1-content" id="panel1-header">
        <Chip
          sx={{ width: "100%", justifyContent: "space-between" }}
          label={name}
          avatar={<Avatar>W</Avatar>}
          color="primary"
          variant="outlined"
          deleteIcon={
            <TitleActions
              name={name}
              address={address}
              onDelete={handleDelete}
            />
          }
          onDelete={() => {}}
        />
      </AccordionSummary>
      <AccordionDetails
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Chip
          label={shortSolanaAddress(address)}
          variant="outlined"
          color="success"
        />
        {accountLoading ? (
          <CircularProgress
            sx={{ color: "primary.main", marginTop: 4, marginBottom: 2 }}
          />
        ) : isNoneAccount ? (
          <>
            <Typography
              variant="h6"
              color="error"
              sx={{ marginTop: 4, marginBottom: 4 }}
            >
              未找到账户信息
            </Typography>
            <IconButton onClick={loadAccount} color="primary">
              <RefreshIcon />
            </IconButton>
          </>
        ) : (
          <>
            <Chip
              label={balance}
              variant="outlined"
              color="primary"
              sx={{ marginTop: 4, marginBottom: 2 }}
              avatar={<Avatar>SOL</Avatar>}
              onDelete={() => {
                if (!balanceLoading) loadBalance();
              }}
              deleteIcon={
                <RefreshIcon
                  sx={{ animation: balanceLoading ? rotate360deg : undefined }}
                />
              }
            />
            <TransferDlg
              fromAddress={address}
              fromName={name}
              onResult={handleTransfer}
              renderOpenBtn={({ triggerOpen }) => (
                <Button
                  variant="outlined"
                  onClick={triggerOpen}
                  id="transfer-btn"
                  disabled={isTransferring || balanceLoading}
                >
                  转账
                </Button>
              )}
            />
          </>
        )}
      </AccordionDetails>
      <Collapse in={transferStatus !== TransferStatus.Init}>
        <Alert
          severity={
            transferStatus === TransferStatus.Failed
              ? "error"
              : transferStatus === TransferStatus.Success
              ? "success"
              : "info"
          }
          sx={{ margin: 2, wordBreak: "break-word" }}
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
    </Accordion>
  );
}
