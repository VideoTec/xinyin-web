import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import { green } from '@mui/material/colors';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import XinyinDlg from './xinyinDlg';
import IconButton from '@mui/material/IconButton';
import { GenerateWords32Icon, ImportWords32Icon } from './icons';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useState } from 'react';
import { getCurrentCluster, SolanaClusterType } from './rpc/solanaRpcClient';
import ToggleButton from '@mui/material/ToggleButton';

export default function MyAppBar({
  onAvatarClick,
}: {
  onAvatarClick: () => void;
}) {
  const [solanaCluster, setSolanaCluster] = useState<SolanaClusterType>(
    getCurrentCluster()
  );
  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar>
        <Avatar sx={{ bgcolor: green[600] }} onClick={onAvatarClick}>
          Xy
        </Avatar>
        <Typography variant="h6" sx={{ ml: 1 }} flexGrow={1}>
          数字钱包
        </Typography>
        <XinyinDlg type="generate">
          {({ triggerOpen }) => (
            <IconButton sx={{ mr: 1 }} onClick={triggerOpen}>
              <GenerateWords32Icon />
            </IconButton>
          )}
        </XinyinDlg>
        <XinyinDlg type="import">
          {({ triggerOpen }) => (
            <IconButton sx={{ mr: 1 }} onClick={triggerOpen}>
              <ImportWords32Icon />
            </IconButton>
          )}
        </XinyinDlg>{' '}
        <ToggleButtonGroup
          value={solanaCluster}
          exclusive
          size="small"
          onChange={(_, newCluster) => {
            if (newCluster) {
              setSolanaCluster(newCluster);
            }
          }}
          aria-label="text alignment"
        >
          <ToggleButton
            value={SolanaClusterType.mainnetBeta}
            aria-label="left aligned"
            sx={{ fontSize: '0.5rem' }}
          >
            Main
          </ToggleButton>
          <ToggleButton
            value={SolanaClusterType.devnet}
            aria-label="centered"
            sx={{ fontSize: '0.5rem' }}
          >
            Devnet
          </ToggleButton>
          <ToggleButton
            value={SolanaClusterType.testnet}
            aria-label="right aligned"
            sx={{ fontSize: '0.5rem' }}
          >
            Testnet
          </ToggleButton>
        </ToggleButtonGroup>
      </Toolbar>
    </AppBar>
  );
}
