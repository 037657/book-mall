# 墨香书坊 · 图书借阅与购买一体化网站

一个面向个人使用的全栈图书网站，支持图书**在线借阅**与**购买**，前后端分离、代码规范、可直接部署上线。UI 采用暖棕/米色系，布局参考豆瓣读书，移动端响应式适配。

## 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 前端 | Vue 3 + Vite + Pinia + Vue Router | 纯 CSS 主题，不引入重型 UI 库 |
| 后端 | Node.js + Express | RESTful API |
| 数据库 | SQLite（better-sqlite3） | 零配置、单文件、事务安全 |
| 校验 | zod | 所有接口参数校验 |
| 鉴权 | JWT | 登录态 + 角色权限 |
| 部署 | 前端 Vercel / 后端 Render | 均为免费方案 |

> 原需求中的 SQLServer 因无法在免费托管上运行，已替换为 SQLite（覆盖全部业务无压力）。

## 项目结构

```
book-mall/
├── package.json           # 根：workspaces + 一键启动脚本
├── .env.example           # 环境变量说明（复制为 .env 使用）
├── README.md
├── server/                # 后端
│   ├── src/
│   │   ├── index.js       # 入口
│   │   ├── config.js      # 配置 + 业务规则常量
│   │   ├── routes/        # auth / books / borrows / cart / orders / admin
│   │   ├── services/      # borrowService（借阅事务）/ orderService（下单事务）
│   │   ├── models/        # user / book / borrow / cart / order 数据访问
│   │   ├── middleware/    # JWT 鉴权 / 错误处理 / 日志
│   │   ├── utils/         # 响应封装 / zod 校验 / 自定义错误
│   │   └── db/            # 连接 + schema.sql + seed.js（20 本图书 + 管理员）
│   └── data/              # SQLite 数据库文件（自动生成，已 gitignore）
└── frontend/              # 前端
    ├── src/
    │   ├── views/         # 前台页面
    │   ├── views/admin/   # 后台页面
    │   ├── components/    # 导航 / 图书卡片 / 封面 / 分页 / Toast
    │   ├── stores/        # Pinia（user / cart / ui）
    │   ├── api/           # Axios 封装（统一响应拦截）
    │   ├── router/        # 路由 + 登录/角色守卫
    │   └── utils/         # 日期格式化 / 状态字典
    └── vercel.json        # Vercel SPA 路由回退
```

## 功能一览

- **普通用户**：浏览/搜索/筛选图书、图书详情（借阅 + 加入购物车双入口）、购物车、结算下单、模拟支付、我的借阅（续借/归还/逾期罚款）、我的订单、登录注册。
- **管理员**：数据看板（图书数/用户数/在借/逾期/销售额）、图书管理（上架/编辑/下架/删除）、借阅管理（含逾期列表 + 办理归还）、订单管理（发货/完成）。

### 业务规则

- 借阅：每人最多同时借 **3 本**，借期 **14 天**，可续借 **1 次**（+7 天）。
- 逾期：每天 **¥0.5**，归还时结算。
- 库存：可借库存与可售库存**分开管理**，互不占用。
- 购买：模拟支付（下单 → 跳转模拟支付页 → 确认即支付成功，预留接口可替换为支付宝/微信）。
- 订单状态：`待支付 → 已支付 → 已发货 → 已完成 / 已取消`。
- 借阅与下单均使用**数据库事务**扣减库存，防止超卖。

## 演示账号

| 角色 | 邮箱 | 密码 |
|---|---|---|
| 管理员 | admin@test.com | admin123 |
| 普通用户 | user@test.com | user123 |

---

## 本地运行

环境要求：Node.js ≥ 18（推荐 20/22）。

### 1. 安装依赖（项目根目录）

```bash
npm install
```

### 2. 配置环境变量（可选）

```bash
cp .env.example .env          # Linux / macOS
copy .env.example .env        # Windows
```

不配置也可直接运行（后端有默认值，会自动创建数据库并写入种子数据）。

### 3. 一键启动前后端

```bash
npm run dev
```

启动后：

- 前端：http://localhost:5173
- 后端：http://localhost:3000/api/health

> 前端已配置 Vite 代理，本地开发时 `/api` 请求会自动转发到 `http://localhost:3000`，无需额外配置。

### 4. 单独启动（可选）

```bash
npm run dev:server     # 仅后端
npm run dev:frontend   # 仅前端
```

### 5. 重新初始化种子数据（可选）

```bash
npm run seed
```

---

## 部署上线

前端与后端分开部署（免费方案）：**前端 → Vercel**，**后端 → Render**。数据库文件放在 Render 的持久磁盘上。

