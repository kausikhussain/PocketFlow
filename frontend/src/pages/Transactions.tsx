import React, { useState, useEffect } from 'react';
import { 
  Search, ArrowUpDown, Trash2, Edit2, 
  ArrowUpRight, ArrowDownRight, RefreshCw, X,
  Utensils, Car, ShoppingBag, Smartphone, Film, GraduationCap,
  CreditCard, Landmark, Briefcase, Laptop, Gift, Coins, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TransactionModal from '../components/TransactionModal';
import ConfirmDialog from '../components/ConfirmDialog';

const EXPENSE_CATEGORIES = [
  'Food', 'Travel', 'Shopping', 'Recharge', 'Entertainment', 'College', 'Bills', 'Other'
];

const INCOME_CATEGORIES = [
  'Pocket Money', 'Salary', 'Freelance', 'Gift', 'Refund', 'Investment', 'Other'
];

const Transactions: React.FC = () => {
  const { getCurrencySymbol } = useAuth();

  // Helper to map category tags to gorgeous visual icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      // Expenses
      case 'Food': return <Utensils className="h-4.5 w-4.5" />;
      case 'Travel': return <Car className="h-4.5 w-4.5" />;
      case 'Shopping': return <ShoppingBag className="h-4.5 w-4.5" />;
      case 'Recharge': return <Smartphone className="h-4.5 w-4.5" />;
      case 'Entertainment': return <Film className="h-4.5 w-4.5" />;
      case 'College': return <GraduationCap className="h-4.5 w-4.5" />;
      case 'Bills': return <CreditCard className="h-4.5 w-4.5" />;
      // Incomes
      case 'Pocket Money': return <Landmark className="h-4.5 w-4.5" />;
      case 'Salary': return <Briefcase className="h-4.5 w-4.5" />;
      case 'Freelance': return <Laptop className="h-4.5 w-4.5" />;
      case 'Gift': return <Gift className="h-4.5 w-4.5" />;
      case 'Refund': return <RefreshCw className="h-4.5 w-4.5" />;
      case 'Investment': return <TrendingUp className="h-4.5 w-4.5" />;
      default: return <Coins className="h-4.5 w-4.5" />;
    }
  };
  
  // State variables for list data
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals & triggers
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null);

  // Debounce search term to minimize API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 450);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch transactions based on filter states
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = {
        sortBy,
        sortOrder,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (type !== 'all') params.type = type;
      if (category) params.category = category;

      const res = await api.get('/transactions', { params });
      setTransactions(res.data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [debouncedSearch, type, category, sortBy, sortOrder]);

  // Handle Edit Submit
  const handleEditSubmit = async (data: any) => {
    if (!selectedTransaction) return;

    try {
      const res = await api.put(`/transactions/${selectedTransaction._id}`, data);
      
      // Update local state list
      setTransactions(
        transactions.map((t) => (t._id === selectedTransaction._id ? res.data : t))
      );
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    }
  };

  // Open edit modal
  const openEditModal = (trans: any) => {
    setSelectedTransaction(trans);
    setModalOpen(true);
  };

  // Trigger Delete confirmation
  const triggerDelete = (trans: any) => {
    setTransactionToDelete(trans);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete handler
  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    try {
      setLoading(true);
      await api.delete(`/transactions/${transactionToDelete._id}`);
      setTransactions(transactions.filter((t) => t._id !== transactionToDelete._id));
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    } finally {
      setTransactionToDelete(null);
      setDeleteConfirmOpen(false);
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setType('all');
    setCategory('');
    setSortBy('date');
    setSortOrder('desc');
  };

  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
          Transaction Ledger
        </h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
          View, search, filter, and modify your pocket money transactions history.
        </p>
      </div>

      {/* Filter panel */}
      <div className="glass-panel bg-white/50 dark:bg-darkbg-900/50 p-5 rounded-3xl border border-slate-200/50 dark:border-zinc-800/50 shadow-premium space-y-4">
        {/* Search & Sort select */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category, notes..."
              className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <ArrowUpDown className="h-4.5 w-4.5" />
            </div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl text-xs font-semibold text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer appearance-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Filter chips / selects */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex bg-slate-100 dark:bg-darkbg-850 p-1 rounded-xl">
              <button
                onClick={() => setType('all')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  type === 'all'
                    ? 'bg-white dark:bg-darkbg-900 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setType('income')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  type === 'income'
                    ? 'bg-income-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-income-500'
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setType('expense')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  type === 'expense'
                    ? 'bg-expense-505 bg-expense-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-expense-500'
                }`}
              >
                Expenses
              </button>
            </div>

            {/* Category Filter selector */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-xl text-[10px] font-bold text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filter button */}
          {(search || type !== 'all' || category || sortBy !== 'date' || sortOrder !== 'desc') && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-darkbg-800 rounded-xl text-[10px] font-bold text-slate-500 dark:text-zinc-400 transition-colors"
            >
              <RefreshCw className="h-3 w-3" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Timeline List Content */}
      <div className="glass-panel bg-white/50 dark:bg-darkbg-900/50 rounded-3xl border border-slate-200/50 dark:border-zinc-800/50 shadow-premium overflow-hidden">
        {loading && transactions.length === 0 ? (
          <div className="py-24 text-center text-slate-400 font-semibold text-sm">
            Fetching transactions log...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm font-semibold text-slate-450 text-slate-400 dark:text-zinc-500">
              No transactions matching your criteria.
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
              Try adjusting your search queries or clearing filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-zinc-500">
                  <th className="py-4.5 px-6">Status</th>
                  <th className="py-4.5 px-6">Category</th>
                  <th className="py-4.5 px-6">Date</th>
                  <th className="py-4.5 px-6">Note</th>
                  <th className="py-4.5 px-6 text-right">Amount</th>
                  <th className="py-4.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                {transactions.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-darkbg-800/20 transition-colors group"
                  >
                    <td className="py-4.5 px-6">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase ${
                        t.type === 'income'
                          ? 'bg-income-50 dark:bg-income-500/10 text-income-500'
                          : 'bg-expense-50 dark:bg-expense-500/10 text-expense-500'
                      }`}>
                        {t.type === 'income' ? (
                          <>
                            <ArrowUpRight className="h-3 w-3" /> Inflow
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="h-3 w-3" /> Outflow
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 font-semibold text-sm text-slate-800 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${
                          t.type === 'income' 
                            ? 'bg-income-50 dark:bg-income-500/10 text-income-500' 
                            : 'bg-expense-50 dark:bg-expense-500/10 text-expense-500'
                        }`}>
                          {getCategoryIcon(t.category)}
                        </div>
                        <span>{t.category}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 text-xs font-semibold text-slate-400 dark:text-zinc-500">
                      {new Date(t.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-4.5 px-6 text-xs text-slate-400 dark:text-zinc-500 font-medium max-w-xs truncate">
                      {t.note || '—'}
                    </td>
                    <td className={`py-4.5 px-6 text-right font-bold text-sm ${
                      t.type === 'income' ? 'text-income-500' : 'text-expense-500'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}{getCurrencySymbol()}{t.amount.toFixed(2)}
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex justify-end gap-1 px-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-2 text-slate-400 hover:text-brand-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-darkbg-800 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => triggerDelete(t)}
                          className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-450 hover:bg-slate-100 dark:hover:bg-darkbg-800 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile List Cards View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-zinc-800/40">
              {transactions.map((t) => (
                <div
                  key={t._id}
                  className="p-4 flex items-center justify-between bg-white/40 dark:bg-darkbg-900/40"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      t.type === 'income'
                        ? 'bg-income-50 dark:bg-income-500/10 text-income-500'
                        : 'bg-expense-50 dark:bg-expense-500/10 text-expense-500'
                    }`}>
                      {getCategoryIcon(t.category)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-805 dark:text-white text-slate-800">
                        {t.category}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">
                        {new Date(t.date).toLocaleDateString()}
                        {t.note && ` • ${t.note}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${
                      t.type === 'income' ? 'text-income-500' : 'text-expense-500'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}{getCurrencySymbol()}{t.amount.toFixed(2)}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => openEditModal(t)}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-darkbg-800 rounded-xl"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => triggerDelete(t)}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTransaction(null);
        }}
        onSubmit={handleEditSubmit}
        transactionToEdit={selectedTransaction}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Transaction Log?"
        message="This operation will delete this specific entry permanently from your history and immediately recalculate your balance. Are you sure?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setTransactionToDelete(null);
        }}
        confirmText="Yes, Delete"
        isDanger={true}
      />
    </div>
  );
};

export default Transactions;
