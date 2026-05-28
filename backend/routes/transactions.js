import express from 'express';
import Transaction from '../models/Transaction.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/transactions
// @desc    Get user's transactions with search, filter, and sorting
// @access  Private
router.get('/', protect, async (req, res) => {
  const { search, type, category, startDate, endDate, sortBy, sortOrder } = req.query;

  try {
    let query = { user: req.user.id };

    // Apply search filter (searches category or note)
    if (search) {
      query.$or = [
        { note: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Apply type filter (income or expense)
    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    // Apply category filter
    if (category) {
      query.category = category;
    }

    // Apply date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of that day (23:59:59.999)
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Determine sorting parameters
    let sortOptions = {};
    const field = sortBy || 'date';
    const order = sortOrder === 'asc' ? 1 : -1;
    sortOptions[field] = order;

    // Fetch transactions
    const transactions = await Transaction.find(query).sort(sortOptions);

    res.json(transactions);
  } catch (error) {
    console.error('Fetch transactions error:', error.message);
    res.status(500).json({ message: 'Server error, failed to fetch transactions' });
  }
});

// @route   POST api/transactions
// @desc    Add a new transaction
// @access  Private
router.post('/', protect, async (req, res) => {
  const { type, amount, category, note, date } = req.body;

  try {
    // Validations
    if (!type || !amount || !category) {
      return res.status(400).json({ message: 'Please provide type, amount, and category' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      amount: Number(amount),
      category,
      note: note || '',
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error.message);
    res.status(500).json({ message: 'Server error, failed to add transaction' });
  }
});

// @route   PUT api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { type, amount, category, note, date } = req.body;

  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Make sure transaction belongs to user
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update fields
    if (type) transaction.type = type;
    if (amount !== undefined) transaction.amount = Number(amount);
    if (category) transaction.category = category;
    if (note !== undefined) transaction.note = note;
    if (date) transaction.date = new Date(date);

    const updatedTransaction = await transaction.save();

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Update transaction error:', error.message);
    res.status(500).json({ message: 'Server error, failed to update transaction' });
  }
});

// @route   DELETE api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Make sure transaction belongs to user
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await transaction.deleteOne();

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error.message);
    res.status(500).json({ message: 'Server error, failed to delete transaction' });
  }
});

export default router;
