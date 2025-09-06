# .github/workeflows/static.yml will call this script
TARGET_DIR='./dist/demo'
XINYIN_DIR='./dist/xinyin'

mkdir -p "$TARGET_DIR"
mkdir -p "$XINYIN_DIR"

cp './src/demo/index.html' "$TARGET_DIR/index.html"
cp './src/demo/demo.css' "$TARGET_DIR/demo.css"
cp './src/demo/demo.js' "$TARGET_DIR/demo.js"
cp './src/xinyin/xinyin-main.js' "$XINYIN_DIR/xinyin-main.js"
cp './src/xinyin/xinyin-types.js' "$XINYIN_DIR/xinyin-types.js"
cp './src/xinyin/xinyin-opfs.js' "$XINYIN_DIR/xinyin-opfs.js"
cp './src/xinyin/xinyin-worker.js' "$XINYIN_DIR/xinyin-worker.js"
cp './src/xinyin/xinyin-wasm.js' "$XINYIN_DIR/xinyin-wasm.js"
