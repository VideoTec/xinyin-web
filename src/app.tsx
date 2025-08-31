import { WalletList } from './wallets';
import { WalletsCtx } from './walletsCtx';
import { useImmerReducer } from 'use-immer';
import { initWallets, walletsReducer } from './walletsData';
import Stack from '@mui/material/Stack';
import MyAppBar from './appBar';
import SideBar from './sideBar';
import { useState } from 'react';

function App() {
  const [wallets, dispatch] = useImmerReducer(walletsReducer, initWallets());
  const [openDraw, setOpenDraw] = useState(false);

  return (
    <WalletsCtx value={{ wallets, dispatch }}>
      <MyAppBar onAvatarClick={() => setOpenDraw(true)} />
      <SideBar open={openDraw} onClose={() => setOpenDraw(false)} />
      <Stack alignItems="center">
        <WalletList />
      </Stack>
    </WalletsCtx>
  );
}

export default App;
