// src/test.js
import { config, validateEnvironment } from '../config/env.js';

console.log('🧪 开始环境测试...');

try {
  validateEnvironment();
  console.log('✅ 环境变量配置正确');
  
  // 测试配置加载
  console.log('📋 配置信息:');
  console.log('- 飞书App ID:', config.feishu.appId ? '已配置' : '未配置');
  console.log('- 微信读书Cookie:', config.weread.cookie ? '已配置' : '未配置');
  
  console.log('🎉 测试通过！环境配置正常。');
  process.exit(0);
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  process.exit(1);
}
