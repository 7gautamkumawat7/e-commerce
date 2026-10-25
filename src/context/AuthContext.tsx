import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Address, AuthMode } from '../types.js';
import {
  getCurrentUser,
  subscribeAuth,
  login as authServiceLogin,
  signup as authServiceSignup,
  sendOtp as authServiceSendOtp,
  verifyOtp as authServiceVerifyOtp,
  logout as authServiceLogout,
  updateProfile as authServiceUpdateProfile,
  saveAddress as authServiceSaveAddress,
  deleteAddress as authServiceDeleteAddress
} from '../services/auth.js';

interface AuthContextType {
  currentUser: User | null;
  isAuthOpen: boolean;
  authMode: AuthMode;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
  switchAuthMode: (mode: AuthMode) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string; user?: User }>;
  signup: (name: string, email: string, password?: string, phone?: string) => Promise<{ success: boolean; message: string; user?: User }>;
  sendOtp: (email: string) => Promise<{ success: boolean; message: string; expiresInSeconds?: number; devOtp?: string }>;
  verifyOtp: (email: string, otp: string, name?: string) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  saveAddress: (address: Omit<Address, 'id'>, editId?: string) => Promise<boolean>;
  deleteAddress: (addressId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  useEffect(() => {
    const unsubscribe = subscribeAuth((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const openAuthModal = (mode: AuthMode = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthOpen(false);
  };

  const switchAuthMode = (mode: AuthMode) => {
    setAuthMode(mode);
  };

  const login = async (email: string, password?: string) => {
    const result = await authServiceLogin(email, password);
    if (result.success) {
      closeAuthModal();
    }
    return result;
  };

  const signup = async (name: string, email: string, password?: string, phone?: string) => {
    const result = await authServiceSignup(name, email, password, phone);
    if (result.success) {
      closeAuthModal();
    }
    return result;
  };

  const sendOtp = async (email: string) => {
    return await authServiceSendOtp(email);
  };

  const verifyOtp = async (email: string, otp: string, name?: string) => {
    const result = await authServiceVerifyOtp(email, otp, name);
    if (result.success) {
      closeAuthModal();
    }
    return result;
  };

  const logout = () => {
    authServiceLogout();
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    return await authServiceUpdateProfile(updates);
  };

  const saveAddress = async (address: Omit<Address, 'id'>, editId?: string): Promise<boolean> => {
    return await authServiceSaveAddress(address, editId);
  };

  const deleteAddress = async (addressId: string): Promise<boolean> => {
    return await authServiceDeleteAddress(addressId);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
        switchAuthMode,
        login,
        signup,
        sendOtp,
        verifyOtp,
        logout,
        updateProfile,
        saveAddress,
        deleteAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
