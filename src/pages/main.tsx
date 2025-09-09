import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './home/app';
import Login from './login/login';
import Register from './login/register';
import Container from '@mui/material/Container';
import { ConfirmProvider } from 'material-ui-confirm';
import { BrowserRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import GlobalWidget from '../components/globalWidget';
import store from '../store/store';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <Container sx={{ padding: 0 }}>
        <ConfirmProvider>
          <BrowserRouter basename={import.meta.env.VITE_REACT_ROUTE_BASE}>
            <QueryClientProvider client={queryClient}>
              <GlobalWidget>
                <Routes>
                  <Route path="/" element={<App />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Routes>
              </GlobalWidget>
            </QueryClientProvider>
          </BrowserRouter>
        </ConfirmProvider>
      </Container>
    </Provider>
  </React.StrictMode>
);
