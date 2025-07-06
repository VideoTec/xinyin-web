import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import Stack from "@mui/material/Stack";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionActions from "@mui/material/AccordionActions";
import { useContext } from "react";
import { WalletListCtx } from "./wallet_list_ctx";
import Button from "@mui/material/Button";

export function Wallet({ address, name }: { address: string; name: string }) {
  const { dispatch } = useContext(WalletListCtx);
  function handleDelete() {
    if (window.confirm(`确定要删除钱包 ${name} 吗？`)) {
      dispatch({ type: "delete", address });
    }
  }
  return (
    <Accordion key={address} sx={{ width: "400px", maxWidth: "90vw" }}>
      <AccordionSummary
        expandIcon={<ArrowDownwardIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography component="span">{address}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="h6">{name}</Typography>
      </AccordionDetails>
      <AccordionActions>
        <Button onClick={handleDelete}>删除</Button>
        <Button>修改</Button>
      </AccordionActions>
    </Accordion>
  );
}

export function WalletList() {
  const { wallets, dispatch } = useContext(WalletListCtx);

  function handleAddWallet() {
    const newWallet = {
      address: `0x${Math.random().toString(16).slice(2, 42)}`,
      name: `钱包${wallets.length + 1}`,
    };

    if (wallets.some((wallet) => wallet.address === newWallet.address)) {
      alert("钱包地址已存在，无法添加重复的钱包 " + newWallet.address);
      return;
    }
    dispatch({ type: "add", wallet: newWallet });
  }

  if (!wallets || wallets.length === 0) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="100vh">
        <Button variant="contained" onClick={handleAddWallet}>
          添加钱包
        </Button>
        <Typography variant="h6">没有可用的钱包</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} alignItems="center">
      <Button variant="contained" onClick={handleAddWallet}>
        添加钱包
      </Button>
      {wallets.map((wallet) => (
        <Wallet
          address={wallet.address}
          name={wallet.name}
          key={wallet.address}
        />
      ))}
    </Stack>
  );
}
