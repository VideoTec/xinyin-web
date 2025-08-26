import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import Login from "./login";
import Register from "./register";
import Container from "@mui/material/Container";
import { ConfirmProvider } from "material-ui-confirm";
import { BrowserRouter, Routes, Route } from "react-router";
import "./xinyin/xinyinMain.js";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Container sx={{ padding: 0 }}>
      <ConfirmProvider>
        <BrowserRouter basename={import.meta.env.VITE_REACT_ROUTE_BASE}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </BrowserRouter>
      </ConfirmProvider>
    </Container>
  </React.StrictMode>
);
