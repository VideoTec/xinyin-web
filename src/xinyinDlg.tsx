import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import { useState, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { generateWords32 } from "./xinyin/xinyinMain";

const initialWordCount = 500; // 假设初始字数为500
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
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(Step.ChooseCharset);
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

  function handleOpen() {
    setOpen(true);
    setStep(Step.ChooseCharset);
    reset({
      startIndex: initialStartIndex,
      wordCount: initialWordCount,
      xinyinText: "",
    });
  }

  function handleFormSubmit(data: XinyinTxt) {
    if (type == "generate" && step == Step.InputXinyinText) {
      console.log(data);
      generateWords32(data.xinyinText, data.startIndex, data.wordCount).then(
        (w32) => {
          console.log("生成的助记字是: ", w32);
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
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>输入心印信息</DialogTitle>
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
              <TextField
                label="心印文本"
                fullWidth
                autoComplete="off"
                {...register("xinyinText", { validate: validateXinyinText })}
                error={!!errors.xinyinText}
                helperText={errors.xinyinText ? errors.xinyinText.message : ""}
              />
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
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
