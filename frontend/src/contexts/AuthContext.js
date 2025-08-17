import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  // Set up axios interceptor for token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const checkAuth = useCallback(async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        // Token invalid, clear it
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token invalid, clear it
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('authToken', newToken);
        return { success: true, user: userData };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      
      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('authToken', newToken);
        return { success: true, user: newUser };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    
    // Call logout endpoint
    axios.post('/auth/logout').catch(err => {
      console.error('Logout request failed:', err);
    });
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/user/profile', profileData);
      
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      return { success: false, message };
    }
  };

  const uploadProfileImage = async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await axios.post('/user/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user, imagePath: response.data.imagePath };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Image upload failed';
      return { success: false, message };
    }
  };

  const deleteProfileImage = async () => {
    try {
      const response = await axios.delete('/user/profile/image');
      
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Image deletion failed';
      return { success: false, message };
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await axios.delete('/user/account');
      
      if (response.data.success) {
        logout();
        return { success: true };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Account deletion failed';
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    uploadProfileImage,
    deleteProfileImage,
    deleteAccount,
    isAuthenticated: !!user,
    isProfileComplete: user?.isProfileComplete || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
