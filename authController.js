const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/config');

const SALT_ROUNDS = 10;
const ALLOWED_THEMES = ['dark', 'light'];

const toSafeUser = (user) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  lastSeen: user.lastSeen,
  theme: user.theme,
  backgroundUrl: user.backgroundUrl,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const signToken = (userId) => jwt.sign({ id: userId }, config.SECRET_KEY, { expiresIn: '7d' });

exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      lastSeen: new Date(),
    });

    const token = signToken(user.id);
    res.status(201).json({
      token,
      user: toSafeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    user.lastSeen = new Date();
    await user.save();

    const token = signToken(user.id);
    res.json({
      token,
      user: toSafeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

exports.profile = async (req, res) => {
  res.json({ user: toSafeUser(req.user) });
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const { theme, backgroundUrl } = req.body;

    if (theme && !ALLOWED_THEMES.includes(theme)) {
      return res.status(400).json({ message: 'Invalid theme option.' });
    }

    if (theme) {
      req.user.theme = theme;
    }

    if (typeof backgroundUrl !== 'undefined') {
      req.user.backgroundUrl = backgroundUrl || null;
    }

    await req.user.save();

    res.json({ user: toSafeUser(req.user) });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    req.user.lastSeen = new Date();
    await req.user.save();
    res.json({ message: 'Logged out.' });
  } catch (error) {
    next(error);
  }
};
