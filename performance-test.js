// 性能测试脚本
// 用于测试钱包操作和Web Worker性能优化

// 模拟大量钱包操作
async function testWalletOperations() {
  console.log("开始钱包操作性能测试...");

  const startTime = performance.now();

  // 模拟添加多个钱包
  for (let i = 0; i < 100; i++) {
    const wallet = {
      address: `test_address_${i}`,
      name: `测试钱包_${i}`,
    };

    // 模拟localStorage操作
    localStorage.setItem(wallet.address, wallet.name);
  }

  const endTime = performance.now();
  console.log(`同步localStorage操作耗时: ${endTime - startTime}ms`);

  // 清理测试数据
  for (let i = 0; i < 100; i++) {
    localStorage.removeItem(`test_address_${i}`);
  }
}

// 模拟异步钱包操作
async function testAsyncWalletOperations() {
  console.log("开始异步钱包操作性能测试...");

  const startTime = performance.now();

  // 异步localStorage操作
  function setItemAsync(key, value) {
    return new Promise((resolve) => {
      const callback = () => {
        localStorage.setItem(key, value);
        resolve();
      };

      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(callback);
      } else {
        setTimeout(callback, 0);
      }
    });
  }

  // 批量异步操作
  const promises = [];
  for (let i = 0; i < 100; i++) {
    const wallet = {
      address: `async_test_address_${i}`,
      name: `异步测试钱包_${i}`,
    };

    promises.push(setItemAsync(wallet.address, wallet.name));
  }

  await Promise.all(promises);

  const endTime = performance.now();
  console.log(`异步localStorage操作耗时: ${endTime - startTime}ms`);

  // 清理测试数据
  for (let i = 0; i < 100; i++) {
    localStorage.removeItem(`async_test_address_${i}`);
  }
}

// 测试主线程阻塞
function testMainThreadBlocking() {
  console.log("测试主线程阻塞...");

  const startTime = performance.now();

  // 模拟阻塞操作
  while (performance.now() - startTime < 100) {
    // 空循环模拟阻塞
  }

  console.log("主线程阻塞100ms完成");
}

// 测试非阻塞操作
async function testNonBlockingOperation() {
  console.log("测试非阻塞操作...");

  const startTime = performance.now();

  // 使用Promise和setTimeout避免阻塞
  await new Promise((resolve) => {
    const work = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed < 100) {
        setTimeout(work, 0);
      } else {
        resolve();
      }
    };
    work();
  });

  console.log("非阻塞操作100ms完成");
}

// 运行所有测试
async function runAllTests() {
  console.log("=== 性能优化测试开始 ===");

  await testWalletOperations();
  await testAsyncWalletOperations();

  console.log("--- 主线程阻塞测试 ---");
  testMainThreadBlocking();

  console.log("--- 非阻塞操作测试 ---");
  await testNonBlockingOperation();

  console.log("=== 性能优化测试完成 ===");
}

// 在浏览器控制台中运行: runAllTests()
if (typeof window !== "undefined") {
  // @ts-expect-error - Adding function to window for testing purposes
  window.runPerformanceTests = runAllTests;
}
