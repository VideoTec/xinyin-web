import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.js";
import Container from "@mui/material/Container";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Container>
      <App />
    </Container>
  </React.StrictMode>
);
