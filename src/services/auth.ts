import type { User, Address } from '../types.js';
import { authApi } from './api.js';

type AuthListener = (user: User | null) => void;
const listeners: Set<AuthListener> = new Set();
let inMemoryUser: User | null = null;
let isInitialized = false;

function notifyAuthChange(user: User | null): void {
  inMemoryUser = user;
  listeners.forEach((fn) => fn(user));
}

function mapApiUserToFrontendUser(data: any): User {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    avatar: data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || 'User')}`,
    memberTier: data.memberTier || data.member_tier || 'Member',
    isVerified: Boolean(data.isVerified),
    joinedDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently',
    addresses: (data.addresses || []).map((addr: any) => ({
      id: addr.id,
      title: addr.title || 'Address',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      zipCode: addr.zipCode || addr.zip_code || '',
      country: addr.country || 'India',
      isDefault: Boolean(addr.isDefault ?? addr.is_default)
    })),
    loginHistory: data.loginHistory || []
  };
}

/**
 * Initializes and synchronizes current user session with backend /api/auth/me via HTTP-only JWT cookies.
 * Does NOT set any mock dummy user.
 */
export async function initAuth(): Promise<User | null> {
  if (isInitialized) return inMemoryUser;

  try {
    const data: any = await authApi.getMe();
    if (data && data.id) {
      const user = mapApiUserToFrontendUser(data);
      notifyAuthChange(user);
      isInitialized = true;
      return user;
    }
  } catch {
    // Unauthenticated: clean state with null user
  }

  isInitialized = true;
  notifyAuthChange(null);
  return null;
}

export function getCurrentUser(): User | null {
  return inMemoryUser;
}

export function subscribeAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  listener(inMemoryUser);
  if (!isInitialized) {
    initAuth();
  }
  return () => listeners.delete(listener);
}

export async function login(
  email: string,
  password?: string
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    if (!password) {
      return { success: false, message: 'Password is required to sign in.' };
    }
    const result: any = await authApi.login({ email, password });
    const user = mapApiUserToFrontendUser(result.user);
    notifyAuthChange(user);
    return { success: true, message: `Welcome back, ${user.name}!`, user };
  } catch (err: any) {
    return { success: false, message: err.message || 'Login failed. Please check credentials.' };
  }
}

export async function signup(
  name: string,
  email: string,
  password?: string,
  phone?: string
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    if (!password) {
      return { success: false, message: 'Password is required to create an account.' };
    }
    const result: any = await authApi.register({
      name,
      email,
      password,
      phone
    });
    const user = mapApiUserToFrontendUser(result.user);
    notifyAuthChange(user);
    return { success: true, message: `Welcome to ShopCart, ${user.name}!`, user };
  } catch (err: any) {
    return { success: false, message: err.message || 'Registration failed.' };
  }
}

/**
 * Dispatches a 6-digit cryptographic OTP stored in Redis with 5-minute TTL.
 */
export async function sendOtp(email: string): Promise<{ success: boolean; message: string; expiresInSeconds?: number; devOtp?: string }> {
  try {
    const result = await authApi.sendOtp(email);
    return {
      success: true,
      message: `A 6-digit verification code was sent to ${email} (valid for 5 minutes).`,
      expiresInSeconds: result.expiresInSeconds,
      devOtp: result.devOtp
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to send verification code.' };
  }
}

/**
 * Verifies submitted OTP against Redis, completes JWT authentication, and syncs session with MongoDB.
 */
export async function verifyOtp(
  email: string,
  otp: string,
  name?: string
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const result = await authApi.verifyOtp({ email, otp, name });
    const user = mapApiUserToFrontendUser(result.user);
    notifyAuthChange(user);
    return { success: true, message: `Verified! Welcome, ${user.name}!`, user };
  } catch (err: any) {
    return { success: false, message: err.message || 'Invalid or expired verification code.' };
  }
}

export async function logout(): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    // Ignore error
  }
  notifyAuthChange(null);
}

export async function updateProfile(updates: Partial<User>): Promise<boolean> {
  if (!inMemoryUser) return false;

  try {
    const updated: any = await authApi.updateProfile({
      name: updates.name,
      phone: updates.phone,
      avatar: updates.avatar
    });

    inMemoryUser = {
      ...inMemoryUser,
      name: updated.name || inMemoryUser.name,
      phone: updated.phone || inMemoryUser.phone,
      avatar: updated.avatar || inMemoryUser.avatar
    };
    notifyAuthChange(inMemoryUser);
    return true;
  } catch {
    return false;
  }
}

export async function saveAddress(address: Omit<Address, 'id'>, _editId?: string): Promise<boolean> {
  if (!inMemoryUser) return false;

  try {
    const newAddr: any = await authApi.addAddress({
      title: address.title,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country || 'India',
      isDefault: address.isDefault || false
    });

    const addresses = inMemoryUser.addresses.filter((a) => a.id !== newAddr.id);
    addresses.push({
      id: newAddr.id,
      title: newAddr.title,
      street: newAddr.street,
      city: newAddr.city,
      state: newAddr.state,
      zipCode: newAddr.zipCode || newAddr.zip_code,
      country: newAddr.country,
      isDefault: newAddr.isDefault ?? newAddr.is_default
    });

    inMemoryUser = { ...inMemoryUser, addresses };
    notifyAuthChange(inMemoryUser);
    return true;
  } catch {
    return false;
  }
}

export async function deleteAddress(addressId: string): Promise<boolean> {
  if (!inMemoryUser) return false;

  try {
    await authApi.deleteAddress(addressId);
    const addresses = inMemoryUser.addresses.filter((a) => a.id !== addressId);
    inMemoryUser = { ...inMemoryUser, addresses };
    notifyAuthChange(inMemoryUser);
    return true;
  } catch {
    return false;
  }
}
