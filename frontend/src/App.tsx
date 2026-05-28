import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Authentication Guard Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg-950 text-slate-800 dark:text-white font-semibold">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          <span className="text-xs">Authenticating VeloFinance session...</span>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Layout wrapper to inject sidebar paddings and handle mobile spaces
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const location = useLocation();

  const isPublicPage = ['/', '/auth'].includes(location.pathname);

  // If public or not logged in, render without Nav wrapper
  if (isPublicPage || !token) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-darkbg-950 transition-colors duration-300">
      <Navbar />
      {/* Scrollable Container with responsive paddings */}
      <main className="flex-1 min-h-screen overflow-y-auto px-4 md:px-8 pt-20 md:pt-8 pb-20 md:pb-8 md:pl-72">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
