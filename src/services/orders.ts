import type { Order, CartItem } from '../types.js';
import { getCurrentUser } from './auth.js';

const ORDERS_STORAGE_KEY = 'shopcart_orders_db';

const SEED_ORDERS: Order[] = [
  {
    id: 'ORD-2025-9832',
    userId: 'usr_demo_101',
    date: 'Sep 10, 2025',
    status: 'Delivered',
    items: [
      {
        productId: 'elec-1',
        name: 'Active Noise-Canceling Wireless Over-Ear Headphones',
        price: 4999,
        quantity: 1,
        image: 'ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3361_ELECTR_train.jpeg'
      },
      {
        productId: 'beauty-1',
        name: 'Hyaluronic Acid Multi-Molecular Hydration Serum 50ml',
        price: 1299,
        quantity: 2,
        image: 'ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1088_BEAUTY_train.jpeg'
      }
    ],
    subtotal: 7597,
    shipping: 0,
    discount: 1519.40,
    total: 6077.60,
    trackingNumber: 'TRK-MH-88421094',
    shippingAddress: 'Flat 402, Lotus Heights, Bandra West, Mumbai, MH 400050'
  },
  {
    id: 'ORD-2025-8419',
    userId: 'usr_demo_101',
    date: 'Aug 24, 2025',
    status: 'Delivered',
    items: [
      {
        productId: 'fash-1',
        name: 'Minimalist Stainless Steel Mesh Chronograph Watch',
        price: 4999,
        quantity: 1,
        image: 'ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2290_CLOTHI_train.jpeg'
      }
    ],
    subtotal: 4999,
    shipping: 0,
    discount: 0,
    total: 4999,
    trackingNumber: 'TRK-DEL-33910842',
    shippingAddress: 'Flat 402, Lotus Heights, Bandra West, Mumbai, MH 400050'
  }
];

function getAllOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(SEED_ORDERS));
      return SEED_ORDERS;
    }
    return JSON.parse(raw) as Order[];
  } catch {
    return SEED_ORDERS;
  }
}

function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save orders:', err);
  }
}

export function getUserOrders(userId?: string): Order[] {
  const current = getCurrentUser();
  const targetId = userId || (current ? current.id : 'guest');
  const all = getAllOrders();
  return all.filter(o => o.userId === targetId);
}

export function createOrderFromCart(
  cartItems: CartItem[],
  subtotal: number,
  shipping: number,
  discount: number,
  total: number,
  customAddress?: string,
  paymentId?: string,
  paymentMethod?: string
): Order {
  const user = getCurrentUser();
  const userId = user ? user.id : 'usr_demo_101';
  
  const defaultAddr = user?.addresses.find(a => a.isDefault);
  const formattedAddress = customAddress || 
    (defaultAddr 
      ? `${defaultAddr.street}, ${defaultAddr.city}, ${defaultAddr.state} ${defaultAddr.zipCode}`
      : 'Flat 402, Lotus Heights, Bandra West, Mumbai, MH 400050');

  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const newOrder: Order = {
    id: `ORD-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: userId,
    date: dateString,
    status: 'Processing',
    items: cartItems.map(c => ({
      productId: c.id,
      name: c.name,
      price: c.price,
      quantity: c.quantity,
      image: c.image
    })),
    subtotal: subtotal,
    shipping: shipping,
    discount: discount,
    total: total,
    trackingNumber: `TRK-SC-${Date.now().toString().slice(-8)}`,
    shippingAddress: formattedAddress,
    paymentId: paymentId || `pay_rzp_test_${Date.now().toString().slice(-8)}`,
    paymentMethod: paymentMethod || 'Razorpay Test Checkout'
  };

  const all = getAllOrders();
  all.unshift(newOrder);
  saveOrders(all);

  return newOrder;
}
