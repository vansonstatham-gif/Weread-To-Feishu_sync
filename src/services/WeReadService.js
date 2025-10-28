import axios from 'axios';

export class WeReadService {
  constructor(cookie) {
    this.cookie = cookie;
    this.baseURL = 'https://i.weread.qq.com';
    this.session = axios.create({
      timeout: 10000,
      headers: {
        'Cookie': this.cookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://weread.qq.com/',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }
    });
  }

  async getBookshelf() {
    try {
      console.log('📚 获取微信读书书架数据...');
      
      const response = await this.session.get(`${this.baseURL}/user/notebooks`);
      
      if (response.status === 200) {
        const data = response.data;
        const books = data.books || [];
        
        console.log(`✅ 成功获取 ${books.length} 本书籍`);
        
        // 显示前几本书的信息
        books.slice(0, 3).forEach((book, index) => {
          const bookInfo = book.book || {};
          console.log(`   ${index + 1}. 《${bookInfo.title}》 - ${bookInfo.author}`);
        });
        
        return books;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ 获取微信读书数据失败:', error.message);
      
      // 详细的错误诊断
      if (error.response) {
        console.error('响应状态:', error.response.status);
        console.error('响应数据:', error.response.data);
      }
      
      throw error;
    }
  }

  async getBookDetail(bookId) {
    try {
      const response = await this.session.get(`${this.baseURL}/web/book/info`, {
        params: { bookId }
      });
      
      return response.status === 200 ? response.data : null;
    } catch (error) {
      console.warn(`获取书籍详情失败: ${error.message}`);
      return null;
    }
  }

  // 验证Cookie是否有效
  async validateCookie() {
    try {
      const books = await this.getBookshelf();
      return books.length > 0;
    } catch (error) {
      return false;
    }
  }
}
