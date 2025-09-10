import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import xinyinApi from '../xinyin/xinyin-main';
import { useTheme } from '@mui/material/styles';
import { isValidSolanaAddress } from '../utils';
import { addWallet, walletsSelector } from '../store/slice-wallets';
import { useDispatch, useSelector } from 'react-redux';
import { useClusterState } from '../store/cluster-store';

const initialWordCount = 600; // 假设初始字数为600
const initialStartIndex = 8; // 假设初始开始序号为8

enum Step {
  ChooseCharset,
  InputXinyinText,
  InputWords32,
}

interface XinyinTxt {
  startIndex: number;
  wordCount: number;
  xinyinText: string;
  words32: string;
  password: string;
  repeatPassword: string;
  walletName: string;
}

export default function XinyinDlg({
  type,
  children,
}: {
  type: 'generate' | 'import';
  children: (props: { triggerOpen: () => void }) => ReactElement;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(Step.ChooseCharset);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWords32, setGeneratedWords32] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const solanaCluster = useClusterState();
  const wallets = useSelector(walletsSelector);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    resetField,
    trigger,
    watch,
  } = useForm<XinyinTxt>({
    defaultValues: {
      startIndex: initialStartIndex,
      wordCount: initialWordCount,
      xinyinText: '',
      words32: '',
      password: '',
      repeatPassword: '',
      walletName: '',
    },
  });

  const title = type === 'generate' ? '生成心印助记字' : '导入心印助记字';

  function handleOpen() {
    setOpen(true);
    setStep(Step.ChooseCharset);
    setIsGenerating(false);
    setGeneratedWords32('');
    setShowPassword(false);
    setIsImporting(false);
    reset({
      startIndex: initialStartIndex,
      wordCount: initialWordCount,
      xinyinText: '',
      words32: '',
      password: '',
      repeatPassword: '',
      walletName: '',
    });
  }

  function handleFormSubmit(data: XinyinTxt) {
    if (type == 'generate' && step == Step.InputXinyinText) {
      setIsGenerating(true);
      xinyinApi
        .generateWords32(data.xinyinText, data.startIndex, data.wordCount)
        .then((w32) => {
          setGeneratedWords32(w32);
          setIsGenerating(false);
        });
    } else if (type == 'import' && step == Step.InputWords32) {
      setIsImporting(true);
      xinyinApi
        .importWords32(
          data.words32,
          data.xinyinText,
          data.startIndex,
          data.wordCount,
          data.password
        )
        .then((solanaAddress) => {
          const w =
            wallets && wallets.find((w) => w.$address === solanaAddress);
          if (w) {
            throw new Error(`导入过的助记字，钱包名称是：'${w.$name}'`);
          }
          if (!solanaAddress || !isValidSolanaAddress(solanaAddress)) {
            throw new Error('导入心印助记字失败，未生成有效的钱包地址');
          }
          dispatch(
            addWallet({
              $address: solanaAddress,
              $name: data.walletName,
              $cluster: solanaCluster,
              $balance: 0,
              $hasKey: true,
              $isMine: true,
            })
          );
          setOpen(false);
        })
        .catch((error) => {
          setIsImporting(false);
          alert('导入心印助记字失败: ' + (error.message || '未知错误'));
        });
    } else {
      console.log('submit wrong time...');
    }
  }

  function nextStep() {
    if (step == Step.ChooseCharset) {
      trigger(['startIndex', 'wordCount']).then((r) => {
        if (r) {
          setStep(Step.InputXinyinText);
          setGeneratedWords32('');
        }
      });
    }
    if (type == 'import') {
      if (step == Step.InputXinyinText) {
        trigger('xinyinText').then((r) => {
          if (r) {
            setStep(Step.InputWords32);
            resetField('password');
            resetField('repeatPassword');
          }
        });
      }
    }
  }

  function validateXinyinText(text: string): boolean | string {
    if (!text || text.trim() === '') {
      return '心印文本不能为空';
    }
    return true;
  }

  function validateWords32(words: string): boolean | string {
    if (!words || words.trim() === '') {
      return '心印助记字不能为空';
    }
    if (words.length !== 32) {
      return '心印助记字必须是32个汉字';
    }
    if (!/^[\u4e00-\u9fa5]+$/.test(words)) {
      return '心印助记字必须是汉字';
    }
    // if (new Set(words.split("")).size !== 32) {
    //   return "心印助记字中的汉字必须唯一";
    // }
    return true;
  }

  function validateStartIndex(value: number): boolean | string {
    if (isNaN(value)) {
      return '输入的开始序号必须是数字';
    }

    if (value < 1) {
      return '开始的序号从1开始';
    }

    if (value + watch('wordCount') > 8105) {
      return '选择范围不能超过8105';
    }

    return true;
  }

  function validateWordCount(value: number): boolean | string {
    if (isNaN(value)) {
      return '输入的字数必须是数字';
    }

    if (value <= 500) {
      return '不能少于500个汉字';
    }

    if (value + watch('startIndex') > 8105) {
      return '选择范围不能超过8105';
    }
    return true;
  }

  function validateWalletName(name: string): boolean | string {
    if (wallets && wallets.some((w) => w.$name === name)) {
      return '钱包名称已存在';
    }
    return true;
  }

  return (
    <>
      {children({ triggerOpen: handleOpen })}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus={true}
        disableAutoFocus={false}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack
            component="form"
            spacing={2}
            sx={{ paddingTop: 2 }}
            onSubmit={handleSubmit(handleFormSubmit)}
          >
            {step == Step.ChooseCharset && (
              <>
                <TextField
                  label="开始的序号"
                  fullWidth
                  autoComplete="off"
                  {...register('startIndex', {
                    valueAsNumber: true,
                    validate: validateStartIndex,
                  })}
                  error={!!errors.startIndex}
                  helperText={
                    errors.startIndex ? errors.startIndex.message : ''
                  }
                />
                <TextField
                  label="字数"
                  fullWidth
                  autoComplete="off"
                  {...register('wordCount', {
                    valueAsNumber: true,
                    validate: validateWordCount,
                  })}
                  error={!!errors.wordCount}
                  helperText={errors.wordCount ? errors.wordCount.message : ''}
                />
              </>
            )}
            {step == Step.InputXinyinText && (
              <>
                <Typography variant="body2" color="text.secondary">
                  请输入心印文本，只有自己知道的一句话，用于密钥派生和字表生成。建议为20字符以上，包含多种字符类型，避免使用常见语句或个人信息。例如：“星辰大海，心自无疆。”
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    marginBottom: 1,
                  }}
                >
                  <span
                    style={{
                      color: theme.palette.error.main,
                      fontWeight: theme.typography.fontWeightBold,
                    }}
                  >
                    不要输入&nbsp;
                  </span>
                  正式使用的心印文本，这里只是演示使用。
                </Typography>
                <TextField
                  label="心印文本"
                  fullWidth
                  autoComplete="off"
                  {...register('xinyinText', { validate: validateXinyinText })}
                  error={!!errors.xinyinText}
                  helperText={
                    errors.xinyinText ? errors.xinyinText.message : ''
                  }
                />
              </>
            )}
            {step == Step.InputWords32 && (
              <>
                <TextField
                  label="心印助记字"
                  fullWidth
                  autoComplete="off"
                  {...register('words32', {
                    validate: validateWords32,
                  })}
                  error={!!errors.words32}
                  helperText={
                    errors.words32
                      ? errors.words32.message
                      : '心印助记字（32个汉字）'
                  }
                />
                <TextField
                  label="钱包名称"
                  fullWidth
                  autoComplete="username"
                  {...register('walletName', {
                    required: '必须填写钱包名称',
                    validate: validateWalletName,
                  })}
                  error={!!errors.walletName}
                  helperText={
                    errors.walletName
                      ? errors.walletName.message
                      : '给导入的钱包起个名字'
                  }
                />
                <TextField
                  label="密码"
                  autoComplete="new-password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  {...register('password', {
                    required: '必须填写密码',
                    minLength: {
                      value: 8,
                      message: '密码至少8个字符',
                    },
                  })}
                  error={!!errors.password}
                  helperText={
                    errors.password
                      ? errors.password.message
                      : '请输入密码，用于加密导入的钱包'
                  }
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  label="重复密码"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  fullWidth
                  {...register('repeatPassword', {
                    required: '必须重复输入密码',
                    validate: (value) =>
                      value === watch('password') || '两次输入的密码不一致',
                  })}
                  error={!!errors.repeatPassword}
                  helperText={
                    errors.repeatPassword
                      ? errors.repeatPassword.message
                      : '请重复输入密码'
                  }
                />
              </>
            )}
            <DialogActions>
              {step == Step.ChooseCharset && (
                <Button onClick={nextStep}>下一步</Button>
              )}
              {step == Step.InputXinyinText && (
                <>
                  <Button onClick={() => setStep(Step.ChooseCharset)}>
                    上一步
                  </Button>
                  {type == 'generate' && (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isGenerating}
                    >
                      生成心印助记字
                    </Button>
                  )}
                  {type == 'import' && (
                    <Button onClick={nextStep}>下一步</Button>
                  )}
                </>
              )}
              {step == Step.InputWords32 && (
                <>
                  <Button onClick={() => setStep(Step.InputXinyinText)}>
                    上一步
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isImporting}
                  >
                    导入心印助记字
                  </Button>
                </>
              )}
            </DialogActions>
            {type == 'generate' && step == Step.InputXinyinText && (
              <>
                <Typography color="text.secondary" variant="body2">
                  生成的心印助记字：
                  <br />
                  用于表示加密密钥的32个汉字，每个汉字唯一对应加密密钥中的一个字节
                </Typography>
                <Typography color="success" variant="body2">
                  {generatedWords32}
                </Typography>
              </>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

// 8,600 星辰大海，心自无疆。 延考饥生阳至岂丈纠吉氏犬叼合宇导弗八异士卉色血叮戏为凤麦孕凸平饥
