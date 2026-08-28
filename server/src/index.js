const express = require('express');
const cors = require('cors');
const config = require('./config');
const { seed } = require('./db/seed');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');

const app = express();

// CORS：支持逗号分隔多来源；'*' 时放开
const origins = config.clientOrigin === '*' ? true : config.clientOrigin.split(',').map((s) => s.trim());
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json());
app.use(requestLogger);

// 首次启动自动写入种子数据（20 本图书 + 管理员账号）
seed();

app.get('/api/health', (req, res) => res.json({ code: 0, message: 'ok', data: { status: 'up' } }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/borrows', require('./routes/borrows'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[server] 图书网站后端已启动: http://localhost:${config.port}`);
});
