import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'customer' | 'driver' | null;

interface AuthContextType {
  userRole: UserRole;
  userId: string | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRoleState] = useState<UserRole>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user role from AsyncStorage on app start
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('userRole');
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedRole) {
          setUserRoleState(storedRole as UserRole);
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Failed to load user role:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserRole();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      // TODO: Call backend API to authenticate user
      // For now, just store the role locally
      const mockUserId = `${role}_${Date.now()}`;
      await AsyncStorage.setItem('userRole', role || '');
      await AsyncStorage.setItem('userId', mockUserId);
      setUserRoleState(role);
      setUserId(mockUserId);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userId');
      setUserRoleState(null);
      setUserId(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const setUserRole = async (role: UserRole) => {
    try {
      if (role) {
        await AsyncStorage.setItem('userRole', role);
      } else {
        await AsyncStorage.removeItem('userRole');
      }
      setUserRoleState(role);
    } catch (error) {
      console.error('Failed to set user role:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ userRole, userId, isLoading, login, logout, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
