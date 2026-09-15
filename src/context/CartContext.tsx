import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { CartItem, Product, Order } from '../types.js';
import { loadCartFromStorage, saveCartToStorage } from '../services/storage.js';
import { createOrderFromCart } from '../services/orders.js';

interface CartSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  freeShippingProgress: number;
  freeShippingRemaining: number;
  totalCount: number;
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  discountRate: number;
  applyPromo: (code: string) => { success: boolean; message: string };
  checkout: (customAddress?: string, paymentId?: string, paymentMethod?: string) => { success: boolean; order?: Order; message: string };
  summary: CartSummary;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => loadCartFromStorage());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountRate, setDiscountRate] = useState(0);

  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity
          }
        ];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((item) => item.id !== productId);
      }
      return prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQty } : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
    setDiscountRate(0);
  };

  const applyPromo = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'SUMMER20' || cleanCode === 'SAVE20') {
      setDiscountRate(0.20);
      return { success: true, message: '🎉 Promo code applied! Extra 20% off.' };
    }
    return { success: false, message: '⚠️ Invalid promo code. Try "SUMMER20".' };
  };

  const summary = useMemo<CartSummary>(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const shipping = subtotal >= 499 || subtotal === 0 ? 0 : 49;
    const discount = subtotal * discountRate;
    const total = Math.max(0, subtotal - discount + shipping);
    const freeShippingProgress = Math.min(100, (subtotal / 499) * 100);
    const freeShippingRemaining = Math.max(0, 499 - subtotal);

    return {
      subtotal,
      shipping,
      discount,
      total,
      freeShippingProgress,
      freeShippingRemaining,
      totalCount
    };
  }, [cart, discountRate]);

  const checkout = (customAddress?: string, paymentId?: string, paymentMethod?: string) => {
    if (cart.length === 0) {
      return { success: false, message: 'Your cart is empty.' };
    }

    const order = createOrderFromCart(
      cart,
      summary.subtotal,
      summary.shipping,
      summary.discount,
      summary.total,
      customAddress,
      paymentId,
      paymentMethod
    );

    clearCart();
    closeCart();
    return {
      success: true,
      order,
      message: `Order #${order.id} placed successfully!`
    };
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        discountRate,
        applyPromo,
        checkout,
        summary
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
