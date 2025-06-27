# .github/workeflows/static.yml will call this script
TARGET_DIR='./dist/demo'

mkdir -p "$TARGET_DIR"

cp './demo.html' "$TARGET_DIR/index.html"
cp './demo.css' "$TARGET_DIR/demo.css"
cp './demo.js' "$TARGET_DIR/demo.js"
cp './xinyin_main.js' "$TARGET_DIR/xinyin_main.js"
cp './xinyin_types.js' "$TARGET_DIR/xinyin_types.js"
cp './xinyin_worker.js' "$TARGET_DIR/xinyin_worker.js"
cp './xinyin_wasm.js' "$TARGET_DIR/xinyin_wasm.js"
cp './xinyin_wasm_bg.wasm' "$TARGET_DIR/xinyin_wasm_bg.wasm"