import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User as UserIcon, Coins, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Auth: React.FC = () => {
  const { user, login, register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [initialBalance, setInitialBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
    clearError();
    setValidationError(null);
  }, [user, navigate, isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email || !password) {
      setValidationError('Please fill in all email and password fields.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }

    if (!isLogin && !name) {
      setValidationError('Please enter your name.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        const bal = initialBalance === '' ? 0 : parseFloat(initialBalance);
        if (isNaN(bal) || bal < 0) {
          setValidationError('Initial balance must be a positive number.');
          setLoading(false);
          return;
        }
        await register(name, email, password, currency, bal);
      }
      navigate('/dashboard');
    } catch (err) {
      // Handled in context error state
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg-950 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Orbs */}
      <div className="absolute top-[20%] left-[-15%] w-[40vw] h-[40vw] rounded-full bg-brand-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-15%] w-[40vw] h-[40vw] rounded-full bg-violet-500/10 blur-[100px] pointer-events-none" />

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </button>

      {/* Brand logo */}
      <div className="flex items-center gap-2.5 mb-6 select-none">
        <div className="p-2 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-xl text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
          Velo<span className="text-brand-500 font-normal">Finance</span>
        </span>
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-md glass-panel bg-white dark:bg-darkbg-900 rounded-3xl p-8 border border-slate-200/50 dark:border-zinc-800/50 shadow-2xl"
      >
        {/* Toggle tabs */}
        <div className="flex bg-slate-100 dark:bg-darkbg-800 p-1 rounded-xl mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              isLogin
                ? 'bg-white dark:bg-darkbg-900 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              !isLogin
                ? 'bg-white dark:bg-darkbg-900 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || validationError) && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 rounded-xl text-xs text-rose-500 font-semibold leading-relaxed">
              {validationError || error}
            </div>
          )}

          {/* Name input (Register only) */}
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                />
              </div>
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Register-only preferences */}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              {/* Currency Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                  Currency
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Coins className="h-4.5 w-4.5" />
                  </div>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer appearance-none"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>

              {/* Initial Balance */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                  Initial Cash
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-darkbg-800 border border-slate-200/50 dark:border-zinc-800/50 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium font-sans"
                />
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/50 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all flex justify-center items-center"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Auth;
