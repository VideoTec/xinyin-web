import { WalletList } from '../../components/wallets';
import Stack from '@mui/material/Stack';
import MyAppBar from './appBar';
import SideBar from './sideBar';
import { useState } from 'react';

function App() {
  const [openDraw, setOpenDraw] = useState(false);

  return (
    <>
      <MyAppBar onAvatarClick={() => setOpenDraw(true)} />
      <SideBar open={openDraw} onClose={() => setOpenDraw(false)} />
      <Stack alignItems="center" sx={{ width: '100%' }}>
        <WalletList />
      </Stack>
    </>
  );
}

export default App;
