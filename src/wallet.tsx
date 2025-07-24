import { useContext, useEffect, useState, useCallback } from "react";
import { WalletsCtx } from "./walletsCtx";
import { rotate360deg } from "./customStyle";
import { useConfirm } from "material-ui-confirm";
import { WalletDlg } from "./walletDlg";
import { getAccountInfo, getBalance } from "./rpc/solanaRpc";
import { transfer, loopGetTransferStatus } from "./rpc/transfer";
import { shortSolanaAddress } from "./rpc/utils";
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
import Typography from "@mui/material/Typography";

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
  const [transferring, setTransferring] = useState(false);
  const [transferID, setTransferID] = useState("");
  const [owner, setOwner] = useState("");
  const [balance, setBalance] = useState("");
  const [startTransferSuccess, setStartTransferSuccess] = useState(false);
  const [startTransferFailedMessage, setStartTransferFailedMessage] =
    useState("");
  const [transferSuccess, setTransferSuccess] = useState(false);

  const isNoneAccount = owner === "";

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

  useEffect(() => {
    if (transferID) {
      setTransferring(true);

      return loopGetTransferStatus(
        transferID,
        (status) => {
          console.log(`Signature (${transferID}):${status.confirmations}`);
        },
        (error) => {
          setTransferring(false);
          if (!error) {
            loadBalance();
            setTransferSuccess(true);
          } else {
            console.error(
              `Error fetching transfer status for ${transferID}:${error}`
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
    setTransferring(true);
    transfer(address, toAddress, lamports, pwd)
      .then((signature) => {
        setTransferID(signature);
        setStartTransferSuccess(true);
      })
      .catch((error) => {
        setTransferring(false);
        let msg = "发起转账失败\n";
        if (error instanceof Error) {
          msg += error.message;
        }
        setStartTransferFailedMessage(msg);
        console.error("Transfer failed:", error);
      });
  }

  //TODO : 发起转账，转账中，转账完成 归到一个 alert 里面
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
                  disabled={transferring || balanceLoading}
                >
                  转账
                </Button>
              )}
            />
          </>
        )}
      </AccordionDetails>
      <Collapse in={startTransferSuccess}>
        <Alert
          severity="success"
          onClose={() => setStartTransferSuccess(false)}
        >
          成功发起转账
        </Alert>
      </Collapse>
      <Collapse in={transferSuccess}>
        <Alert severity="success" onClose={() => setTransferSuccess(false)}>
          转账成功
        </Alert>
      </Collapse>
      <Collapse in={startTransferFailedMessage !== ""}>
        <Alert
          severity="error"
          onClose={() => setStartTransferFailedMessage("")}
        >
          {startTransferFailedMessage}
        </Alert>
      </Collapse>
    </Accordion>
  );
}
