import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  phone: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const sendOtpSchema = z.object({
  email: z.string().email('Please provide a valid email address')
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  name: z.string().optional()
});

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    name: z.string().min(1),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    image: z.string().optional(),
    category: z.string().optional()
  })).min(1, 'Order must contain at least one item'),
  shippingAddress: z.object({
    title: z.string().optional(),
    street: z.string().min(3, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(3, 'Zip code is required'),
    country: z.string().default('India'),
    phone: z.string().optional()
  }),
  amountSubtotal: z.number().nonnegative(),
  amountDiscount: z.number().nonnegative().optional().default(0),
  amountShipping: z.number().nonnegative().optional().default(0),
  amountTotal: z.number().positive(),
  paymentMethod: z.enum(['razorpay', 'cod', 'card', 'upi']).default('razorpay'),
  paymentDetails: z.object({
    razorpayOrderId: z.string().optional(),
    razorpayPaymentId: z.string().optional(),
    razorpaySignature: z.string().optional()
  }).optional()
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional()
});

export const addressSchema = z.object({
  title: z.string().min(1, 'Address label title is required'),
  street: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(3, 'Zip code is required'),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false)
});

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be at least 1').default(1)
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative')
});

export const applyCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code cannot be empty')
});

export const createPaymentOrderSchema = z.object({
  couponCode: z.string().optional(),
  shippingAddressId: z.string().optional(),
  customAddress: z.object({
    title: z.string().optional(),
    street: z.string().min(3),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().min(3),
    country: z.string().default('India')
  }).optional()
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'Internal orderId is required'),
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required')
});

export const refundPaymentSchema = z.object({
  amountCents: z.number().int().positive('Refund amount must be positive').optional(),
  reason: z.string().max(255).optional()
});

export const createRefundSchema = refundPaymentSchema;
