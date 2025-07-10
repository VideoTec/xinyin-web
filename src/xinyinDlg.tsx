import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import { useState, useCallback, type ReactElement } from "react";
import { useForm } from "react-hook-form";

const initialWordCount = 500; // 假设初始字数为500
const initialStartIndex = 8; // 假设初始开始序号为8

interface XinyinTxt {
  startIndex: number;
  wordCount: number;
  xinyinText: string;
}

export function XinyinDlg({
  children,
}: {
  children: (props: { onClick: () => void }) => ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<XinyinTxt>({
    defaultValues: {
      startIndex: initialStartIndex,
      wordCount: initialWordCount,
      xinyinText: "",
    },
  });

  const handleOpen = useCallback(() => {
    setOpen(true);
    reset({
      startIndex: initialStartIndex,
      wordCount: initialWordCount,
      xinyinText: "",
    });
  }, [reset]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleFormSubmit = useCallback((data: XinyinTxt) => {
    console.log(data);
    setOpen(false);
  }, []);

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

    if (value < 0) {
      return "开始的序号必须大于等于0";
    }

    if (value > 7500) {
      return "开始的序号不能大于7500";
    }

    return true;
  }

  function validateWordCount(value: number): boolean | string {
    if (isNaN(value)) {
      return "输入的字数必须是数字";
    }

    if (value < 500) {
      return "至少使用500个汉字";
    }
    return true;
  }

  return (
    <>
      {children({ onClick: handleOpen })}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>输入心印信息</DialogTitle>
        <DialogContent>
          <Stack
            component="form"
            spacing={2}
            sx={{ paddingTop: 2 }}
            onSubmit={handleSubmit(handleFormSubmit)}
          >
            <TextField
              label="开始的序号"
              fullWidth
              autoComplete="off"
              {...register("startIndex", {
                valueAsNumber: true,
                validate: validateStartIndex,
              })}
              error={!!errors.startIndex}
              helperText={errors.startIndex ? errors.startIndex.message : ""}
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
            <TextField
              label="心印文本"
              fullWidth
              autoComplete="off"
              {...register("xinyinText", { validate: validateXinyinText })}
              error={!!errors.xinyinText}
              helperText={errors.xinyinText ? errors.xinyinText.message : ""}
            />
            <DialogActions>
              <Button type="submit">提交</Button>
            </DialogActions>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
