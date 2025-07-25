import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.js";
import Container from "@mui/material/Container";
import { ConfirmProvider } from "material-ui-confirm";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { green } from "@mui/material/colors";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Container sx={{ padding: 0 }}>
      <ConfirmProvider>
        <>
          <AppBar position="static" sx={{ mb: 2 }}>
            <Toolbar>
              <Stack direction="row" alignItems="center">
                <Avatar sx={{ bgcolor: green[600] }}>Xy</Avatar>
                <Typography variant="h6" sx={{ ml: 1 }}>
                  数字钱包
                </Typography>
              </Stack>
            </Toolbar>
          </AppBar>
          <App />
        </>
      </ConfirmProvider>
    </Container>
  </React.StrictMode>
);
