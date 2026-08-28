const db = require('../db');
const HttpError = require('../utils/httpError');
const bookModel = require('../models/book');
const orderModel = require('../models/order');

function round2(n) {
  return Math.round(n * 100) / 100;
}

function genOrderNo() {
  return 'B' + Date.now() + Math.floor(Math.random() * 1000);
}

// 下单：事务内校验 + 扣减可售库存（防止超卖）
function createOrder(userId, { items, address }) {
  return db.transaction(() => {
    if (!Array.isArray(items) || items.length === 0) throw new HttpError('订单商品不能为空', 400);

    let total = 0;
    const lines = [];
    for (const it of items) {
      const book = bookModel.findById(it.bookId);
      if (!book || book.status !== 'on') throw new HttpError('图书不存在或已下架', 400);
      const qty = parseInt(it.quantity, 10);
      if (!Number.isInteger(qty) || qty < 1) throw new HttpError('商品数量不合法', 400);
      if (!bookModel.decreaseSaleStock(book.id, qty)) {
        throw new HttpError(`《${book.title}》可售库存不足`, 400);
      }
      total += book.price * qty;
      lines.push({ book_id: book.id, title: book.title, price: book.price, quantity: qty });
    }
    total = round2(total);

    const order = orderModel.create({
      order_no: genOrderNo(),
      user_id: userId,
      total_amount: total,
      address,
    });
    for (const l of lines) orderModel.addItem({ order_id: order.id, ...l });
    return { id: order.id, order_no: order.order_no, total_amount: total };
  })();
}

// 模拟支付：待支付 -> 已支付（预留真实支付接口）
function pay(userId, orderNo) {
  return db.transaction(() => {
    const o = orderModel.findByNo(orderNo);
    if (!o || o.user_id !== userId) throw new HttpError('订单不存在', 404);
    if (o.status !== 'pending') throw new HttpError('当前订单状态不可支付', 400);
    orderModel.updateStatus(o.id, 'paid', { paid_at: new Date().toISOString() });
    return { order_no: o.order_no, status: 'paid' };
  })();
}

// 取消订单：回补库存
function cancel(userId, orderNo) {
  return db.transaction(() => {
    const o = orderModel.findByNo(orderNo);
    if (!o || o.user_id !== userId) throw new HttpError('订单不存在', 404);
    if (o.status !== 'pending') throw new HttpError('仅待支付订单可取消', 400);
    orderModel.updateStatus(o.id, 'cancelled', { cancelled_at: new Date().toISOString() });
    const items = orderModel.itemsByOrder(o.id);
    for (const it of items) bookModel.increaseSaleStock(it.book_id, it.quantity);
    return { order_no: o.order_no, status: 'cancelled' };
  })();
}

module.exports = { createOrder, pay, cancel };
