import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    note: string;
    date: string;
  }) => Promise<void>;
  transactionToEdit?: any;
  defaultType?: 'income' | 'expense';
}

const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Recharge',
  'Entertainment',
  'College',
  'Bills',
  'Other',
];

const INCOME_CATEGORIES = [
  'Pocket Money',
  'Salary',
  'Freelance',
  'Gift',
  'Refund',
  'Investment',
  'Other',
];

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  transactionToEdit,
  defaultType = 'expense',
}) => {
  const { getCurrencySymbol } = useAuth();
  
  const [type, setType] = useState<'income' | 'expense'>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default category when type or modal state changes
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(transactionToEdit.amount.toString());
      setCategory(transactionToEdit.category);
      setNote(transactionToEdit.note || '');
      setDate(new Date(transactionToEdit.date).toISOString().split('T')[0]);
    } else {
      setType(defaultType);
      setAmount('');
      setCategory(defaultType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
    }
    setError(null);
  }, [isOpen, transactionToEdit, defaultType]);

  // Adjust categories when type changes
  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!category) {
      setError('Please select a category.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        amount: parsedAmount,
        category,
        note,
        date: new Date(date).toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit transaction. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoriesList = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm dark:bg-black/80"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg glass-panel bg-white dark:bg-darkbg-900 rounded-3xl shadow-2xl border border-slate-200/60 dark:border-zinc-800/60 overflow-hidden z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-darkbg-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white font-sans">
                {transactionToEdit ? 'Edit Transaction' : type === 'expense' ? 'Add Expense' : 'Add Income'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
                {transactionToEdit ? 'Modify the details of your transaction.' : 'Fill in the details to track your transaction.'}
              </p>
            </div>

            {/* Type selector Tabs (only show when creating new transaction) */}
            {!transactionToEdit && (
              <div className="px-6 mb-4">
                <div className="flex bg-slate-100 dark:bg-darkbg-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('expense')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                      type === 'expense'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('income')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                      type === 'income'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    Income (Add Money)
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 rounded-xl text-xs text-rose-500 font-semibold">
                  {error}
                </div>
              )}

              {/* Amount input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
                    <span className="text-xl font-bold text-slate-400 dark:text-zinc-500 font-sans">
                      {getCurrencySymbol()}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-xl text-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:focus:border-brand-500 transition-all font-sans"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none font-medium cursor-pointer"
                      required
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Note input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                  Note / Description (Optional)
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3.5 flex items-center pointer-events-none text-slate-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Starbucks, Uber, Pocket money"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 text-sm font-semibold rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-darkbg-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-3 text-sm font-semibold rounded-xl text-white shadow-md transition-all ${
                    type === 'expense'
                      ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                  } disabled:opacity-50`}
                >
                  {isSubmitting ? 'Saving...' : transactionToEdit ? 'Save Changes' : type === 'expense' ? 'Add Expense' : 'Add Money'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TransactionModal;
