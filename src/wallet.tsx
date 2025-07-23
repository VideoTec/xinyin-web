import { useContext, useEffect, useState } from "react";
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
import {
  getAccountInfo,
  getSignatureStatuses,
  getBalance,
  getSignaturesForAddress,
} from "./rpc/solanaRpc";
import { transfer } from "./rpc/transfer";
import { CircularProgress } from "@mui/material";
import TransferDlg from "./transferDlg";

export function Wallet({ address, name }: { address: string; name: string }) {
  const { dispatch } = useContext(WalletsCtx)!;
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [owner, setOwner] = useState("");
  const [balance, setBalance] = useState("");

  const isNoneAccount = owner === "";

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
    transfer(address, toAddress, lamports, pwd).then((signature) => {
      getSignatureStatuses([signature], {
        searchTransactionHistory: false,
      }).then((statuses) => {
        console.log(`Signature statuses for (${signature}):\n`, statuses);
      });
    });
  }

  async function handleRefresh() {
    setRefreshing(true);
    const balance = await getBalance(address, { encoding: "base64" });
    const signatures = await getSignaturesForAddress(address, {
      encoding: "base64",
      limit: 1,
    });
    if (signatures.length > 0) {
      console.log(
        `Latest signature for ${address}:`,
        signatures[0].signature,
        signatures[0].confirmationStatus
      );
    }
    const sol = balance / 1e9; // Convert lamports to SOL
    setBalance(sol.toString());
    setRefreshing(false);
  }

  return (
    <Accordion key={address} sx={{ width: "800px", maxWidth: "90vw" }}>
      <AccordionSummary
        expandIcon={<ArrowDownwardIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography component="span">{name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <p style={{ wordBreak: "break-all" }}>{address}</p>
        {loading ? (
          <p>加载中...</p>
        ) : isNoneAccount ? (
          <p style={{ color: "red" }}>未找到账户信息</p>
        ) : (
          <>
            <p>
              余额: {balance} {refreshing && <CircularProgress />}
            </p>
            <p>所有者: {owner}</p>
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
                  转账
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
    </Accordion>
  );
}
