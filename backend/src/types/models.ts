import { OrderStatusType, PaymentStatusType } from './states.js';

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  phone?: string | null;
  avatar?: string | null;
  member_tier: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserAddressEntity {
  id: string;
  user_id: string;
  title: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
  created_at: Date;
}

export interface ProductEntity {
  id: string;
  name: string;
  slug: string;
  category: string;
  category_name: string;
  price_cents: number;
  was_price_cents?: number | null;
  discount_label?: string | null;
  rating: number;
  reviews_count: number;
  tag?: string | null;
  image: string;
  badge_class?: string | null;
  description: string;
  features: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryEntity {
  product_id: string;
  stock_quantity: number;
  reserved_quantity: number;
  updated_at: Date;
}

export interface CouponEntity {
  id: string;
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number; // e.g., 20 (percent) or 50000 (cents)
  min_order_amount_cents: number;
  max_discount_cents: number;
  valid_from: Date;
  valid_until: Date;
  usage_limit: number;
  per_user_limit: number;
  is_active: boolean;
  created_at: Date;
}

export interface CouponUsageEntity {
  id: string;
  coupon_id: string;
  user_id: string;
  order_id: string;
  created_at: Date;
}

export interface CartEntity {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CartItemEntity {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface OrderEntity {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatusType;
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  total_cents: number;
  currency: string;
  shipping_address_json: any;
  tracking_number: string;
  notes?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItemEntity {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price_cents: number;
  quantity: number;
  total_cents: number;
  image: string;
  created_at: Date;
}

export interface PaymentEntity {
  id: string;
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string | null;
  status: PaymentStatusType;
  amount_cents: number;
  currency: string;
  method?: string | null;
  error_code?: string | null;
  error_description?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentEventEntity {
  id: string;
  provider_event_id: string;
  provider: string;
  event_type: string;
  payload: any;
  processing_status: 'RECEIVED' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'IGNORED';
  error_message?: string | null;
  received_at: Date;
  processed_at?: Date | null;
}

export interface RefundEntity {
  id: string;
  payment_id: string;
  razorpay_refund_id: string;
  amount_cents: number;
  currency: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  reason?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface IdempotencyRecordEntity {
  idempotency_key: string;
  user_id: string;
  endpoint: string;
  request_hash: string;
  status: 'PROCESSING' | 'COMPLETED';
  response_status?: number | null;
  response_body?: any;
  created_at: Date;
  expires_at: Date;
}
