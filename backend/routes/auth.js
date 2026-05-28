import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Generate JWT helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'velofinance_secret_token_18273645', {
    expiresIn: '30d',
  });
};

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, currency, initialBalance } = req.body;

  try {
    // Basic verification
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter name, email, and password fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      currency: currency || 'INR',
      initialBalance: initialBalance !== undefined ? Number(initialBalance) : 0,
    });

    if (user) {
      res.status(201).json({
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          initialBalance: user.initialBalance,
        },
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error, registration failed' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password fields' });
    }

    // Check for user email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials, user not found' });
    }

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials, incorrect password' });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        initialBalance: user.initialBalance,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error, login failed' });
  }
});

// @route   GET api/auth/me
// @desc    Get user data
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error, failed to retrieve profile' });
  }
});

// @route   PUT api/auth/profile
// @desc    Update user profile configurations
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const { name, currency, initialBalance } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (currency) user.currency = currency;
    if (initialBalance !== undefined) user.initialBalance = Number(initialBalance);

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      currency: updatedUser.currency,
      initialBalance: updatedUser.initialBalance,
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error, profile update failed' });
  }
});

export default router;
