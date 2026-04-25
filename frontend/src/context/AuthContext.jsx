import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Create axios instance
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'https://orvexia-backend.vercel.app') + '/api/v1/users',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Mock user for bypass
  const mockUser = {
    id: 'mock-123',
    name: 'Demo User',
    email: 'demo@orvexia.com',
    role: 'admin'
  };

  const [user, setUser] = useState(mockUser); // Default to mockUser
  const [loading, setLoading] = useState(false); // No loading needed for bypass

  const fetchUser = async () => {
    // Bypassed for now
    setUser(mockUser);
    setLoading(false);

    /* Original fetch logic kept for future activation
    try {
      const response = await api.get('/get-profile');
      if (response.data && response.data.status) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Fetch user error:", error);
      }
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
    */
  };

  // useEffect(() => {
  //   fetchUser();
  // }, []);

  const login = async (email, password) => {
    // Mock login success
    setUser(mockUser);
    return { status: true, user: mockUser };

    /* Original login logic
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.status) {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        await fetchUser();
        return response.data;
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      console.error("Login error:", error);
      throw error.response?.data || error;
    }
    */
  };

  const signup = async (name, email, password) => {
    // Mock signup success
    setUser(mockUser);
    return { status: true, user: mockUser };

    /* Original signup logic
    try {
      const response = await api.post('/register', { name, email, password });
      if (response.data.status) {
        await login(email, password);
        return response.data;
      }
      throw new Error(response.data.message || 'Signup failed');
    } catch (error) {
      console.error("Signup error:", error);
      throw error.response?.data || error;
    }
    */
  };

  const logout = async () => {
    // Mock logout - for bypass we might just want to keep the session or just clear user
    setUser(null);

    /* Original logout logic
    try {
      await api.post('/logout');
      setUser(null);
      localStorage.removeItem('token');
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      localStorage.removeItem('token');
    }
    */
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};