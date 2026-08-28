const express = require('express');
const { z } = require('zod');
const db = require('../db');
const config = require('../config');
const HttpError = require('../utils/httpError');
const { ok } = require('../utils/response');
const { validate } = require('../utils/validate');
const { auth, adminOnly } = require('../middleware/auth');
const { logOperation } = require('../middleware/logger');
const bookModel = require('../models/book');
const borrowModel = require('../models/borrow');
const orderModel = require('../models/order');
const userModel = require('../models/user');

const router = express.Router();
router.use(auth, adminOnly);

const bookSchema = z.object({
  title: z.string().min(1, '书名不能为空'),
  author: z.string().min(1, '作者不能为空'),
  category: z.string().min(1, '分类不能为空'),
  price: z.number().min(0),
  borrow_stock: z.number().int().min(0),
  sale_stock: z.number().int().min(0),
  cover: z.string().optional(),
  description: z.string().optional(),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  published_at: z.string().optional(),
});

// 数据看板
router.get('/stats', (req, res) => {
  borrowModel.markOverdue(new Date().toISOString());
  const bookCount = db.prepare('SELECT COUNT(*) AS c FROM books').get().c;
  const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  const activeBorrows = db
    .prepare("SELECT COUNT(*) AS c FROM borrow_records WHERE status IN ('borrowed','overdue')")
    .get().c;
  const overdueCount = db.prepare("SELECT COUNT(*) AS c FROM borrow_records WHERE status='overdue'").get().c;
  const totalBorrows = db.prepare('SELECT COUNT(*) AS c FROM borrow_records').get().c;
  const orderCount = db.prepare('SELECT COUNT(*) AS c FROM orders').get().c;
  const pendingOrders = db.prepare("SELECT COUNT(*) AS c FROM orders WHERE status='pending'").get().c;
  const revenue = db
    .prepare("SELECT COALESCE(SUM(total_amount),0) AS s FROM orders WHERE status IN ('paid','shipped','completed')")
    .get().s;
  const totalSales = db.prepare('SELECT COALESCE(SUM(quantity),0) AS s FROM order_items').get().s;

  ok(res, {
    bookCount,
    userCount,
    activeBorrows,
    overdueCount,
    totalBorrows,
    orderCount,
    pendingOrders,
    revenue: Math.round(revenue * 100) / 100,
    totalSales,
  });
});

// 图书管理
router.get('/books', (req, res) => {
  const { category, keyword, page, pageSize } = req.query;
  const result = bookModel.list({
    category: category || '',
    keyword: keyword || '',
    sort: 'newest',
    page: Math.max(1, parseInt(page, 10) || 1),
    pageSize: Math.min(50, Math.max(1, parseInt(pageSize, 10) || 20)),
    includeOff: true,
  });
  ok(res, result);
});

router.post('/books', (req, res) => {
  const data = validate(bookSchema, req.body);
  const book = bookModel.create(data);
  logOperation(req.user.id, 'admin', `上架图书《${book.title}》`);
  ok(res, book, '创建成功');
});

router.put('/books/:id', (req, res) => {
  const data = validate(bookSchema, req.body);
  const id = parseInt(req.params.id, 10);
  const book = bookModel.update(id, data);
  logOperation(req.user.id, 'admin', `编辑图书《${book.title}》`);
  ok(res, book, '更新成功');
});

// 上架/下架
router.patch('/books/:id/status', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  if (!['on', 'off'].includes(status)) throw new HttpError('状态不合法', 400);
  const book = bookModel.setStatus(id, status);
  logOperation(req.user.id, 'admin', `${status === 'on' ? '上架' : '下架'}图书《${book.title}》`);
  ok(res, book, '操作成功');
});

router.delete('/books/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  bookModel.remove(id);
  logOperation(req.user.id, 'admin', `删除图书 #${id}`);
  ok(res, null, '删除成功');
});

// 借阅管理
router.get('/borrows', (req, res) => {
  borrowModel.markOverdue(new Date().toISOString());
  ok(res, borrowModel.listAll({ status: req.query.status || '', keyword: req.query.keyword || '' }));
});

// 管理员办理归还
router.post('/borrows/:id/return', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const result = db.transaction(() => {
    const r = borrowModel.findById(id);
    if (!r) throw new HttpError('借阅记录不存在', 404);
    if (r.status === 'returned') throw new HttpError('该记录已归还', 400);
    const now = new Date();
    const due = new Date(r.due_date);
    let fine = 0;
    if (now > due) {
      const days = Math.ceil((now.getTime() - due.getTime()) / (24 * 60 * 60 * 1000));
      fine = Math.round(days * config.rules.finePerDay * 100) / 100;
    }
    borrowModel.markReturned(id, now.toISOString(), fine);
    bookModel.increaseBorrowStock(r.book_id);
    return { fine };
  })();
  logOperation(req.user.id, 'admin', `办理归还记录 #${id}`);
  ok(res, result, '已办理归还');
});

// 订单管理
router.get('/orders', (req, res) => {
  ok(res, orderModel.listAll({ status: req.query.status || '' }));
});

router.post('/orders/:orderNo/ship', (req, res) => {
  const o = orderModel.findByNo(req.params.orderNo);
  if (!o) throw new HttpError('订单不存在', 404);
  if (o.status !== 'paid') throw new HttpError('仅已支付订单可发货', 400);
  orderModel.updateStatus(o.id, 'shipped', { shipped_at: new Date().toISOString() });
  logOperation(req.user.id, 'admin', `订单发货 ${o.order_no}`);
  ok(res, { order_no: o.order_no, status: 'shipped' }, '已发货');
});

router.post('/orders/:orderNo/complete', (req, res) => {
  const o = orderModel.findByNo(req.params.orderNo);
  if (!o) throw new HttpError('订单不存在', 404);
  if (o.status !== 'shipped') throw new HttpError('仅已发货订单可完成', 400);
  orderModel.updateStatus(o.id, 'completed', { completed_at: new Date().toISOString() });
  logOperation(req.user.id, 'admin', `订单完成 ${o.order_no}`);
  ok(res, { order_no: o.order_no, status: 'completed' }, '订单已完成');
});

// 操作日志
router.get('/logs', (req, res) => {
  const rows = db
    .prepare('SELECT l.*, u.email FROM logs l LEFT JOIN users u ON u.id = l.user_id ORDER BY l.id DESC LIMIT 200')
    .all();
  ok(res, rows);
});

// 用户列表
router.get('/users', (req, res) => {
  ok(res, userModel.list());
});

module.exports = router;
