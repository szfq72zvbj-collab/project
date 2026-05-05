import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (pb.authStore.isValid) {
        try {
          const user = await pb.getCurrentUser();
          setCurrentUser(user);
        } catch (error) {
          console.error('Failed to load user:', error);
          pb.authStore.clear();
        }
      }
      setInitialLoading(false);
    };
    
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const user = await pb.authWithPassword(email, password);
      setCurrentUser(user);
      return { success: true, record: user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (name, email, phone, password) => {
    // For now, we'll create a mock user since the API doesn't have signup
    // In a real app, you'd call an API endpoint to create a user
    const mockUser = {
      id: 'new_' + Date.now(),
      email,
      name,
      role: 'student',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      loginCount: 1,
      isOnline: true
    };
    
    // Auto-login after signup
    const mockToken = 'mock_jwt_token_' + Date.now();
    pb.authStore.save(mockToken, mockUser);
    setCurrentUser(mockUser);
    
    return { success: true, record: mockUser };
  };

  const logout = async () => {
    await pb.logout();
    setCurrentUser(null);
  };

  const requestPasswordReset = async (email) => {
    // Mock implementation
    console.log('Password reset requested for:', email);
    return { success: true };
  };

  const confirmPasswordReset = async (token, password) => {
    // Mock implementation
    console.log('Password reset confirmed');
    return { success: true };
  };

  const value = {
    currentUser,
    isAuthenticated: pb.authStore.isValid,
    login,
    signup,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    initialLoading,
    // Admin functions
    getAllUsers: pb.getAllUsers,
    getDashboard: pb.getDashboard,
    getSessions: pb.getSessions,
    getLoginHistory: pb.getLoginHistory,
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};