const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { allowPublicSignup, jwtSecret, nodeEnv } = require('../config/env');
const { errorResponse, successResponse } = require('../utils/response');

const router = express.Router();

const createSession = (user) => {
  const token = jwt.sign(
    { sub: String(user.id), username: user.username, role: user.role },
    jwtSecret,
    { expiresIn: '8h' },
  );

  return {
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  };
};

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json(errorResponse('Username and password are required'));
  }

  try {
    const { rows } = await db.query(
      'SELECT id, username, email, password_hash, role FROM users WHERE username = $1 OR email = $1 LIMIT 1',
      [username],
    );
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json(errorResponse('Invalid username or password'));
    }

    return res.json(successResponse(createSession(user), 'Login successful'));
  } catch (error) {
    return next(error);
  }
});

router.post('/signup', async (req, res, next) => {
  if (nodeEnv === 'production' && !allowPublicSignup) {
    return res.status(403).json(errorResponse('Public signup is disabled'));
  }

  const username = String(req.body?.username || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = req.body?.password;

  if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(username)) {
    return res.status(400).json(errorResponse('Username must be 3-32 characters using letters, numbers, dots, underscores, or hyphens'));
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json(errorResponse('Enter a valid email address'));
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json(errorResponse('Password must be at least 8 characters'));
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, 'STAFF')
       RETURNING id, username, email, role`,
      [username, email, passwordHash],
    );
    return res.status(201).json(successResponse(createSession(rows[0]), 'Account created'));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json(errorResponse('That username or email is already registered'));
    }
    return next(error);
  }
});

module.exports = router;