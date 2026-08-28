const express = require('express');
const { z } = require('zod');
const { ok } = require('../utils/response');
const { validate } = require('../utils/validate');
const { auth } = require('../middleware/auth');
const cartModel = require('../models/cart');

const router = express.Router();
router.use(auth);

const addSchema = z.object({
  bookId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99).optional(),
});

const updateSchema = z.object({
  quantity: z.number().int().min(0).max(99),
});

// 查看购物车
router.get('/', (req, res) => {
  ok(res, cartModel.listByUser(req.user.id));
});

// 加入购物车
router.post('/', (req, res) => {
  const data = validate(addSchema, req.body);
  cartModel.add(req.user.id, data.bookId, data.quantity || 1);
  ok(res, null, '已加入购物车');
});

// 修改数量
router.put('/:bookId', (req, res) => {
  const data = validate(updateSchema, req.body);
  const bookId = parseInt(req.params.bookId, 10);
  cartModel.updateQty(req.user.id, bookId, data.quantity);
  ok(res, null, '已更新');
});

// 移除
router.delete('/:bookId', (req, res) => {
  const bookId = parseInt(req.params.bookId, 10);
  cartModel.remove(req.user.id, bookId);
  ok(res, null, '已移除');
});

// 清空
router.delete('/', (req, res) => {
  cartModel.clear(req.user.id);
  ok(res, null, '已清空');
});

module.exports = router;
