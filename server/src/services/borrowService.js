const db = require('../db');
const config = require('../config');
const HttpError = require('../utils/httpError');
const bookModel = require('../models/book');
const borrowModel = require('../models/borrow');

const DAY_MS = 24 * 60 * 60 * 1000;

// 借书：事务内校验 + 扣减可借库存
function borrowBook(userId, bookId) {
  return db.transaction(() => {
    const book = bookModel.findById(bookId);
    if (!book) throw new HttpError('图书不存在', 404);
    if (book.status !== 'on') throw new HttpError('图书已下架', 400);

    const active = borrowModel.activeCountByUser(userId);
    if (active >= config.rules.maxBorrow) {
      throw new HttpError(`最多同时借 ${config.rules.maxBorrow} 本，请先归还`, 400);
    }
    if (borrowModel.findActiveByUserAndBook(userId, bookId)) {
      throw new HttpError('你已借阅此书，尚未归还', 400);
    }
    if (!bookModel.decreaseBorrowStock(bookId)) {
      throw new HttpError('可借库存不足', 400);
    }

    const now = new Date();
    const due = new Date(now.getTime() + config.rules.borrowDays * DAY_MS);
    borrowModel.create({
      user_id: userId,
      book_id: bookId,
      borrow_date: now.toISOString(),
      due_date: due.toISOString(),
    });
    return { book: book.title, due_date: due.toISOString(), borrow_days: config.rules.borrowDays };
  })();
}

// 续借：最多 1 次，延长 7 天
function renew(userId, recordId) {
  return db.transaction(() => {
    const r = borrowModel.findById(recordId);
    if (!r || r.user_id !== userId) throw new HttpError('借阅记录不存在', 404);
    if (r.status === 'returned') throw new HttpError('该记录已归还', 400);
    if (r.status === 'overdue') throw new HttpError('已逾期，请先归还并结算', 400);
    if (r.renew_count >= config.rules.maxRenew) throw new HttpError('最多续借 1 次', 400);

    const newDue = new Date(new Date(r.due_date).getTime() + config.rules.renewDays * DAY_MS);
    borrowModel.renew(recordId, newDue.toISOString());
    return { due_date: newDue.toISOString() };
  })();
}

// 归还：结算逾期罚款（每天 0.5 元），回补库存
function returnBook(userId, recordId) {
  return db.transaction(() => {
    const r = borrowModel.findById(recordId);
    if (!r || r.user_id !== userId) throw new HttpError('借阅记录不存在', 404);
    if (r.status === 'returned') throw new HttpError('该记录已归还', 400);

    const now = new Date();
    const due = new Date(r.due_date);
    let fine = 0;
    if (now > due) {
      const days = Math.ceil((now.getTime() - due.getTime()) / DAY_MS);
      fine = Math.round(days * config.rules.finePerDay * 100) / 100;
    }
    borrowModel.markReturned(recordId, now.toISOString(), fine);
    bookModel.increaseBorrowStock(r.book_id);
    return { fine };
  })();
}

module.exports = { borrowBook, renew, returnBook };
