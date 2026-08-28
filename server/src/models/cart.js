const db = require('../db');

function listByUser(userId) {
  return db
    .prepare(
      `SELECT c.id, c.quantity, b.id AS book_id, b.title, b.author, b.category, b.cover, b.price,
              b.sale_stock, b.borrow_stock, b.status
       FROM cart_items c JOIN books b ON b.id = c.book_id
       WHERE c.user_id = ? ORDER BY c.id DESC`
    )
    .all(userId);
}

function getItem(userId, bookId) {
  return db.prepare('SELECT * FROM cart_items WHERE user_id = ? AND book_id = ?').get(userId, bookId);
}

function add(userId, bookId, quantity) {
  const existing = getItem(userId, bookId);
  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, book_id, quantity) VALUES (?, ?, ?)').run(userId, bookId, quantity);
  }
}

function updateQty(userId, bookId, quantity) {
  if (quantity <= 0) {
    db.prepare('DELETE FROM cart_items WHERE user_id = ? AND book_id = ?').run(userId, bookId);
  } else {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND book_id = ?').run(quantity, userId, bookId);
  }
}

function remove(userId, bookId) {
  db.prepare('DELETE FROM cart_items WHERE user_id = ? AND book_id = ?').run(userId, bookId);
}

function clear(userId) {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
}

module.exports = { listByUser, getItem, add, updateQty, remove, clear };
