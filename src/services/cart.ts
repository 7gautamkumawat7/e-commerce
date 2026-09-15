import type { CartItem, Product, Order } from '../types.js';
import { loadCartFromStorage, saveCartToStorage } from './storage.js';
import { createOrderFromCart } from './orders.js';

type CartListener = (items: CartItem[]) => void;
const listeners: Set<CartListener> = new Set();

let cart: CartItem[] = loadCartFromStorage();

export function getCart(): CartItem[] {
  return [...cart];
}

export function subscribeCart(listener: CartListener): () => void {
  listeners.add(listener);
  listener(cart);
  return () => listeners.delete(listener);
}

function notifyCart(): void {
  saveCartToStorage(cart);
  listeners.forEach(fn => fn(cart));
}

export function addToCart(product: Product, quantity: number = 1): void {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
  }
  notifyCart();
}

export function removeFromCart(productId: string): void {
  cart = cart.filter(item => item.id !== productId);
  notifyCart();
}

export function updateCartQuantity(productId: string, delta: number): void {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  notifyCart();
}

export function clearCart(): void {
  cart = [];
  notifyCart();
}

export function getCartSummary(discountRate: number = 0): {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  freeShippingProgress: number;
  freeShippingRemaining: number;
  totalCount: number;
} {
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
}

export function processCheckout(discountRate: number = 0, address?: string): { success: boolean; order?: Order; message: string } {
  if (cart.length === 0) {
    return { success: false, message: 'Your cart is empty.' };
  }

  const summary = getCartSummary(discountRate);
  const order = createOrderFromCart(
    cart,
    summary.subtotal,
    summary.shipping,
    summary.discount,
    summary.total,
    address
  );

  clearCart();
  return {
    success: true,
    order,
    message: `Order #${order.id} placed successfully!`
  };
}
