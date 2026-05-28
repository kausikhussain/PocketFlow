import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  currency: string;
  initialBalance: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, currency: string, initialBalance: number) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, currency: string, initialBalance: number) => Promise<void>;
  clearError: () => void;
  getCurrencySymbol: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('velo_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data on startup if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err: any) {
        console.error('Failed to load user profile', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Login handler
  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('velo_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Registration handler
  const register = async (
    name: string,
    email: string,
    password: string,
    currency: string,
    initialBalance: number
  ) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        currency,
        initialBalance,
      });
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('velo_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('velo_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Profile update handler
  const updateProfile = async (name: string, currency: string, initialBalance: number) => {
    setError(null);
    try {
      const res = await api.put('/auth/profile', { name, currency, initialBalance });
      setUser(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile settings.');
      throw err;
    }
  };

  // Helper to convert currency code to symbol
  const getCurrencySymbol = () => {
    if (!user) return '₹';
    switch (user.currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      case 'JPY': return '¥';
      default: return '₹';
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        clearError,
        getCurrencySymbol,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
