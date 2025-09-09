import { Wallet } from './wallet';
import { useEffect, useRef, useState } from 'react';
import Typography from '@mui/material/Typography';
import Gride from '@mui/material/Grid';
import WalletDlg from './walletDlg';
import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';
import Divider from '@mui/material/Divider';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  walletsSelector,
  loadWalletsByCluster,
  walletsErrorSelector,
  walletsLoadingSelector,
  resetWallets,
} from '../store/slice-wallets';
import { clusterSelector } from '../store/slice-solana-cluster';

export function WalletList() {
  const dispatch = useAppDispatch();
  const wallets = useAppSelector(walletsSelector);
  const loading = useAppSelector(walletsLoadingSelector);
  const error = useAppSelector(walletsErrorSelector);
  const cluster = useAppSelector(clusterSelector);
  const [showDivider, setShowDivider] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(resetWallets());
    dispatch(loadWalletsByCluster(cluster));
    return () => {};
  }, [cluster, dispatch]);

  useEffect(() => {
    const gridElement = gridRef.current;
    if (!gridElement) return;

    const observer = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        const entry = entries[0];
        const gridHeight = entry.contentRect.height;
        const screenHeight = window.innerHeight;
        setShowDivider(gridHeight > screenHeight - 120);
      }
    });

    observer.observe(gridElement);

    return () => {
      observer.disconnect();
    };
  }, [dispatch]);

  return (
    <>
      {loading && (
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          钱包列表加载中...
        </Typography>
      )}
      {error && (
        <Typography variant="h6" color="error" sx={{ textAlign: 'center' }}>
          加载钱包列表出错: {error}
        </Typography>
      )}
      <Fab sx={{ position: 'fixed', right: 16, bottom: 16 }}>
        <WalletDlg type="add">
          {({ triggerOpen }) => (
            <AddIcon onClick={triggerOpen} color="primary" />
          )}
        </WalletDlg>
      </Fab>
      {wallets && wallets.length > 0 && (
        <Gride container spacing={1} width={'100%'} ref={gridRef}>
          {wallets.map((wallet) => (
            <Gride key={wallet.address} size={{ xs: 12, sm: 6, md: 4 }}>
              <Wallet
                address={wallet.address}
                name={wallet.name}
                key={wallet.address}
              />
            </Gride>
          ))}
          {showDivider && (
            <Divider sx={{ width: '100%', mt: 4, mb: 2 }}>结束了</Divider>
          )}
        </Gride>
      )}
    </>
  );
}
