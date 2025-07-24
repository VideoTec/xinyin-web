import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.js";
import Container from "@mui/material/Container";
import { ConfirmProvider } from "material-ui-confirm";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Container sx={{ padding: 0 }}>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </Container>
  </React.StrictMode>
);
