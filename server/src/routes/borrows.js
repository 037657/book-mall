const express = require('express');
const { z } = require('zod');
const { ok } = require('../utils/response');
const { validate } = require('../utils/validate');
const { auth } = require('../middleware/auth');
const { logOperation } = require('../middleware/logger');
const borrowModel = require('../models/borrow');
const borrowService = require('../services/borrowService');

const router = express.Router();
router.use(auth);

// 我的借阅
router.get('/my', (req, res) => {
  borrowModel.markOverdue(new Date().toISOString());
  ok(res, borrowModel.findByUser(req.user.id));
});

// 借书
router.post('/:bookId', (req, res) => {
  const bookId = parseInt(req.params.bookId, 10);
  const result = borrowService.borrowBook(req.user.id, bookId);
  logOperation(req.user.id, 'borrow', `借阅图书 #${bookId}: ${result.book}`);
  ok(res, result, '借阅成功');
});

// 续借
router.post('/:id/renew', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const result = borrowService.renew(req.user.id, id);
  logOperation(req.user.id, 'renew', `续借记录 #${id}`);
  ok(res, result, '续借成功');
});

// 归还
router.post('/:id/return', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const result = borrowService.returnBook(req.user.id, id);
  logOperation(req.user.id, 'return', `归还记录 #${id}, 罚款 ${result.fine} 元`);
  ok(res, result, result.fine > 0 ? `归还成功，逾期罚款 ¥${result.fine}` : '归还成功');
});

module.exports = router;
