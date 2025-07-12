import {
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import { useState, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { generateWords32 } from "./xinyin/xinyinMain";
import { useTheme } from "@mui/material/styles";

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
}

export function XinyinDlg({
  type,
  children,
}: {
  type: "generate" | "import";
  children: (props: { triggerOpen: () => void }) => ReactElement;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(Step.ChooseCharset);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWords32, setGeneratedWords32] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
    watch,
  } = useForm<XinyinTxt>({
    defaultValues: {
      startIndex: initialStartIndex,
      wordCount: initialWordCount,
      xinyinText: "",
    },
  });

  const title = type === "generate" ? "生成心印助记字" : "导入心印助记字";

  function handleOpen() {
    setOpen(true);
    setStep(Step.ChooseCharset);
    setIsGenerating(false);
    setGeneratedWords32("");
    reset({
      startIndex: initialStartIndex,
      wordCount: initialWordCount,
      xinyinText: "",
    });
  }

  function handleFormSubmit(data: XinyinTxt) {
    if (type == "generate" && step == Step.InputXinyinText) {
      setIsGenerating(true);
      generateWords32(data.xinyinText, data.startIndex, data.wordCount).then(
        (w32) => {
          setGeneratedWords32(w32);
          setIsGenerating(false);
        }
      );
    } else if (type == "import" && step == Step.InputWords32) {
      console.log(data);
    } else {
      console.log("submit wrong time...");
    }
  }

  function nextStep() {
    if (type == "generate") {
      if (step == Step.ChooseCharset) {
        trigger(["startIndex", "wordCount"]).then((r) => {
          if (r) {
            setStep(Step.InputXinyinText);
            setGeneratedWords32("");
          }
        });
      }
    }
  }

  function validateXinyinText(text: string): boolean | string {
    if (!text || text.trim() === "") {
      return "心印文本不能为空";
    }
    return true;
  }

  function validateStartIndex(value: number): boolean | string {
    if (isNaN(value)) {
      return "输入的开始序号必须是数字";
    }

    if (value < 1) {
      return "开始的序号从1开始";
    }

    if (value + watch("wordCount") > 8105) {
      return "选择范围不能超过8105";
    }

    return true;
  }

  function validateWordCount(value: number): boolean | string {
    if (isNaN(value)) {
      return "输入的字数必须是数字";
    }

    if (value <= 500) {
      return "不能少于500个汉字";
    }

    if (value + watch("startIndex") > 8105) {
      return "选择范围不能超过8105";
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
                  {...register("startIndex", {
                    valueAsNumber: true,
                    validate: validateStartIndex,
                  })}
                  error={!!errors.startIndex}
                  helperText={
                    errors.startIndex ? errors.startIndex.message : ""
                  }
                />
                <TextField
                  label="字数"
                  fullWidth
                  autoComplete="off"
                  {...register("wordCount", {
                    valueAsNumber: true,
                    validate: validateWordCount,
                  })}
                  error={!!errors.wordCount}
                  helperText={errors.wordCount ? errors.wordCount.message : ""}
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
                  {...register("xinyinText", { validate: validateXinyinText })}
                  error={!!errors.xinyinText}
                  helperText={
                    errors.xinyinText ? errors.xinyinText.message : ""
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
                  <Button type="submit">生成</Button>
                </>
              )}
            </DialogActions>
            {type == "generate" && step == Step.InputXinyinText && (
              <>
                <Typography color="text.secondary" variant="body2">
                  <p style={{ margin: 0 }}>生成的心印助记字：</p>
                  <p style={{ margin: 0 }}>
                    用于表示加密密钥的32个汉字，每个汉字唯一对应加密密钥中的一个字节
                  </p>
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
