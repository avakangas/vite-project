// contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserProfile } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          // Verify token by getting current user profile
          const currentUser = await getUserProfile();
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        // Clear invalid tokens
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setError('Session expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    setUser,
    loading,
    error,
    setError,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};