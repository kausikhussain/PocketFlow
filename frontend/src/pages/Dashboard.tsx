import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowDownRight, ArrowUpRight, Calendar, Landmark, 
  Plus, Minus, RefreshCw, Download, ReceiptText, AlertCircle,
  Utensils, Car, ShoppingBag, Smartphone, Film, GraduationCap,
  CreditCard, Gift, Briefcase, Laptop, Coins, Sparkles, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatCard from '../components/StatCard';
import TransactionModal from '../components/TransactionModal';
import ConfirmDialog from '../components/ConfirmDialog';

const Dashboard: React.FC = () => {
  const { user, getCurrencySymbol } = useAuth();
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgetLimit, setBudgetLimit] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpense: 0,
    todayExpense: 0,
    monthExpense: 0,
  });

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  // 1-Click mock data injector handler
  const handleGenerateMockData = async () => {
    try {
      setLoading(true);
      await api.post('/transactions/mock');
      await fetchData();
    } catch (err) {
      console.error('Failed to generate mock data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, budgetRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/budgets/current')
      ]);

      const transList = transRes.data;
      setTransactions(transList);
      setBudgetLimit(budgetRes.data?.limit || 0);

      // Compute statistics
      computeStats(transList);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const computeStats = (list: any[]) => {
    const initial = user?.initialBalance || 0;
    let incomeSum = 0;
    let expenseSum = 0;
    let todaySum = 0;
    let monthSum = 0;

    const todayStr = new Date().toDateString();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    list.forEach((t) => {
      const amt = t.amount;
      const tDate = new Date(t.date);

      if (t.type === 'income') {
        incomeSum += amt;
      } else {
        expenseSum += amt;
        
        // Check if today
        if (tDate.toDateString() === todayStr) {
          todaySum += amt;
        }

        // Check if this month
        if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
          monthSum += amt;
        }
      }
    });

    setStats({
      balance: initial + incomeSum - expenseSum,
      totalIncome: incomeSum,
      totalExpense: expenseSum,
      todayExpense: todaySum,
      monthExpense: monthSum,
    });
  };

  // Add Transaction handler
  const handleAddTransactionSubmit = async (data: any) => {
    const res = await api.post('/transactions', data);
    const updatedList = [res.data, ...transactions];
    setTransactions(updatedList);
    computeStats(updatedList);
  };

  // Reset current month transactions handler
  const handleResetMonth = async () => {
    try {
      setLoading(true);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      // Filter transactions that fall in the current month
      const toDelete = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      // Delete each via API
      await Promise.all(toDelete.map((t) => api.delete(`/transactions/${t._id}`)));
      
      // Reload fresh data
      await fetchData();
    } catch (err) {
      console.error('Failed to reset month:', err);
    } finally {
      setConfirmOpen(false);
    }
  };

  // Export transactions to CSV
  const handleExportData = () => {
    if (transactions.length === 0) return;

    const headers = ['Date', 'Type', 'Amount', 'Category', 'Note'];
    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.type.toUpperCase(),
      t.amount,
      t.category,
      t.note || '',
    ]);

    const csvContent = 
      'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VeloFinance_Backup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setModalOpen(true);
  };

  // Format currency
  const formatVal = (val: number) => {
    return `${getCurrencySymbol()}${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Budget progress percent
  const budgetPercent = budgetLimit > 0 ? Math.min((stats.monthExpense / budgetLimit) * 100, 100) : 0;
  const isBudgetWarning = budgetLimit > 0 && stats.monthExpense > budgetLimit;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            Hello, {user?.name} 👋
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            Here's a breakdown of your pocket money and expenses.
          </p>
        </div>
      </div>

      {/* Primary Balance Display (Apple Card Style) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-600 text-white p-8 shadow-xl shadow-brand-500/10"
      >
        {/* Background mesh details */}
        <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-white/5 blur-3xl translate-x-20 translate-y-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-100/80">Available Net Balance</span>
            <h1 className="text-4xl md:text-5xl font-black font-sans leading-none">
              {loading ? '---' : formatVal(stats.balance)}
            </h1>
            <p className="text-xs text-brand-150 text-brand-200/85">
              Initial Pocket Money: {formatVal(user?.initialBalance || 0)}
            </p>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            <button
              onClick={() => openModal('income')}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4.5 py-3 rounded-2xl bg-white text-brand-600 hover:bg-slate-50 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="h-4.5 w-4.5 text-income-500 stroke-[3]" /> Add Money
            </button>
            <button
              onClick={() => openModal('expense')}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4.5 py-3 rounded-2xl bg-slate-900/15 text-white hover:bg-slate-900/25 border border-white/20 font-bold text-xs transition-all active:scale-95"
            >
              <Minus className="h-4.5 w-4.5 text-expense-500 stroke-[3]" /> Add Expense
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Added"
          value={loading ? '---' : formatVal(stats.totalIncome)}
          icon={ArrowUpRight}
          type="income"
          description="Inflows recorded"
          delay={0.1}
        />
        <StatCard
          title="Total Spent"
          value={loading ? '---' : formatVal(stats.totalExpense)}
          icon={ArrowDownRight}
          type="expense"
          description="Outflows recorded"
          delay={0.2}
        />
        <StatCard
          title="Spent Today"
          value={loading ? '---' : formatVal(stats.todayExpense)}
          icon={Calendar}
          description="Daily pocket spending"
          delay={0.3}
        />
        <StatCard
          title="Spent This Month"
          value={loading ? '---' : formatVal(stats.monthExpense)}
          icon={Landmark}
          description="Current monthly budget"
          delay={0.4}
        />
      </div>

      {/* Budget Goal Overview */}
      {budgetLimit > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel bg-white/60 dark:bg-darkbg-900/60 p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 shadow-premium"
        >
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Monthly Spending Progress
              </span>
              {isBudgetWarning && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-lg border border-rose-200/20">
                  <AlertCircle className="h-3 w-3" /> Over Budget
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
              {formatVal(stats.monthExpense)} / {formatVal(budgetLimit)}
            </span>
          </div>
          
          {/* Progress bar container */}
          <div className="w-full h-3.5 bg-slate-100 dark:bg-darkbg-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${budgetPercent}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${
                isBudgetWarning 
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600' 
                  : 'bg-gradient-to-r from-brand-500 to-indigo-500'
              }`}
            />
          </div>
        </motion.div>
      )}

      {/* Layout grid: Recent Transactions & Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List (2/3 width) */}
        <div className="lg:col-span-2 glass-panel bg-white/50 dark:bg-darkbg-900/50 p-6 rounded-3xl border border-slate-200/50 dark:border-zinc-800/50 shadow-premium">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-md">
              <ReceiptText className="h-5 w-5 text-brand-500" /> Recent Timelines
            </h3>
            <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
              Showing last 5 logs
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading timelines...</div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-400 dark:text-zinc-500">No transactions recorded yet.</p>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Tap Add Money or Add Expense to start.</p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleGenerateMockData}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200/40 dark:border-brand-500/20 text-xs font-bold hover:bg-brand-100 transition-colors"
                >
                  <Sparkles className="h-4 w-4" /> Load Demo Data
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((t) => (
                <div
                  key={t._id}
                  className="flex items-center justify-between p-3.5 bg-white/80 dark:bg-darkbg-900/80 rounded-2xl border border-slate-100 dark:border-zinc-800/40 shadow-sm"
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
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">
                        {t.category}
                      </h4>
                      {t.note && (
                        <p className="text-xs text-slate-400 dark:text-zinc-500 truncate max-w-xs mt-0.5 font-medium">
                          {t.note}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`text-sm font-bold ${
                      t.type === 'income' ? 'text-income-500' : 'text-expense-500'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}{getCurrencySymbol()}{t.amount.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold mt-0.5">
                      {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Panel (1/3 width) */}
        <div className="space-y-4">
          <div className="glass-panel bg-white/50 dark:bg-darkbg-900/50 p-6 rounded-3xl border border-slate-200/50 dark:border-zinc-800/50 shadow-premium">
            <h3 className="font-bold text-slate-800 dark:text-white mb-5 text-md">
              Quick Controls
            </h3>
            
            <div className="space-y-3">
              {/* Reset Month Action */}
              <button
                onClick={() => setConfirmOpen(true)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-darkbg-700 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500">
                    <RefreshCw className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Reset Month</h4>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Clear current month logs</p>
                  </div>
                </div>
              </button>

              {/* Export Data Action */}
              <button
                onClick={handleExportData}
                disabled={transactions.length === 0}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-darkbg-700 disabled:opacity-55 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-505 text-brand-500">
                    <Download className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Export Ledger</h4>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Download spreadsheet CSV</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddTransactionSubmit}
        defaultType={modalType}
      />

      {/* Confirm Action Dialogue */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Reset Monthly Spendings?"
        message="This operation will delete all cash inflows and outflows logged in the current calendar month. This action is permanent and cannot be undone."
        onConfirm={handleResetMonth}
        onCancel={() => setConfirmOpen(false)}
        confirmText="Yes, Reset"
        isDanger={true}
      />
    </div>
  );
};

export default Dashboard;
