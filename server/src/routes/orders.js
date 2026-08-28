const express = require('express');
const { z } = require('zod');
const { ok } = require('../utils/response');
const { validate } = require('../utils/validate');
const { auth } = require('../middleware/auth');
const { logOperation } = require('../middleware/logger');
const orderModel = require('../models/order');
const orderService = require('../services/orderService');

const router = express.Router();
router.use(auth);

const createSchema = z.object({
  items: z
    .array(z.object({ bookId: z.number().int().positive(), quantity: z.number().int().min(1) }))
    .min(1),
  address: z.string().max(200).optional(),
});

// 下单
router.post('/', (req, res) => {
  const data = validate(createSchema, req.body);
  const result = orderService.createOrder(req.user.id, data);
  logOperation(req.user.id, 'order', `下单 ${result.order_no}, 金额 ${result.total_amount}`);
  ok(res, result, '下单成功');
});

// 我的订单
router.get('/my', (req, res) => {
  ok(res, orderModel.listByUser(req.user.id));
});

// 订单详情
router.get('/:orderNo', (req, res) => {
  const o = orderModel.findByNo(req.params.orderNo);
  if (!o || o.user_id !== req.user.id) return res.status(404).json({ code: 1, message: '订单不存在', data: null });
  ok(res, { ...o, items: orderModel.itemsByOrder(o.id) });
});

// 模拟支付
router.post('/:orderNo/pay', (req, res) => {
  const result = orderService.pay(req.user.id, req.params.orderNo);
  logOperation(req.user.id, 'pay', `支付订单 ${result.order_no}`);
  ok(res, result, '支付成功');
});

// 取消订单
router.post('/:orderNo/cancel', (req, res) => {
  const result = orderService.cancel(req.user.id, req.params.orderNo);
  logOperation(req.user.id, 'cancel', `取消订单 ${result.order_no}`);
  ok(res, result, '订单已取消');
});

module.exports = router;
