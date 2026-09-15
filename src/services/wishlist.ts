import { loadWishlistFromStorage, saveWishlistToStorage } from './storage.js';

type WishlistListener = (items: string[]) => void;
const listeners: Set<WishlistListener> = new Set();

let wishlist: string[] = loadWishlistFromStorage();

export function getWishlist(): string[] {
  return [...wishlist];
}

export function subscribeWishlist(listener: WishlistListener): () => void {
  listeners.add(listener);
  listener(wishlist);
  return () => listeners.delete(listener);
}

function notifyWishlist(): void {
  listeners.forEach(fn => fn(wishlist));
}

export function toggleWishlist(productId: string): boolean {
  const index = wishlist.indexOf(productId);
  let isAdded = false;

  if (index > -1) {
    wishlist.splice(index, 1);
    isAdded = false;
  } else {
    wishlist.push(productId);
    isAdded = true;
  }

  saveWishlistToStorage(wishlist);
  notifyWishlist();
  return isAdded;
}

export function isInWishlist(productId: string): boolean {
  return wishlist.includes(productId);
}
