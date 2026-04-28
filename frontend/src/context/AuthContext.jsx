import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000');

// Axios instance for user routes (login, register, profile)
const api = axios.create({
  baseURL: API_BASE + '/api/v1/users',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Axios instance for auth/session routes (Google/GitHub OAuth, /me)
const authApi = axios.create({
  baseURL: API_BASE + '/api/v1/auth',
  withCredentials: true,
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check if the user has an active session (JWT or OAuth session)
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      // First try JWT-based auth (manual login)
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/get-profile');
        if (response.data && response.data.status) {
          setUser(response.data.user);
          setLoading(false);
          return;
        }
      }

      // Then try session-based auth (Google/GitHub OAuth)
      const sessionRes = await authApi.get('/me');
      if (sessionRes.data && sessionRes.data.success) {
        const u = sessionRes.data.user;
        setUser({
          id: u._id,
          name: u.name,
          email: u.email,
          avatar: u.avatar || null,
          role: u.role || 'user',
          provider: u.googleId ? 'google' : u.githubId ? 'github' : 'local',
        });
        setLoading(false);
        return;
      }
    } catch (error) {
      // Not authenticated - that's fine
    }
    
    // Check if guest mode
    const isGuest = localStorage.getItem('guestMode');
    if (isGuest) {
      setUser({ id: 'guest', name: 'Guest User', email: 'guest@orvexia.local', role: 'guest' });
    } else {
      setUser(null);
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
    setUser({ id: 'guest', name: 'Guest User', email: 'guest@orvexia.local', role: 'guest' });
  };

  const logout = async () => {
    try {
      // Try JWT logout
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/logout');
      }
      // Try session logout (for OAuth users)
      await authApi.post('/logout');
    } catch (error) {
      // Ignore errors during logout
    }
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('guestMode');
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
        return response.data;
      }
      throw new Error(response.data.message || 'Update failed');
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Update failed');
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
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
