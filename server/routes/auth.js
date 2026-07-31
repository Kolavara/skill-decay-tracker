const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();
const SALT_ROUNDS = 10;

router.post('/signup', [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('email').isEmail().withMessage('valid email required'),
  body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, emailDigest: user.emailDigest } });
  } catch (err) {
    next(err);
  }
});

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'invalid credentials' });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: { id: user._id, name: user.name, email: user.email, emailDigest: user.emailDigest } });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'logged out' });
});

router.get('/me', async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) return res.status(401).json({ error: 'user not found' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, emailDigest: user.emailDigest } });
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
});

router.patch('/profile', async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const updates = {};
    if (typeof req.body.emailDigest === 'boolean') {
      updates.emailDigest = req.body.emailDigest;
    }

    const user = await User.findByIdAndUpdate(decoded.userId, updates, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'user not found' });
    
    res.json({ user: { id: user._id, name: user.name, email: user.email, emailDigest: user.emailDigest } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
