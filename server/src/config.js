const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// 依次尝试加载 .env（项目根 / server 目录），已存在的环境变量优先
const candidates = [
  path.join(__dirname, '..', '..', '.env'),
  path.join(__dirname, '..', '.env'),
];
for (const p of candidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}

module.exports = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-please-change-in-production',
  jwtExpires: process.env.JWT_EXPIRES || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  dbPath: process.env.DB_PATH || path.join(__dirname, '..', 'data', 'library.db'),
  // 业务规则常量
  rules: {
    maxBorrow: 3,        // 每人最多同时借 3 本
    borrowDays: 14,      // 借期 14 天
    renewDays: 7,        // 续借延长 7 天
    maxRenew: 1,         // 最多续借 1 次
    finePerDay: 0.5,     // 逾期每天 0.5 元
  },
};
