# .github/workeflows/static.yml will call this script
TARGET_DIR='./dist/demo'
XINYIN_DIR='./dist/xinyin'

mkdir -p "$TARGET_DIR"
mkdir -p "$XINYIN_DIR"

cp './src/demo/index.html' "$TARGET_DIR/index.html"
cp './src/demo/demo.css' "$TARGET_DIR/demo.css"
cp './src/demo/demo.js' "$TARGET_DIR/demo.js"
cp './src/xinyin/xinyin_main.js' "$XINYIN_DIR/xinyin_main.js"
cp './src/xinyin/xinyin_types.js' "$XINYIN_DIR/xinyin_types.js"
cp './src/xinyin/xinyin_opfs.js' "$XINYIN_DIR/xinyin_opfs.js"
cp './src/xinyin/xinyin_worker.js' "$XINYIN_DIR/xinyin_worker.js"
cp './src/xinyin/xinyin_wasm.js' "$XINYIN_DIR/xinyin_wasm.js"
cp './src/xinyin/xinyin_wasm_bg.wasm' "$XINYIN_DIR/xinyin_wasm_bg.wasm"