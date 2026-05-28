import express from 'express';
import Budget from '../models/Budget.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/budgets/current
// @desc    Get budget limit for a specific month and year
// @access  Private
router.get('/current', protect, async (req, res) => {
  // Default to current system date if not specified
  const now = new Date();
  const month = req.query.month !== undefined ? Number(req.query.month) : now.getMonth();
  const year = req.query.year !== undefined ? Number(req.query.year) : now.getFullYear();

  try {
    const budget = await Budget.findOne({
      user: req.user.id,
      month,
      year,
    });

    if (!budget) {
      return res.json({ limit: 0, month, year, exists: false });
    }

    res.json({ ...budget.toObject(), exists: true });
  } catch (error) {
    console.error('Fetch budget error:', error.message);
    res.status(500).json({ message: 'Server error, failed to fetch budget' });
  }
});

// @route   POST api/budgets
// @desc    Set or update a monthly budget limit
// @access  Private
router.post('/', protect, async (req, res) => {
  const { limit, month, year } = req.body;

  if (limit === undefined || month === undefined || year === undefined) {
    return res.status(400).json({ message: 'Please provide limit, month, and year' });
  }

  const budgetLimit = Number(limit);
  if (budgetLimit < 0) {
    return res.status(400).json({ message: 'Budget limit cannot be negative' });
  }

  try {
    // Upsert: update existing or insert new budget limit
    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user.id,
        month: Number(month),
        year: Number(year),
      },
      { limit: budgetLimit },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(budget);
  } catch (error) {
    console.error('Set budget error:', error.message);
    res.status(500).json({ message: 'Server error, failed to update budget' });
  }
});

export default router;
