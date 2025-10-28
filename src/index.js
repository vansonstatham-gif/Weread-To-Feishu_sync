import { WeReadToFeishuSync } from './sync.js';

async function main() {
  try {
    const sync = new WeReadToFeishuSync();
    const result = await sync.run();
    
    if (result.success) {
      console.log('\n🎉 同步成功完成！');
      process.exit(0);
    } else {
      console.log('\n❌ 同步完成但有错误');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 应用程序错误:', error.message);
    process.exit(1);
  }
}

// 如果是直接执行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { WeReadToFeishuSync };
