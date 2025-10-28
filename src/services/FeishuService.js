import axios from 'axios';

export class FeishuService {
  constructor(appId, appSecret, appToken, tableId) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.appToken = appToken;
    this.tableId = tableId;
    this.accessToken = null;
    this.baseURL = 'https://open.feishu.cn/open-apis';
  }

  async getAccessToken() {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      console.log('🔑 获取飞书访问令牌...');
      
      const response = await axios.post(
        `${this.baseURL}/auth/v3/tenant_access_token/internal`,
        {
          app_id: this.appId,
          app_secret: this.appSecret
        },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data;
      
      if (result.code === 0) {
        this.accessToken = result.tenant_access_token;
        console.log('✅ 飞书访问令牌获取成功');
        return this.accessToken;
      } else {
        throw new Error(`飞书API错误: ${result.msg} (code: ${result.code})`);
      }
    } catch (error) {
      console.error('❌ 获取飞书访问令牌失败:', error.message);
      throw error;
    }
  }

  async addRecord(recordData) {
    try {
      await this.getAccessToken();
      
      const url = `${this.baseURL}/bitable/v1/apps/${this.appToken}/tables/${this.tableId}/records`;
      
      const headers = {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      };

      const response = await axios.post(url, recordData, {
        headers,
        timeout: 10000
      });

      const result = response.data;
      
      if (result.code === 0) {
        return { success: true, record: result.data.record };
      } else {
        return { 
          success: false, 
          error: result.msg,
          code: result.code
        };
      }
    } catch (error) {
      console.error('❌ 添加记录失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  async batchCreateRecords(records) {
    if (!records || records.length === 0) {
      console.log('📭 没有记录需要同步');
      return { success: 0, total: 0 };
    }

    await this.getAccessToken();
    
    const url = `${this.baseURL}/bitable/v1/apps/${this.appToken}/tables/${this.tableId}/records/batch_create`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };

    let successCount = 0;
    const batchSize = 10; // 飞书API限制

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      try {
        const data = {
          records: batch.map(record => ({
            fields: record.fields
          }))
        };

        const response = await axios.post(url, data, { 
          headers, 
          timeout: 10000 
        });

        const result = response.data;

        if (result.code === 0) {
          successCount += batch.length;
          console.log(`✅ 批次 ${Math.floor(i / batchSize) + 1} 同步成功: ${batch.length} 条记录`);
        } else {
          console.error(`❌ 批次同步失败: ${result.msg}`);
        }
      } catch (error) {
        console.error(`❌ 批次请求异常: ${error.message}`);
      }

      // 避免速率限制
      if (i + batchSize < records.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`📊 同步统计: 成功 ${successCount}/${records.length} 条记录`);
    return { success: successCount, total: records.length };
  }

  // 检查表格连接是否正常
  async checkConnection() {
    try {
      await this.getAccessToken();
      
      const url = `${this.baseURL}/bitable/v1/apps/${this.appToken}/tables/${this.tableId}/records?page_size=1`;
      const headers = {
        'Authorization': `Bearer ${this.accessToken}`
      };

      const response = await axios.get(url, { headers, timeout: 5000 });
      return response.data.code === 0;
    } catch (error) {
      console.error('❌ 飞书连接检查失败:', error.message);
      return false;
    }
  }
}
