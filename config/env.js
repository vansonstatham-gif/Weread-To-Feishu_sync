// config/env.js
import dotenv from 'dotenv';
dotenv.config();

// 配置对象
export const config = {
  weread: {
    cookie: process.env.WEREAD_COOKIE || ''
  },
  feishu: {
    appId: process.env.FEISHU_APP_ID || '',
    appSecret: process.env.FEISHU_APP_SECRET || '',
    appToken: process.env.FEISHU_APP_TOKEN || '',
    tableId: process.env.FEISHU_TABLE_ID || ''
  }
};

// 环境验证函数
export function validateEnvironment() {
  const required = [
    'WEREAD_COOKIE',
    'FEISHU_APP_ID',
    'FEISHU_APP_SECRET', 
    'FEISHU_APP_TOKEN',
    'FEISHU_TABLE_ID'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`缺少环境变量: ${missing.join(', ')}`);
  }
  
  console.log('✅ 环境配置验证通过');
}
