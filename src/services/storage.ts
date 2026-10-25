import type { CartItem } from '../types.js';

const CART_STORAGE_KEY = 'shopcart_items';
const WISHLIST_STORAGE_KEY = 'shopcart_wishlist';

export function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch (err) {
    console.error('Failed to parse cart items from localStorage:', err);
    return [];
  }
}

export function saveCartToStorage(cart: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (err) {
    console.error('Failed to save cart to localStorage:', err);
  }
}

export function loadWishlistFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return ['elec-1', 'elec-2', 'fash-2'];
    const parsed = JSON.parse(raw) as string[];
    return parsed.length > 0 ? parsed : ['elec-1', 'elec-2', 'fash-2'];
  } catch (err) {
    console.error('Failed to parse wishlist from localStorage:', err);
    return ['elec-1', 'elec-2', 'fash-2'];
  }
}

export function saveWishlistToStorage(wishlist: string[]): void {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  } catch (err) {
    console.error('Failed to save wishlist to localStorage:', err);
  }
}
