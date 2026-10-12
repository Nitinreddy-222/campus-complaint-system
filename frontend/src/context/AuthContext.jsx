import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { complaintService } from '../services/complaintService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Load user from storage and check validity
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = authService.getCurrentUser();

      if (storedToken && storedUser) {
        setUser(storedUser);
        try {
          // Fetch fresh profile
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser({ ...storedUser, ...res.data });
            localStorage.setItem('user', JSON.stringify({ ...storedUser, ...res.data }));
          }
          // Fetch notifications count
          fetchUnreadCount();
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await complaintService.getNotifications();
      if (res.success && res.data) {
        setUnreadNotifications(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Ignore background notification check errors
    }
  };

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.data);
    fetchUnreadCount();
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.data);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setUnreadNotifications(0);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        unreadNotifications,
        fetchUnreadCount,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
