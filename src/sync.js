import { WeReadService } from './services/WeReadService.js';
import { FeishuService } from './services/FeishuService.js';
import { transformBookToFeishuRecord, validateBookData } from './utils/transformers.js';
import { config, validateEnvironment } from '../config/env.js';

export class WeReadToFeishuSync {
  constructor() {
    this.config = config;
    this.stats = {
      totalBooks: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      startTime: null,
      endTime: null
    };
  }

  async run() {
    this.stats.startTime = new Date();
    console.log('🚀 开始微信读书到飞书同步流程');
    console.log(`⏰ 开始时间: ${this.stats.startTime.toISOString()}`);

    try {
      // 验证环境配置
      validateEnvironment();

      // 1. 初始化服务
      const wereadService = new WeReadService(this.config.weread.cookie);
      const feishuService = new FeishuService(
        this.config.feishu.appId,
        this.config.feishu.appSecret,
        this.config.feishu.appToken,
        this.config.feishu.tableId
      );

      // 2. 验证Cookie有效性
      console.log('🔐 验证微信读书Cookie...');
      const isCookieValid = await wereadService.validateCookie();
      if (!isCookieValid) {
        throw new Error('微信读书Cookie无效或已过期，请更新WEREAD_COOKIE环境变量');
      }
      console.log('✅ 微信读书Cookie验证通过');

      // 3. 验证飞书连接
      console.log('🔗 验证飞书连接...');
      const isFeishuConnected = await feishuService.checkConnection();
      if (!isFeishuConnected) {
        throw new Error('飞书连接失败，请检查配置信息');
      }
      console.log('✅ 飞书连接验证通过');

      // 4. 获取微信读书数据
      const books = await wereadService.getBookshelf();
      this.stats.totalBooks = books.length;

      if (books.length === 0) {
        console.log('📭 未找到可同步的书籍');
        return this._finalizeStats(true);
      }

      // 5. 转换和过滤数据
      console.log('🔄 转换数据格式...');
      const validRecords = [];
      
      for (const book of books) {
        if (validateBookData(book)) {
          const record = transformBookToFeishuRecord(book);
          validRecords.push(record);
          this.stats.processed++;
        } else {
          this.stats.failed++;
        }
      }

      // 6. 同步到飞书
      console.log(`📤 开始同步 ${validRecords.length} 条记录到飞书...`);
      const result = await feishuService.batchCreateRecords(validRecords);
      this.stats.successful = result.success;

      return this._finalizeStats(result.success > 0);

    } catch (error) {
      console.error('💥 同步流程失败:', error.message);
      return this._finalizeStats(false, error.message);
    }
  }

  _finalizeStats(success, errorMessage = null) {
    this.stats.endTime = new Date();
    const duration = this.stats.endTime - this.stats.startTime;

    console.log('\n📊 同步统计信息:');
    console.log(`   总书籍数: ${this.stats.totalBooks}`);
    console.log(`   处理数: ${this.stats.processed}`);
    console.log(`   成功数: ${this.stats.successful}`);
    console.log(`   失败数: ${this.stats.failed}`);
    console.log(`   耗时: ${duration}ms`);
    console.log(`   结果: ${success ? '✅ 成功' : '❌ 失败'}`);

    if (errorMessage) {
      console.log(`   错误信息: ${errorMessage}`);
    }

    return {
      success,
      stats: this.stats,
      error: errorMessage
    };
  }
}
