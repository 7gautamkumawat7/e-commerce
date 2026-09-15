export type Category = 'all' | 'electronics' | 'fashion' | 'home' | 'beauty' | 'pets';

export type SortOption = 'featured' | 'discount' | 'price-low' | 'price-high' | 'rating';

export type ViewType = 'store' | 'account';

export type AccountTab = 'profile' | 'orders' | 'wishlist' | 'addresses' | 'security';

export type AuthMode = 'login' | 'signup';

export interface Product {
  id: string;
  name: string;
  category: 'electronics' | 'fashion' | 'home' | 'beauty' | 'pets';
  categoryName: string;
  price: number;
  wasPrice?: number;
  discount: string;
  rating: number;
  reviews: number;
  tag: string;
  image: string;
  badgeClass: string;
  description: string;
  features: string[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Address {
  id: string;
  title: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  memberTier?: 'Member' | 'Gold VIP' | 'Platinum';
  joinedDate: string;
  addresses: Address[];
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  date: string;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  trackingNumber: string;
  shippingAddress: string;
  paymentId?: string;
  paymentMethod?: string;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

export interface DeliveryLocation {
  city: string;
  state: string;
  postalCode: string;
  countryName: string;
  countryCode: string;
  formatted: string;
  source: 'gps' | 'ip' | 'manual' | 'preset';
}

export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  method?: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: RazorpayPaymentResult) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (response: any) => void) => void;
    };
  }
}
