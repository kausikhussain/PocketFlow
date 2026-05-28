import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, TrendingUp, ShieldCheck, PieChart, Wallet } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Wallet,
      title: 'Easy Balance Tracking',
      description: 'Set your starting pocket money and watch your net balance automatically adjust with every single entry.',
      color: 'text-brand-500 bg-brand-50 dark:bg-brand-500/10',
    },
    {
      icon: TrendingUp,
      title: 'Quick Cash Flow Logs',
      description: 'Add money or record expenses within seconds. Keep track of specific categories and note down custom details.',
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      icon: PieChart,
      title: 'Deep Spend Analytics',
      description: 'Interact with beautiful visual charts to see exactly where your pocket money is flowing week over week.',
      color: 'text-violet-500 bg-violet-50 dark:bg-violet-500/10',
    },
    {
      icon: ShieldCheck,
      title: 'Private & Secure',
      description: 'Your financial entries are encrypted under secure individual accounts, keeping your budget fully confidential.',
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden flex flex-col justify-between">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-xl text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            Velo<span className="text-brand-500 font-normal">Finance</span>
          </span>
        </div>

        <button
          onClick={() => navigate('/auth')}
          className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-white dark:bg-darkbg-900 text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-darkbg-800 shadow-sm transition-all"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-24 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200/40 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Track Money Effortlessly
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-800 dark:text-white">
            Your pocket money, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-violet-500">
              beautifully tracked.
            </span>
          </h2>

          <p className="text-md text-slate-500 dark:text-zinc-400 max-w-lg font-medium leading-relaxed">
            Stop losing track of your daily spendings. VeloFinance is a clean, minimal personal ledger designed for students and individuals to monitor starting cash, income injections, and expenses.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => navigate('/auth')}
              className="px-7 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 flex items-center gap-2 group transition-all"
            >
              Get Started Free <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
        >
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="glass-panel bg-white/50 dark:bg-darkbg-900/50 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 shadow-premium"
              >
                <div className={`p-3 rounded-xl w-fit ${feat.color} mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-md text-slate-800 dark:text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-200/30 dark:border-zinc-800/30 text-center relative z-10">
        <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
          © {new Date().getFullYear()} VeloFinance. Build with React, Node.js & MongoDB.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
