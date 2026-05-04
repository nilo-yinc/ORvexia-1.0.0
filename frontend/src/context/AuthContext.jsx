import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000');
const AUTH_USER_KEY = 'authUser';
const REQUEST_TIMEOUT_MS = 8000;

// Axios instance for user routes (login, register, profile)
const api = axios.create({
  baseURL: API_BASE + '/api/v1/users',
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

// Add JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const isGuest = localStorage.getItem('guestMode');
    if (isGuest) {
      return { id: 'guest', name: 'Guest User', email: 'guest@orvexia.local', role: 'guest' };
    }

    const token = localStorage.getItem('token');
    const cachedUser = localStorage.getItem(AUTH_USER_KEY);
    if (token && cachedUser) {
      try {
        return JSON.parse(cachedUser);
      } catch {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }

    return null;
  });
  const [loading, setLoading] = useState(true);

  // On mount: check if the user has an active session (JWT or OAuth session)
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const isGuest = localStorage.getItem('guestMode');

    if (isGuest) {
      setUser({ id: 'guest', name: 'Guest User', email: 'guest@orvexia.local', role: 'guest' });
      setLoading(false);
      return;
    }

    if (!token) {
      setUser(null);
      localStorage.removeItem(AUTH_USER_KEY);
      setLoading(false);
      return;
    }

    const cachedUser = localStorage.getItem(AUTH_USER_KEY);
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch {
        localStorage.removeItem(AUTH_USER_KEY);
      }
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.get('/get-profile');
      if (response.data && response.data.status) {
        setUser(response.data.user);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.data.user));
        setLoading(false);
        return;
      }
    } catch (error) {
      const status = error.response?.status;
      if (!cachedUser || status === 401 || status === 403) {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }

    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.status) {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        setUser({
          ...response.data.user,
          avatar: response.data.user.avatar || null,
        });
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify({
          ...response.data.user,
          avatar: response.data.user.avatar || null,
        }));
        return response.data;
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(msg);
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await api.post('/register', { name, email, password });
      if (response.data.status) {
        // Auto-login after signup
        await login(email, password);
        return response.data;
      }
      throw new Error(response.data.message || 'Signup failed');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Signup failed';
      throw new Error(msg);
    }
  };

  const loginAsGuest = () => {
    localStorage.setItem('guestMode', 'true');
    localStorage.removeItem('token');
    localStorage.removeItem(AUTH_USER_KEY);
    setUser({ id: 'guest', name: 'Guest User', email: 'guest@orvexia.local', role: 'guest' });
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/logout');
      }
    } catch {
      // Ignore errors during logout
    }
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('guestMode');
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const updateProfile = async (name, avatar) => {
    try {
      const response = await api.post('/update-profile', { name, avatar });
      if (response.data.status) {
        setUser(prev => ({
          ...prev,
          ...response.data.user,
          avatar: response.data.user.avatar || null,
        }));
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify({
          ...user,
          ...response.data.user,
          avatar: response.data.user.avatar || null,
        }));
        return response.data;
      }
      throw new Error(response.data.message || 'Update failed');
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Update failed');
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ ...user, ...updatedUser }));
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    loginAsGuest,
    updateProfile,
    updateUserProfile,
    isAuthenticated: !!user,
    isGuest: user?.role === 'guest',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
