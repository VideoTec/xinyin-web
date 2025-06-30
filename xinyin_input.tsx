import { useState } from "react";
import { Box, Stack, TextField, Button, Typography } from "@mui/material";
import { generateWords32 } from "./xinyin_main";

export default function XinYinInput() {
  const [start, setStart] = useState("");
  const [count, setCount] = useState("");
  const [heart, setHeart] = useState("");
  const [mnemonic, setMnemonic] = useState("");

  const handleGenerate = async () => {
    const parsedStart = parseInt(start, 10);
    const parsedCount = parseInt(count, 10);
    if (
      isNaN(parsedStart) ||
      isNaN(parsedCount) ||
      parsedStart < 0 ||
      parsedCount <= 0
    ) {
      setMnemonic("请填写有效的起始位置和数量");
      return;
    }

    const parsedHeart = await generateWords32(heart, parsedStart, parsedCount);
    setMnemonic(`心印助记字: ${parsedHeart}`);
  };

  return (
    <Box
      sx={{ p: 3, border: "1px solid #ddd", borderRadius: 2, maxWidth: 420 }}
    >
      <Stack spacing={2}>
        <TextField
          label="start"
          type="number"
          size="small"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <TextField
          label="count"
          type="number"
          size="small"
          value={count}
          onChange={(e) => setCount(e.target.value)}
        />
        <TextField
          label="心印（支持 Unicode 码，如 4e00、U+4E8C、三）"
          size="small"
          value={heart}
          onChange={(e) => setHeart(e.target.value)}
          helperText="多个码可用空格分隔，如 4e00 U+4E8C 三"
        />
        <Button variant="contained" onClick={handleGenerate}>
          生成心印助记字
        </Button>
        {mnemonic && (
          <Typography color="primary" sx={{ mt: 1 }}>
            {mnemonic}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
