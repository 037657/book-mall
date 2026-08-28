const db = require('../db');

function activeCountByUser(userId) {
  return db
    .prepare("SELECT COUNT(*) AS c FROM borrow_records WHERE user_id = ? AND status IN ('borrowed', 'overdue')")
    .get(userId).c;
}

function findActiveByUserAndBook(userId, bookId) {
  return db
    .prepare("SELECT * FROM borrow_records WHERE user_id = ? AND book_id = ? AND status IN ('borrowed', 'overdue')")
    .get(userId, bookId);
}

function findById(id) {
  return db.prepare('SELECT * FROM borrow_records WHERE id = ?').get(id);
}

function create({ user_id, book_id, borrow_date, due_date }) {
  return db
    .prepare('INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date) VALUES (?, ?, ?, ?)')
    .run(user_id, book_id, borrow_date, due_date).lastInsertRowid;
}

function renew(id, dueDate) {
  db.prepare('UPDATE borrow_records SET renew_count = renew_count + 1, due_date = ? WHERE id = ?').run(dueDate, id);
}

function markReturned(id, returnDate, fine) {
  db.prepare("UPDATE borrow_records SET status = 'returned', return_date = ?, fine = ? WHERE id = ?").run(
    returnDate,
    fine,
    id
  );
}

// 将已到期但未归还的记录标记为 overdue
function markOverdue(nowIso) {
  return db
    .prepare("UPDATE borrow_records SET status = 'overdue' WHERE status = 'borrowed' AND due_date < ?")
    .run(nowIso).changes;
}

function findByUser(userId) {
  return db
    .prepare(
      `SELECT br.*, b.title, b.author, b.category, b.cover
       FROM borrow_records br JOIN books b ON b.id = br.book_id
       WHERE br.user_id = ? ORDER BY br.id DESC`
    )
    .all(userId);
}

function listAll({ status = '', keyword = '' }) {
  const where = [];
  const params = [];
  if (status) {
    where.push('br.status = ?');
    params.push(status);
  }
  if (keyword) {
    where.push('(u.email LIKE ? OR u.name LIKE ? OR b.title LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return db
    .prepare(
      `SELECT br.*, b.title, b.author, u.email, u.name AS user_name
       FROM borrow_records br
       JOIN books b ON b.id = br.book_id
       JOIN users u ON u.id = br.user_id
       ${whereSql} ORDER BY br.id DESC`
    )
    .all(...params);
}

module.exports = {
  activeCountByUser,
  findActiveByUserAndBook,
  findById,
  create,
  renew,
  markReturned,
  markOverdue,
  findByUser,
  listAll,
};
