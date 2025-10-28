export function transformBookToFeishuRecord(book) {
  const bookInfo = book.book || {};
  
  // 基础字段映射
  const fields = {
    '书名': bookInfo.title || '未知书名',
    '作者': bookInfo.author || '未知作者',
    '阅读进度': bookInfo.readingProgress || 0,
    '阅读状态': bookInfo.markedStatus === 4 ? '已读完' : '阅读中',
    '最后同步时间': new Date().toISOString(),
    '封面链接': bookInfo.cover || ''
  };

  // 处理分类信息
  const categories = bookInfo.categories;
  if (categories && Array.isArray(categories)) {
    fields['分类'] = categories.map(cat => cat.title).join(', ');
  }

  // 处理阅读时间
  const finishTime = bookInfo.finishReadingTime;
  if (finishTime) {
    try {
      const finishDate = new Date(finishTime * 1000);
      fields['完成时间'] = finishDate.toISOString().split('T')[0];
    } catch (error) {
      // 忽略日期转换错误
    }
  }

  // 处理开始阅读时间
  const startTime = bookInfo.beginReadingTime;
  if (startTime) {
    try {
      const startDate = new Date(startTime * 1000);
      fields['开始时间'] = startDate.toISOString().split('T')[0];
    } catch (error) {
      // 忽略日期转换错误
    }
  }

  console.log(`📖 处理书籍: 《${fields['书名']}》`);
  return { fields };
}

export function validateBookData(book) {
  const bookInfo = book.book || {};
  
  if (!bookInfo.title) {
    console.warn('⚠️ 书籍数据缺少标题，跳过处理');
    return false;
  }
  
  return true;
}
