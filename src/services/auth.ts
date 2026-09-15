import type { User, Address } from '../types.js';

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

type AuthListener = (user: User | null) => void;
const listeners: Set<AuthListener> = new Set();

function getUsersDB(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      const initial = [DEFAULT_DEMO_USER];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as User[];
  } catch {
    return [DEFAULT_DEMO_USER];
  }
}

function saveUsersDB(users: User[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users database:', err);
  }
}

export function getCurrentUser(): User | null {
  try {
    const currentUserId = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!currentUserId) return null;
    const users = getUsersDB();
    return users.find(u => u.id === currentUserId) || null;
  } catch {
    return null;
  }
}

export function subscribeAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  listener(getCurrentUser());
  return () => listeners.delete(listener);
}

function notifyAuthChange(user: User | null): void {
  listeners.forEach(fn => fn(user));
}

export function login(email: string, password?: string): { success: boolean; message: string; user?: User } {
  const users = getUsersDB();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return { success: false, message: 'No account found with this email address.' };
  }

  if (password && user.password && user.password !== password) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }

  localStorage.setItem(CURRENT_USER_STORAGE_KEY, user.id);
  notifyAuthChange(user);
  return { success: true, message: `Welcome back, ${user.name}!`, user };
}

export function signup(name: string, email: string, password?: string): { success: boolean; message: string; user?: User } {
  const users = getUsersDB();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, message: 'An account with this email already exists. Please log in.' };
  }

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' });
  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    email: normalizedEmail,
    password: password || 'password123',
    phone: '+91 98765 00000',
    memberTier: 'Member',
    joinedDate: `${monthName} ${now.getFullYear()}`,
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
  notifyAuthChange(newUser);
  return { success: true, message: `Welcome to ShopCart, ${newUser.name}!`, user: newUser };
}

export function logout(): void {
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  notifyAuthChange(null);
}

export function updateUserProfile(updates: Partial<User>): boolean {
  const current = getCurrentUser();
  if (!current) return false;

  const users = getUsersDB();
  const index = users.findIndex(u => u.id === current.id);
  if (index === -1) return false;

  const updated: User = {
    ...users[index],
    ...updates,
    id: current.id // Ensure ID remains immutable
  };

  users[index] = updated;
  saveUsersDB(users);
  notifyAuthChange(updated);
  return true;
}

export function saveUserAddress(address: Omit<Address, 'id'>, editId?: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;

  let addresses = [...user.addresses];
  if (address.isDefault) {
    addresses = addresses.map(a => ({ ...a, isDefault: false }));
  }

  if (editId) {
    addresses = addresses.map(a => (a.id === editId ? { ...address, id: editId } : a));
  } else {
    addresses.push({
      ...address,
      id: `addr_${Date.now()}`
    });
  }

  return updateUserProfile({ addresses });
}
