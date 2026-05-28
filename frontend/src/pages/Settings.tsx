import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Settings: React.FC = () => {
  const { user, updateProfile, getCurrencySymbol } = useAuth();

  // Profile forms
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [initialBalance, setInitialBalance] = useState(user?.initialBalance?.toString() || '0');
  
  // Budget limit form
  const [budgetLimit, setBudgetLimit] = useState('');
  
  // Notice notifications states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load user data & budget limit
  useEffect(() => {
    if (user) {
      setName(user.name);
      setCurrency(user.currency);
      setInitialBalance(user.initialBalance.toString());
    }

    const fetchBudget = async () => {
      try {
        const res = await api.get('/budgets/current');
        setBudgetLimit(res.data?.limit?.toString() || '0');
      } catch (err) {
        console.error('Failed to load current budget:', err);
      }
    };

    fetchBudget();
  }, [user]);

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    const parsedBalance = parseFloat(initialBalance);
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      setErrorMsg('Initial balance must be a positive number.');
      return;
    }

    setLoading(true);
    try {
      // 1. Update Profile (Name, Currency, Initial Balance)
      await updateProfile(name, currency, parsedBalance);

      // 2. Update Budget (Limit for the current month)
      const parsedBudget = parseFloat(budgetLimit);
      if (!isNaN(parsedBudget) && parsedBudget >= 0) {
        const now = new Date();
        await api.post('/budgets', {
          limit: parsedBudget,
          month: now.getMonth(),
          year: now.getFullYear(),
        });
      }

      setSuccessMsg('Your configuration changes have been saved successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
          Preferences & Settings
        </h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
          Configure your personal profile details, initial cash setup, and monthly limits.
        </p>
      </div>

      <div className="max-w-xl">
        {/* Success Alert */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold"
          >
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
            {successMsg}
          </motion.div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 rounded-2xl text-xs text-rose-500 font-bold"
          >
            {errorMsg}
          </motion.div>
        )}

        {/* Main Settings Card */}
        <div className="glass-panel bg-white/50 dark:bg-darkbg-900/50 p-6 rounded-3xl border border-slate-200/50 dark:border-zinc-800/50 shadow-premium">
          <h3 className="font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2 text-md">
            <SettingsIcon className="h-5 w-5 text-brand-500" /> Profile Configurations
          </h3>

          <form onSubmit={handleSubmitProfile} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
              />
            </div>

            {/* Email (Read Only) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                Registered Email (Cannot be changed)
              </label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-4 py-3 bg-slate-100 dark:bg-darkbg-850 border border-slate-200/20 dark:border-zinc-800/20 rounded-xl text-sm text-slate-400 dark:text-zinc-500 focus:outline-none font-medium cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Currency */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                  Preffered Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              {/* Initial cash */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                  Initial Cash
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450 dark:text-zinc-500 font-bold text-sm">
                    {getCurrencySymbol()}
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Monthly Budget limit */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                Monthly Spending Budget Limit
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450 dark:text-zinc-500 font-bold text-sm">
                  {getCurrencySymbol()}
                </div>
                <input
                  type="number"
                  step="any"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  placeholder="Set limit, e.g. 2000 (0 for no limit)"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold font-sans"
                />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 pl-1">
                You will be warned on the dashboard if your current month expenditures cross this amount.
              </p>
            </div>

            {/* Save Buttons */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
