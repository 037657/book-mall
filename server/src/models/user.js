const db = require('../db');

function findByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

function findById(id) {
  return db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(id);
}

function create({ email, password, name }) {
  const info = db
    .prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)')
    .run(email, password, name, 'user');
  return findById(info.lastInsertRowid);
}

function list() {
  return db
    .prepare('SELECT id, email, name, role, created_at FROM users ORDER BY id DESC')
    .all();
}

module.exports = { findByEmail, findById, create, list };
