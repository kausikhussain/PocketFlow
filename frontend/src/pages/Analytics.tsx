import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart, Info } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, BarChart as ReBarChart, Bar, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const COLORS = [
  '#3b82f6', // Brand Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#6b7280'  // Slate Gray
];

const Analytics: React.FC = () => {
  const { getCurrencySymbol } = useAuth();
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Grouped data states
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await api.get('/transactions');
        const list = res.data;
        setTransactions(list);
        processAnalytics(list);
      } catch (err) {
        console.error('Failed to fetch transactions for charts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const processAnalytics = (list: any[]) => {
    // 1. Group by category for pie chart (expenses only)
    const categoryMap: { [key: string]: number } = {};
    let spentSum = 0;

    const expenses = list.filter((t) => t.type === 'expense');
    expenses.forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      spentSum += t.amount;
    });

    const pieFormatted = Object.keys(categoryMap).map((key) => ({
      name: key,
      value: categoryMap[key],
      percentage: spentSum > 0 ? ((categoryMap[key] / spentSum) * 100).toFixed(0) : '0',
    })).sort((a, b) => b.value - a.value);

    setCategoryData(pieFormatted);

    // 2. Group by date for trend Area chart (chronological order)
    const trendMap: { [key: string]: { date: string; income: number; expense: number } } = {};
    
    // Sort chronological first
    const chronoList = [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    chronoList.forEach((t) => {
      const dateStr = new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!trendMap[dateStr]) {
        trendMap[dateStr] = { date: dateStr, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        trendMap[dateStr].income += t.amount;
      } else {
        trendMap[dateStr].expense += t.amount;
      }
    });

    const trendFormatted = Object.values(trendMap);
    setTrendData(trendFormatted);

    // 3. Group by month for Bar chart comparison
    const monthMap: { [key: string]: { name: string; income: number; expense: number } } = {};
    chronoList.forEach((t) => {
      const dateObj = new Date(t.date);
      const key = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
      const name = dateObj.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      
      if (!monthMap[key]) {
        monthMap[key] = { name, income: 0, expense: 0 };
      }
      
      if (t.type === 'income') {
        monthMap[key].income += t.amount;
      } else {
        monthMap[key].expense += t.amount;
      }
    });

    setBarData(Object.values(monthMap));
  };

  const formatVal = (val: number) => {
    return `${getCurrencySymbol()}${val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 font-semibold text-sm">
        Computing analytics and rendering visualizations...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-24 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-darkbg-900 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <Info className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
          No Analytics Data Available
        </h3>
        <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
          Log some income sources and expenses first, then we will automatically compute charts, spending distributions, and monthly trends for you.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
          Visual Analytics
        </h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
          Deep graphical breakdown of your inflows, outflows, and spending distribution.
        </p>
      </div>

      {/* Main Row: Time-series Trend Area Chart */}
      <div className="glass-panel bg-white/50 dark:bg-darkbg-900/50 p-6 rounded-3xl border border-slate-200/50 dark:border-zinc-800/50 shadow-premium">
        <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 text-sm">
          <TrendingUp className="h-5 w-5 text-brand-500" /> Income vs Spending Flow
        </h3>
        <div className="h-80 w-full text-xs font-semibold">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.06)" />
              <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} />
              <Tooltip formatter={(value: any) => [`${getCurrencySymbol()}${value}`, '']} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" name="Spending" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Category Pie chart & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut chart for spending */}
        <div className="glass-panel bg-white/50 dark:bg-darkbg-900/50 p-6 rounded-3xl border border-slate-200/50 dark:border-zinc-800/50 shadow-premium flex flex-col justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-sm">
            <PieChart className="h-5 w-5 text-brand-500" /> Category Breakdown
          </h3>

          {categoryData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-semibold">
              No expenses recorded yet to show category breakdown.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Pie container */}
              <div className="h-52 w-52 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${getCurrencySymbol()}${value}`, '']} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends list */}
              <div className="flex-1 space-y-2">
                {categoryData.slice(0, 4).map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-md shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-slate-650 dark:text-zinc-300 truncate max-w-[120px]">{entry.name}</span>
                    </div>
                    <span className="text-slate-450 dark:text-zinc-550 text-slate-450 font-bold">
                      {entry.percentage}%
                    </span>
                  </div>
                ))}
                {categoryData.length > 4 && (
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold pl-5">
                    + {categoryData.length - 4} other categories
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Category Leaderboard list */}
        <div className="glass-panel bg-white/50 dark:bg-darkbg-900/50 p-6 rounded-3xl border border-slate-200/50 dark:border-zinc-800/50 shadow-premium">
          <h3 className="font-bold text-slate-800 dark:text-white mb-5 text-sm">
            Spending Leaderboard
          </h3>

          {categoryData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-semibold">
              No category allocations.
            </div>
          ) : (
            <div className="space-y-4">
              {categoryData.map((item, index) => {
                const barColor = COLORS[index % COLORS.length];
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-zinc-200">{item.name}</span>
                      <span className="text-slate-800 dark:text-white font-bold">
                        {formatVal(item.value)}
                        <span className="text-[10px] text-slate-400 font-semibold ml-1.5">
                          ({item.percentage}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-darkbg-850 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.percentage}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Monthly Comparisons Bar chart */}
      {barData.length > 1 && (
        <div className="glass-panel bg-white/50 dark:bg-darkbg-900/50 p-6 rounded-3xl border border-slate-200/50 dark:border-zinc-800/50 shadow-premium">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 text-sm">
            <BarChart3 className="h-5 w-5 text-brand-500" /> Monthly Comparisons
          </h3>
          <div className="h-72 w-full text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.06)" />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} />
                <Tooltip formatter={(value: any) => [`${getCurrencySymbol()}${value}`, '']} />
                <Legend />
                <Bar dataKey="income" name="Total Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Total Outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
