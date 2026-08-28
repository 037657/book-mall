const db = require('../db');

function create({ order_no, user_id, total_amount, address }) {
  const info = db
    .prepare('INSERT INTO orders (order_no, user_id, total_amount, address) VALUES (?, ?, ?, ?)')
    .run(order_no, user_id, total_amount, address || '');
  return findById(info.lastInsertRowid);
}

function addItem({ order_id, book_id, title, price, quantity }) {
  db.prepare('INSERT INTO order_items (order_id, book_id, title, price, quantity) VALUES (?, ?, ?, ?, ?)').run(
    order_id,
    book_id,
    title,
    price,
    quantity
  );
}

function findById(id) {
  return db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
}

function findByNo(orderNo) {
  return db.prepare('SELECT * FROM orders WHERE order_no = ?').get(orderNo);
}

function itemsByOrder(orderId) {
  return db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
}

function listByUser(userId) {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC').all(userId);
  return orders.map((o) => ({ ...o, items: itemsByOrder(o.id) }));
}

function listAll({ status = '' } = {}) {
  const where = status ? 'WHERE o.status = ?' : '';
  const params = status ? [status] : [];
  const orders = db
    .prepare(
      `SELECT o.*, u.email, u.name AS user_name FROM orders o JOIN users u ON u.id = o.user_id ${where} ORDER BY o.id DESC`
    )
    .all(...params);
  return orders.map((o) => ({ ...o, items: itemsByOrder(o.id) }));
}

function updateStatus(id, status, timestamps = {}) {
  const fields = ['status = ?'];
  const params = [status];
  const map = {
    paid_at: 'paid_at',
    shipped_at: 'shipped_at',
    completed_at: 'completed_at',
    cancelled_at: 'cancelled_at',
  };
  for (const [key, col] of Object.entries(map)) {
    if (timestamps[key]) {
      fields.push(`${col} = ?`);
      params.push(timestamps[key]);
    }
  }
  params.push(id);
  db.prepare(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`).run(...params);
}

module.exports = { create, addItem, findById, findByNo, itemsByOrder, listByUser, listAll, updateStatus };
