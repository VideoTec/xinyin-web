# .github/workeflows/static.yml will call this script
TARGET_DIR='./dist/demo'
XINYIN_DIR='./dist/xinyin'

mkdir -p "$TARGET_DIR"
mkdir -p "$XINYIN_DIR"

cp './src/demo/index.html' "$TARGET_DIR/index.html"
cp './src/demo/demo.css' "$TARGET_DIR/demo.css"
cp './src/demo/demo.js' "$TARGET_DIR/demo.js"
cp './src/xinyin/xinyinMain.js' "$XINYIN_DIR/xinyinMain.js"
cp './src/xinyin/xinyinTypes.js' "$XINYIN_DIR/xinyinTypes.js"
cp './src/xinyin/xinyinOPFS.js' "$XINYIN_DIR/xinyinOPFS.js"
cp './src/xinyin/xinyinWorker.js' "$XINYIN_DIR/xinyinWorker.js"
cp './src/xinyin/xinyinWasm.js' "$XINYIN_DIR/xinyinWasm.js"
# cp './src/xinyin/xinyinWasm.wasm' "$XINYIN_DIR/xinyinWasm.wasm"

# 替换 xinyinWorker.js 中的 WASM 路径
sed -i '' 's|xinyin_wasm("./xinyinWasm.wasm")|xinyin_wasm(new URL("../assets/xinyinWasm.wasm", self.location.href))|g' "$XINYIN_DIR/xinyinWorker.js"

