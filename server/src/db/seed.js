const db = require('./index');
const bcrypt = require('bcryptjs');

const books = [
  { title: '活着', author: '余华', category: '文学小说', price: 45, borrow_stock: 3, sale_stock: 20, publisher: '作家出版社', published_at: '2012', description: '福贵的一生，讲述了一个人在时代洪流中如何承受苦难、依然坚韧地活着。' },
  { title: '百年孤独', author: '加西亚·马尔克斯', category: '文学小说', price: 55, borrow_stock: 2, sale_stock: 15, publisher: '南海出版公司', published_at: '2011', description: '魔幻现实主义代表作，布恩迪亚家族七代人的传奇故事。' },
  { title: '三体', author: '刘慈欣', category: '科幻', price: 68, borrow_stock: 4, sale_stock: 30, publisher: '重庆出版社', published_at: '2008', description: '地球文明与三体文明的信息交流、生死搏杀及两个文明在宇宙中的兴衰历程。' },
  { title: '红楼梦', author: '曹雪芹', category: '文学小说', price: 59, borrow_stock: 2, sale_stock: 18, publisher: '人民文学出版社', published_at: '1996', description: '中国古典四大名著之首，贾史王薛四大家族的兴衰与宝黛爱情悲剧。' },
  { title: '明朝那些事儿', author: '当年明月', category: '历史', price: 38, borrow_stock: 5, sale_stock: 40, publisher: '浙江人民出版社', published_at: '2011', description: '用轻松幽默的笔调讲述明朝三百年历史。' },
  { title: '人类简史', author: '尤瓦尔·赫拉利', category: '历史', price: 68, borrow_stock: 3, sale_stock: 25, publisher: '中信出版社', published_at: '2014', description: '从认知革命到科学革命，重新审视人类这个物种的演化历程。' },
  { title: '原则', author: '瑞·达利欧', category: '经济管理', price: 98, borrow_stock: 2, sale_stock: 12, publisher: '中信出版社', published_at: '2018', description: '桥水基金创始人的生活与工作原则。' },
  { title: '富爸爸穷爸爸', author: '罗伯特·清崎', category: '经济管理', price: 45, borrow_stock: 4, sale_stock: 35, publisher: '四川人民出版社', published_at: '2017', description: '关于财商启蒙与资产配置的经典之作。' },
  { title: '思考，快与慢', author: '丹尼尔·卡尼曼', category: '心理', price: 69, borrow_stock: 3, sale_stock: 20, publisher: '中信出版社', published_at: '2012', description: '诺贝尔经济学奖得主揭示人类决策背后的两大思维系统。' },
  { title: '被讨厌的勇气', author: '岸见一郎', category: '心理', price: 42, borrow_stock: 5, sale_stock: 45, publisher: '机械工业出版社', published_at: '2015', description: '阿德勒心理学的通俗入门，教你获得真正的自由。' },
  { title: '时间简史', author: '史蒂芬·霍金', category: '科技', price: 45, borrow_stock: 3, sale_stock: 22, publisher: '湖南科学技术出版社', published_at: '2010', description: '从大爆炸到黑洞，探索宇宙起源与时间的本质。' },
  { title: '深度学习', author: '伊恩·古德费洛', category: '科技', price: 168, borrow_stock: 1, sale_stock: 8, publisher: '人民邮电出版社', published_at: '2017', description: 'AI 领域经典教材，系统讲解深度学习理论与实践。' },
  { title: '乌合之众', author: '古斯塔夫·勒庞', category: '社会', price: 35, borrow_stock: 4, sale_stock: 30, publisher: '中央编译出版社', published_at: '2014', description: '群体心理学的开山之作，剖析大众心理的盲从与冲动。' },
  { title: '乡土中国', author: '费孝通', category: '社会', price: 28, borrow_stock: 5, sale_stock: 50, publisher: '人民出版社', published_at: '2015', description: '研究中国乡土社会结构与人际关系的经典社会学著作。' },
  { title: '平凡的世界', author: '路遥', category: '文学小说', price: 79, borrow_stock: 3, sale_stock: 20, publisher: '北京十月文艺出版社', published_at: '2017', description: '全景式展现中国当代城乡社会生活的长篇小说。' },
  { title: '围城', author: '钱钟书', category: '文学小说', price: 39, borrow_stock: 4, sale_stock: 28, publisher: '人民文学出版社', published_at: '1991', description: '婚姻与人生的讽刺寓言，中国现代文学经典。' },
  { title: '小王子', author: '圣埃克苏佩里', category: '文学小说', price: 32, borrow_stock: 5, sale_stock: 60, publisher: '人民文学出版社', published_at: '2003', description: '写给大人的童话，关于爱与责任的永恒寓言。' },
  { title: '苏菲的世界', author: '乔斯坦·贾德', category: '哲学', price: 42, borrow_stock: 3, sale_stock: 25, publisher: '作家出版社', published_at: '2007', description: '一部风靡世界的哲学启蒙书，跟随苏菲探索哲学史。' },
  { title: '艺术的故事', author: '贡布里希', category: '艺术', price: 128, borrow_stock: 1, sale_stock: 6, publisher: '广西美术出版社', published_at: '2008', description: '被誉为西方艺术史圣经的经典入门读物。' },
  { title: '经济学原理', author: '曼昆', category: '经济管理', price: 79, borrow_stock: 2, sale_stock: 15, publisher: '北京大学出版社', published_at: '2015', description: '全球最流行的经济学入门教材，通俗易懂。' },
];

function seed() {
  const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (userCount === 0) {
    const insertUser = db.prepare(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)'
    );
    const adminPwd = bcrypt.hashSync('admin123', 10);
    const userPwd = bcrypt.hashSync('user123', 10);
    insertUser.run('admin@test.com', adminPwd, '管理员', 'admin');
    insertUser.run('user@test.com', userPwd, '演示用户', 'user');
    console.log('[seed] 已创建管理员账号 admin@test.com / admin123 与演示用户 user@test.com / user123');
  }

  const bookCount = db.prepare('SELECT COUNT(*) AS c FROM books').get().c;
  if (bookCount === 0) {
    const insertBook = db.prepare(
      `INSERT INTO books (title, author, category, cover, description, isbn, publisher, published_at, price, borrow_stock, sale_stock)
       VALUES (@title, @author, @category, @cover, @description, @isbn, @publisher, @published_at, @price, @borrow_stock, @sale_stock)`
    );
    const insertAll = db.transaction((rows) => {
      for (const b of rows) {
        insertBook.run({ ...b, cover: b.cover || '', isbn: b.isbn || '' });
      }
    });
    insertAll(books);
    console.log(`[seed] 已写入 ${books.length} 本示例图书`);
  }
}

// 作为脚本直接运行
if (require.main === module) {
  seed();
  console.log('[seed] 种子数据初始化完成');
}

module.exports = { seed, books };
