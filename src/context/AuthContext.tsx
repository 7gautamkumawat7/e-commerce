import React, { createContext, useContext, useState } from 'react';
import type { User, Address, AuthMode } from '../types.js';

const USERS_STORAGE_KEY = 'shopcart_users_db';
const CURRENT_USER_STORAGE_KEY = 'shopcart_current_user_id';

const DEFAULT_DEMO_USER: User = {
  id: 'usr_demo_101',
  name: 'Alex Johnson',
  email: 'demo@shopcart.com',
  password: 'password123',
  phone: '+91 98765 43210',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  memberTier: 'Gold VIP',
  joinedDate: 'January 2024',
  addresses: [
    {
      id: 'addr_1',
      title: 'Home',
      street: 'Flat 402, Lotus Heights, Bandra West',
      city: 'Mumbai',
      state: 'MH',
      zipCode: '400050',
      country: 'India',
      isDefault: true
    },
    {
      id: 'addr_2',
      title: 'Work / Tech Park',
      street: 'Tower 4, Floor 7, Manyata Tech Park',
      city: 'Bengaluru',
      state: 'KA',
      zipCode: '560045',
      country: 'India',
      isDefault: false
    }
  ]
};

interface AuthContextType {
  currentUser: User | null;
  isAuthOpen: boolean;
  authMode: AuthMode;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
  switchAuthMode: (mode: AuthMode) => void;
  login: (email: string, password?: string) => { success: boolean; message: string; user?: User };
  signup: (name: string, email: string, password?: string) => { success: boolean; message: string; user?: User };
  logout: () => void;
  updateProfile: (updates: Partial<User>) => boolean;
  saveAddress: (address: Omit<Address, 'id'>, editId?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const currentId = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      let users: User[] = rawUsers ? JSON.parse(rawUsers) : [];
      if (users.length === 0) {
        users = [DEFAULT_DEMO_USER];
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }
      return users.find((u) => u.id === currentId) || null;
    } catch {
      return null;
    }
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const getUsersDB = (): User[] => {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [DEFAULT_DEMO_USER];
    } catch {
      return [DEFAULT_DEMO_USER];
    }
  };

  const saveUsersDB = (users: User[]) => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (err) {
      console.error('Failed to save users:', err);
    }
  };

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

  const login = (email: string, password?: string) => {
    const users = getUsersDB();
    const normalized = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === normalized);

    if (!user) {
      return { success: false, message: 'No account found with this email address.' };
    }

    if (password && user.password && user.password !== password) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    localStorage.setItem(CURRENT_USER_STORAGE_KEY, user.id);
    setCurrentUser(user);
    closeAuthModal();
    return { success: true, message: `Welcome back, ${user.name}!`, user };
  };

  const signup = (name: string, email: string, password?: string) => {
    const users = getUsersDB();
    const normalized = email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === normalized)) {
      return { success: false, message: 'An account with this email already exists. Please sign in.' };
    }

    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: normalized,
      password: password || 'password123',
      phone: '+91 98765 00000',
      memberTier: 'Member',
      joinedDate: `${month} ${now.getFullYear()}`,
      addresses: [
        {
          id: `addr_${Date.now()}`,
          title: 'Home',
          street: '123 MG Road',
          city: 'Mumbai',
          state: 'MH',
          zipCode: '400001',
          country: 'India',
          isDefault: true
        }
      ]
    };

    users.push(newUser);
    saveUsersDB(users);
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, newUser.id);
    setCurrentUser(newUser);
    closeAuthModal();
    return { success: true, message: `Welcome to ShopCart, ${newUser.name}!`, user: newUser };
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    setCurrentUser(null);
  };

  const updateProfile = (updates: Partial<User>): boolean => {
    if (!currentUser) return false;

    const users = getUsersDB();
    const index = users.findIndex((u) => u.id === currentUser.id);
    if (index === -1) return false;

    const updated: User = {
      ...users[index],
      ...updates,
      id: currentUser.id
    };

    users[index] = updated;
    saveUsersDB(users);
    setCurrentUser(updated);
    return true;
  };

  const saveAddress = (address: Omit<Address, 'id'>, editId?: string): boolean => {
    if (!currentUser) return false;

    let addresses = [...currentUser.addresses];
    if (address.isDefault) {
      addresses = addresses.map((a) => ({ ...a, isDefault: false }));
    }

    if (editId) {
      addresses = addresses.map((a) => (a.id === editId ? { ...address, id: editId } : a));
    } else {
      addresses.push({
        ...address,
        id: `addr_${Date.now()}`
      });
    }

    return updateProfile({ addresses });
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
        logout,
        updateProfile,
        saveAddress
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
};
