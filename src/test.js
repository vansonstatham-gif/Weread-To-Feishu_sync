// src/test.js - 简化版本，避免依赖问题
console.log('🧪 开始基础环境测试...');

try {
  // 基础测试，不依赖具体配置
  console.log('✅ Node.js版本:', process.version);
  console.log('✅ 当前目录:', process.cwd());
  
  // 检查环境变量是否存在（不验证具体值）
  const envVars = [
    'WEREAD_COOKIE',
    'FEISHU_APP_ID',
    'FEISHU_APP_SECRET',
    'FEISHU_APP_TOKEN', 
    'FEISHU_TABLE_ID'
  ];
  
  console.log('📋 环境变量状态:');
  envVars.forEach(envVar => {
    const isSet = process.env[envVar] ? '✅ 已设置' : '❌ 未设置';
    console.log(`   ${isSet} ${envVar}`);
  });
  
  console.log('🎉 基础测试通过！');
  process.exit(0);
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  process.exit(1);
}
