const db = require('../db');

function findById(id) {
  return db.prepare('SELECT * FROM books WHERE id = ?').get(id);
}

function list({ category, keyword, sort = 'newest', page = 1, pageSize = 12, includeOff = false }) {
  const where = [];
  const params = [];
  if (!includeOff) {
    where.push('status = ?');
    params.push('on');
  }
  if (category) {
    where.push('category = ?');
    params.push(category);
  }
  if (keyword) {
    where.push('(title LIKE ? OR author LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const orderMap = {
    newest: 'id DESC',
    price_asc: 'price ASC',
    price_desc: 'price DESC',
    hot: 'sale_stock DESC',
  };
  const order = orderMap[sort] || 'id DESC';
  const offset = (page - 1) * pageSize;

  const rows = db
    .prepare(`SELECT * FROM books ${whereSql} ORDER BY ${order} LIMIT ? OFFSET ?`)
    .all(...params, pageSize, offset);
  const { c: total } = db
    .prepare(`SELECT COUNT(*) AS c FROM books ${whereSql}`)
    .get(...params);

  return { rows, total };
}

function categories() {
  return db
    .prepare("SELECT category, COUNT(*) AS count FROM books WHERE status = 'on' GROUP BY category ORDER BY count DESC")
    .all();
}

function create(data) {
  const info = db
    .prepare(
      `INSERT INTO books (title, author, category, cover, description, isbn, publisher, published_at, price, borrow_stock, sale_stock)
       VALUES (@title, @author, @category, @cover, @description, @isbn, @publisher, @published_at, @price, @borrow_stock, @sale_stock)`
    )
    .run({
      title: data.title,
      author: data.author,
      category: data.category,
      cover: data.cover || '',
      description: data.description || '',
      isbn: data.isbn || '',
      publisher: data.publisher || '',
      published_at: data.published_at || '',
      price: data.price,
      borrow_stock: data.borrow_stock,
      sale_stock: data.sale_stock,
    });
  return findById(info.lastInsertRowid);
}

function update(id, data) {
  db.prepare(
    `UPDATE books SET title=@title, author=@author, category=@category, cover=@cover, description=@description,
     isbn=@isbn, publisher=@publisher, published_at=@published_at, price=@price,
     borrow_stock=@borrow_stock, sale_stock=@sale_stock WHERE id=@id`
  ).run({ ...data, id });
  return findById(id);
}

function setStatus(id, status) {
  db.prepare('UPDATE books SET status = ? WHERE id = ?').run(status, id);
  return findById(id);
}

function remove(id) {
  return db.prepare('DELETE FROM books WHERE id = ?').run(id).changes > 0;
}

// 库存扣减（返回是否成功），需在事务内调用
function decreaseBorrowStock(id) {
  return db
    .prepare('UPDATE books SET borrow_stock = borrow_stock - 1 WHERE id = ? AND borrow_stock > 0')
    .run(id).changes > 0;
}

function increaseBorrowStock(id) {
  db.prepare('UPDATE books SET borrow_stock = borrow_stock + 1 WHERE id = ?').run(id);
}

function decreaseSaleStock(id, qty) {
  return db
    .prepare('UPDATE books SET sale_stock = sale_stock - ? WHERE id = ? AND sale_stock >= ?')
    .run(qty, id, qty).changes > 0;
}

function increaseSaleStock(id, qty) {
  db.prepare('UPDATE books SET sale_stock = sale_stock + ? WHERE id = ?').run(qty, id);
}

module.exports = {
  findById,
  list,
  categories,
  create,
  update,
  setStatus,
  remove,
  decreaseBorrowStock,
  increaseBorrowStock,
  decreaseSaleStock,
  increaseSaleStock,
};
