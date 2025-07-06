import { useContext } from "react";
import { WalletsCtx } from "./walletsCtx";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionActions from "@mui/material/AccordionActions";
import Button from "@mui/material/Button";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

export function Wallet({ address, name }: { address: string; name: string }) {
  const { dispatch } = useContext(WalletsCtx);

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
