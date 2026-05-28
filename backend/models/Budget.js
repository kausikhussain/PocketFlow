import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [0, 'Budget limit cannot be negative'],
    },
    month: {
      type: Number,
      required: [true, 'Budget month is required (0-11)'],
      min: 0,
      max: 11,
    },
    year: {
      type: Number,
      required: [true, 'Budget year is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate budgets for the same user in the same month/year
BudgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Budget', BudgetSchema);
