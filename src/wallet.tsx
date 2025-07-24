import { useContext, useEffect, useState, useCallback } from "react";
import { WalletsCtx } from "./walletsCtx";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionActions from "@mui/material/AccordionActions";
import Button from "@mui/material/Button";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useConfirm } from "material-ui-confirm";
import { WalletDlg } from "./walletDlg";
import { getAccountInfo, getBalance } from "./rpc/solanaRpc";
import { transfer, loopGetTransferStatus } from "./rpc/transfer";
import { CircularProgress, Collapse } from "@mui/material";
import TransferDlg from "./transferDlg";
import Alert from "@mui/material/Alert";
import { shortSolanaAddress } from "./rpc/utils";
import Chip from "@mui/material/Chip";
import ContentCopy from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import Avatar from "@mui/material/Avatar";
import { rotate360deg } from "./customStyle";

export function Wallet({ address, name }: { address: string; name: string }) {
  const { dispatch } = useContext(WalletsCtx)!;
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [transferID, setTransferID] = useState("");
  const [owner, setOwner] = useState("");
  const [balance, setBalance] = useState("");
  const [startTransferSuccess, setStartTransferSuccess] = useState(false);
  const [startTransferFailedMessage, setStartTransferFailedMessage] =
    useState("");
  const [transferSuccess, setTransferSuccess] = useState(false);

  const isNoneAccount = owner === "";

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const balance = await getBalance(address, { encoding: "base64" });
    const sol = balance / 1e9; // Convert lamports to SOL
    setBalance(sol.toString());
    setRefreshing(false);
  }, [address]);

  useEffect(() => {
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
        setLoading(false);
      });
  }, [address]);

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
            handleRefresh();
            setTransferSuccess(true);
          } else {
            console.error(
              `Error fetching transfer status for ${transferID}:${error}`
            );
          }
        }
      );
    }
  }, [transferID, handleRefresh]);

  async function handleDelete() {
    const { confirmed } = await confirm({
      title: "删除钱包",
      description: `确定要删除钱包 ${name} 吗？`,
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
  //TODO : 修改，删除按钮 放到 AccordionSummary 里面
  //TODO : 地址旁边增加复制按钮，使用合适的组件，联合展示
  //TODO : 余额旁边增加刷新按钮，使用合适的组件，联合展示
  //TODO : 未找到的账户，提供刷新重试功能
  return (
    <Accordion key={address}>
      <AccordionSummary
        expandIcon={<ArrowDownwardIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography component="span">{name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Chip
          label={shortSolanaAddress(address)}
          variant="outlined"
          color="success"
          avatar={<Avatar>A</Avatar>}
          onDelete={() => {}}
          deleteIcon={<ContentCopy />}
        />
        {loading ? (
          <p>加载中...</p>
        ) : isNoneAccount ? (
          <p style={{ color: "red" }}>未找到账户信息</p>
        ) : (
          <>
            <Chip
              label={balance}
              variant="outlined"
              color="success"
              avatar={<Avatar>B</Avatar>}
              onDelete={() => {
                if (!refreshing) handleRefresh();
              }}
              deleteIcon={
                <RefreshIcon
                  sx={{ animation: refreshing ? rotate360deg : undefined }}
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
                >
                  {transferring ? (
                    <CircularProgress size={24} sx={{ marginLeft: 2 }} />
                  ) : (
                    "转账"
                  )}
                </Button>
              )}
            />
            <Button variant="outlined" onClick={handleRefresh}>
              刷新
            </Button>
          </>
        )}
      </AccordionDetails>
      <AccordionActions>
        <Button onClick={handleDelete}>删除</Button>
        <WalletDlg initAddress={address} initName={name} type="modify">
          {({ triggerOpen }) => <Button onClick={triggerOpen}>修改</Button>}
        </WalletDlg>
      </AccordionActions>
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
