import { useContext } from "react";
import { WalletsCtx } from "./walletsCtx";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionActions from "@mui/material/AccordionActions";
import Button from "@mui/material/Button";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useConfirm } from "material-ui-confirm";
import { WalletDetailDialog } from "./walletDetail";

export function Wallet({ address, name }: { address: string; name: string }) {
  const { dispatch } = useContext(WalletsCtx);
  const confirm = useConfirm();

  async function handleDelete() {
    const { confirmed } = await confirm({
      title: "删除钱包",
      description: `确定要删除钱包 ${name} 吗？`,
    });
    if (confirmed) {
      dispatch({ type: "delete", address });
    }
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
      </AccordionDetails>
      <AccordionActions>
        <Button onClick={handleDelete}>删除</Button>
        <WalletDetailDialog
          initAddress={address}
          initName={name}
          type="modify"
          openBtn={<Button>修改</Button>}
        />
      </AccordionActions>
    </Accordion>
  );
}
