const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const config = require('../config');
const { ok } = require('../utils/response');
const { validate } = require('../utils/validate');
const { auth } = require('../middleware/auth');
const { logOperation } = require('../middleware/logger');
const userModel = require('../models/user');

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少 6 位'),
  name: z.string().min(1, '昵称不能为空').max(30),
});

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空'),
});

// 注册
router.post('/register', (req, res) => {
  const data = validate(registerSchema, req.body);
  if (userModel.findByEmail(data.email)) {
    return res.status(400).json({ code: 1, message: '该邮箱已注册', data: null });
  }
  const user = userModel.create({
    email: data.email,
    password: bcrypt.hashSync(data.password, 10),
    name: data.name,
  });
  logOperation(user.id, 'register', `用户注册: ${user.email}`);
  ok(res, { id: user.id, email: user.email, name: user.name }, '注册成功');
});

// 登录
router.post('/login', (req, res) => {
  const data = validate(loginSchema, req.body);
  const user = userModel.findByEmail(data.email);
  if (!user || !bcrypt.compareSync(data.password, user.password)) {
    return res.status(401).json({ code: 1, message: '邮箱或密码错误', data: null });
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpires }
  );
  logOperation(user.id, 'login', `用户登录: ${user.email}`);
  ok(res, { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } }, '登录成功');
});

// 当前用户信息
router.get('/me', auth, (req, res) => {
  const user = userModel.findById(req.user.id);
  if (!user) return res.status(404).json({ code: 1, message: '用户不存在', data: null });
  ok(res, user);
});

module.exports = router;