### 前置：把代码推到 GitHub

两个平台都从 GitHub 仓库自动构建部署，请先将本项目 push 到一个 GitHub 仓库。

```bash
git init
git add .
git commit -m "init book mall"
git branch -M main
git remote add origin https://github.com/<你的用户名>/book-mall.git
git push -u origin main
```

### 第一步：部署后端到 Render

1. 打开 [render.com](https://render.com) 注册/登录，点击 **New + → Web Service**。
2. 连接 GitHub，选择 `book-mall` 仓库。
3. 填写以下配置：

| 配置项 | 值 |
|---|---|
| Name | book-mall-api（随意） |
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node src/index.js` |

4. 添加**环境变量**（Environment → Add Environment Variable）：

| Key | Value |
|---|---|
| `JWT_SECRET` | 一串随机字符串（可用 `openssl rand -hex 32` 生成） |
| `CLIENT_ORIGIN` | 先填 `*`，稍后改成 Vercel 域名 |

5. 添加**持久磁盘**（重要，否则数据库重启即丢失）：
   - 左侧 **Disks** → **Add Disk**，挂载路径填 `/var/data`，大小选免费档（1 GB）。
   - 再添加一个环境变量：`DB_PATH` = `/var/data/library.db`。

6. 点击 **Create Web Service**，等待构建部署完成。完成后记录后端地址，例如：
   `https://book-mall-api.onrender.com`

7. 验证：浏览器访问 `https://book-mall-api.onrender.com/api/health`，应返回
   `{"code":0,"message":"ok","data":{"status":"up"}}`。

### 第二步：部署前端到 Vercel

1. 打开 [vercel.com](https://vercel.com) 登录，点击 **Add New → Project**。
2. 导入 `book-mall` 仓库。
3. 配置构建参数：

| 配置项 | 值 |
|---|---|
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

4. 添加**环境变量**：

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://book-mall-api.onrender.com`（第一步得到的后端地址） |

5. 点击 **Deploy**。部署完成后会得到前端地址，例如 `https://book-mall.vercel.app`。

### 第三步：打通前后端（收尾）

1. 回到 Render 后端，把环境变量 `CLIENT_ORIGIN` 从 `*` 改成前端地址
   `https://book-mall.vercel.app`（多个用逗号分隔）。
2. Render 会**自动重新部署**，等它完成即可。
3. 打开前端地址，用演示账号登录，即可体验完整功能。

> 注意：Render 免费档实例闲置约 15 分钟会休眠，首次访问会冷启动（约 30~60 秒），属正常现象；如需常驻可选付费档或改用 Railway / Fly.io。

---

## 环境变量说明

后端（`.env`，见 `.env.example`）：

| 变量 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `PORT` | 否 | `3000` | 服务端口 |
| `JWT_SECRET` | 生产必填 | 开发默认值 | JWT 签名密钥 |
| `JWT_EXPIRES` | 否 | `7d` | Token 有效期 |
| `DB_PATH` | 否 | `server/data/library.db` | SQLite 文件路径（Render 填 `/var/data/library.db`） |
| `CLIENT_ORIGIN` | 否 | `*` | 允许的跨域来源 |

前端（`frontend/.env`）：

| 变量 | 必填 | 说明 |
|---|---|---|
| `VITE_API_BASE_URL` | 生产必填 | 后端地址；本地留空走 Vite 代理 |

## 数据库

- 建表 SQL 位于 `server/src/db/schema.sql`（含外键与索引）。
- 首次启动自动执行建表 + 写入种子数据（20 本图书、管理员与演示用户）。
- 表：`users`、`books`、`borrow_records`、`cart_items`、`orders`、`order_items`、`logs`。

## 接口规范

- 统一响应格式：`{ code, message, data }`，`code = 0` 表示成功。
- RESTful 路由：`/api/auth`、`/api/books`、`/api/borrows`、`/api/cart`、`/api/orders`、`/api/admin`。
- 全部接口使用 zod 参数校验；登录、注册、下单、支付等关键操作记录到 `logs` 表。

## 常见问题

- **`better-sqlite3` 安装失败**：确保 Node 版本 ≥ 18，或删除 `node_modules` 后重试 `npm install`。
- **前端请求 404**：确认后端已启动，本地默认代理到 `http://localhost:3000`。
- **部署后前端访问接口报 CORS**：检查后端 `CLIENT_ORIGIN` 是否包含前端域名。
- **Render 数据丢失**：确认已挂载持久磁盘并设置 `DB_PATH=/var/data/library.db`。
