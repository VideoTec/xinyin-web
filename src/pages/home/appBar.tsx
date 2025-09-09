import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import { green } from '@mui/material/colors';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { useClusterState, setCluster } from '../../store/cluster-store';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { SolanaClusterType } from '../../types/common';

export default function MyAppBar({
  onAvatarClick,
}: {
  onAvatarClick: () => void;
}) {
  const solanaCluster = useClusterState();

  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon onClick={onAvatarClick} />
        </IconButton>
        <Avatar sx={{ bgcolor: green[600] }}>Xy</Avatar>
        <Typography
          variant="h6"
          noWrap
          sx={{
            ml: 1,
            fontWeight: 700,
            color: 'inherit',
            textDecoration: 'none',
            flexGrow: 1,
          }}
        >
          数字钱包
        </Typography>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={solanaCluster}
            onChange={(event) => {
              setCluster(event.target.value as SolanaClusterType);
            }}
            sx={{
              fontSize: '0.75rem',
              height: 32,
              fontWeight: 'bold',
              '& .MuiSelect-select': {
                color: 'white',
                fontWeight: 'bold',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(144, 202, 249, 0.6)', // 柔和的浅蓝色
                borderWidth: 1,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(144, 202, 249, 0.8)', // 悬停时稍微加深
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#90CAF9', // 聚焦时使用更亮的蓝色
                borderWidth: 2,
              },
              '& .MuiSvgIcon-root': {
                color: 'rgba(255, 255, 255, 0.8)', // 图标使用稍透明的白色
              },
            }}
            displayEmpty
          >
            <MenuItem
              value={SolanaClusterType.mainnetBeta}
              sx={{ fontSize: '0.75rem' }}
            >
              🌐 主网
            </MenuItem>
            <MenuItem
              value={SolanaClusterType.devnet}
              sx={{ fontSize: '0.75rem' }}
            >
              🧪 开发网
            </MenuItem>
            <MenuItem
              value={SolanaClusterType.testnet}
              sx={{ fontSize: '0.75rem' }}
            >
              🧪 测试网
            </MenuItem>
          </Select>
        </FormControl>
      </Toolbar>
    </AppBar>
  );
}
