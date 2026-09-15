import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadWishlistFromStorage, saveWishlistToStorage } from '../services/storage.js';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>(() => loadWishlistFromStorage());

  useEffect(() => {
    saveWishlistToStorage(wishlist);
  }, [wishlist]);

  const toggleWishlist = (productId: string): boolean => {
    let isAdded = false;
    setWishlist((prev) => {
      const index = prev.indexOf(productId);
      if (index > -1) {
        isAdded = false;
        return prev.filter((id) => id !== productId);
      } else {
        isAdded = true;
        return [...prev, productId];
      }
    });
    return isAdded;
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
