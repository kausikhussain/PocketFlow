import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, BarChart3, Settings, LogOut, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });


  // Apply dark mode theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transactions', icon: ReceiptText },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-20 glass-panel border-r border-slate-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-darkbg-900/70 p-6 transition-all duration-300">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2.5 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-xl text-white shadow-md shadow-brand-500/25">
            <Sparkles className="h-5 w-5 animate-pulse-gentle" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white font-sans">
              Velo<span className="text-brand-500 font-normal">Finance</span>
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-semibold">Personal Tracker</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-darkbg-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User profile details & toggles */}
        <div className="pt-6 border-t border-slate-200/50 dark:border-zinc-800/50 space-y-4">
          {/* User info */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white font-bold uppercase shadow-sm">
              {user?.name.charAt(0)}
            </div>
            <div className="truncate">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.name}</h4>
              <p className="text-xs text-slate-400 dark:text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="flex-1 flex items-center justify-center p-3 rounded-xl border border-slate-200/50 dark:border-zinc-800/50 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-darkbg-800 transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center p-3 rounded-xl border border-rose-200/30 dark:border-rose-900/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden fixed top-0 inset-x-0 h-16 glass-panel border-b border-slate-200/40 dark:border-zinc-800/40 bg-white/70 dark:bg-darkbg-900/70 z-30 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-lg text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-800 dark:text-white text-md">VeloFinance</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-darkbg-800"
          >
            {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
          
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 glass-panel border-t border-slate-200/40 dark:border-zinc-800/40 bg-white/80 dark:bg-darkbg-900/80 z-30 px-4 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-brand-500 scale-110 font-bold'
                    : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600'
                }`
              }
            >
              <Icon className="h-5.5 w-5.5" />
              <span className="text-[9px] mt-0.5 font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default Navbar;
