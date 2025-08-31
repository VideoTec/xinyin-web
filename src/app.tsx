import { WalletList } from './wallets';
import { WalletsCtx } from './walletsCtx';
import { useImmerReducer } from 'use-immer';
import { initWallets, walletsReducer } from './walletsData';
import Stack from '@mui/material/Stack';
import MyAppBar from './appBar';

function App() {
  const [wallets, dispatch] = useImmerReducer(walletsReducer, initWallets());

  return (
    <WalletsCtx value={{ wallets, dispatch }}>
      <MyAppBar />
      <Stack alignItems="center">
        <WalletList />
      </Stack>
    </WalletsCtx>
  );
}

export default App;
