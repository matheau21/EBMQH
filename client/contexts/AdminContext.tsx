import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, checkBackendAvailability, getCurrentUser, setCurrentUser, removeCurrentUser, User } from '@/lib/api';

interface AdminContextType {
  isAdminMode: boolean;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = getCurrentUser();
        if (savedUser) {
          // Check if backend is available
          const backendAvailable = await checkBackendAvailability();

          if (backendAvailable) {
            // Verify the user is still valid by fetching current profile
            const response = await authAPI.getProfile();
            setUser(response.user);
            setCurrentUser(response.user);
          } else {
            // Backend not available, use saved user data
            console.log('Backend not available, using cached user data');
            setUser(savedUser);
          }
        }
      } catch (error) {
        console.log('Auth initialization failed, clearing user data');
        // Token might be expired or backend unavailable, clear it
        removeCurrentUser();
        authAPI.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Check if backend is available
      const backendAvailable = await checkBackendAvailability();

      if (backendAvailable) {
        const response = await authAPI.login(email, password);
        setUser(response.user);
        setCurrentUser(response.user);
      } else {
        // Demo login for when backend is not available
        if (email === 'admin@ebmquickhits.com' && password === 'admin123') {
          const demoUser = {
            id: 'demo-admin',
            email: 'admin@ebmquickhits.com',
            username: 'admin',
            firstName: 'Demo',
            lastName: 'Admin',
            userType: 'ADMIN' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setUser(demoUser);
          setCurrentUser(demoUser);
        } else {
          throw new Error('Invalid credentials');
        }
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    authAPI.logout();
  };

  const refreshProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.user);
      setCurrentUser(response.user);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      logout();
    }
  };

  const value = {
    isAdminMode: user?.userType === 'ADMIN',
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshProfile,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
