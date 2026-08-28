const express = require('express');
const { ok } = require('../utils/response');
const bookModel = require('../models/book');
const borrowModel = require('../models/borrow');

const router = express.Router();

// 图书列表（筛选/搜索/排序/分页）
router.get('/', (req, res) => {
  const { category, keyword, sort, page, pageSize } = req.query;
  const result = bookModel.list({
    category: category || '',
    keyword: keyword || '',
    sort: sort || 'newest',
    page: Math.max(1, parseInt(page, 10) || 1),
    pageSize: Math.min(50, Math.max(1, parseInt(pageSize, 10) || 12)),
    includeOff: false,
  });
  ok(res, result);
});

// 分类列表
router.get('/categories', (req, res) => {
  ok(res, bookModel.categories());
});

// 图书详情
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const book = bookModel.findById(id);
  if (!book) return res.status(404).json({ code: 1, message: '图书不存在', data: null });
  ok(res, book);
});

module.exports = router;
