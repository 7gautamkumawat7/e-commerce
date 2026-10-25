/**
 * Production API Client for ShopCart E-Commerce & Payment Engine
 * Communicates with the Node.js/Express backend with HTTP-only cookies and error normalization.
 */

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string;
    total?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export class ApiException extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {},
  idempotencyKey?: string
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include' // Always send/receive HTTP-only authentication cookies
  });

  let body: any;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok || !body?.success) {
    const error: ApiError = body?.error || {
      code: 'REQUEST_FAILED',
      message: `HTTP ${response.status}: Failed to complete operation.`
    };
    throw new ApiException(response.status, error.code, error.message, error.details);
  }

  return body.data as T;
}

// ----------------------------------------------------------------------------
// AUTHENTICATION APIs
// ----------------------------------------------------------------------------
export const authApi = {
  async register(data: { name: string; email: string; password?: string; phone?: string }) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async login(credentials: { email: string; password: string }) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  async sendOtp(email: string) {
    return request<{ success: boolean; expiresInSeconds: number; devOtp?: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async verifyOtp(data: { email: string; otp: string; name?: string }) {
    return request<{ accessToken: string; user: any }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async refreshToken() {
    return request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST'
    });
  },

  async getMe() {
    return request('/auth/me', { method: 'GET' });
  },

  async updateProfile(updates: { name?: string; phone?: string; avatar?: string }) {
    return request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async addAddress(address: any) {
    return request('/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(address)
    });
  },

  async deleteAddress(addressId: string) {
    return request(`/auth/addresses/${addressId}`, { method: 'DELETE' });
  },

  async logout() {
    return request('/auth/logout', { method: 'POST' });
  }
};

// ----------------------------------------------------------------------------
// PRODUCTS & CATALOG APIs
// ----------------------------------------------------------------------------
export const productsApi = {
  async getProducts(params: {
    category?: string;
    search?: string;
    sort?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.sort) query.set('sort', params.sort);
    if (params.limit) query.set('limit', String(params.limit));
    if (params.offset) query.set('offset', String(params.offset));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ products: any[]; total: number }>(`/products${qs}`, { method: 'GET' });
  },

  async getProductById(id: string) {
    return request(`/products/${id}`, { method: 'GET' });
  }
};

// ----------------------------------------------------------------------------
// AUTHORITATIVE CART APIs
// ----------------------------------------------------------------------------
export const cartApi = {
  async getCart() {
    return request('/cart', { method: 'GET' });
  },

  async addItem(productId: string, quantity: number = 1) {
    return request('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  },

  async updateItem(productId: string, quantity: number) {
    return request(`/cart/items/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity })
    });
  },

  async removeItem(productId: string) {
    return request(`/cart/items/${productId}`, { method: 'DELETE' });
  },

  async clearCart() {
    return request('/cart', { method: 'DELETE' });
  }
};

// ----------------------------------------------------------------------------
// COUPONS API
// ----------------------------------------------------------------------------
export const couponsApi = {
  async applyCoupon(code: string) {
    return request('/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  }
};

// ----------------------------------------------------------------------------
// ORDERS API
// ----------------------------------------------------------------------------
export const ordersApi = {
  async createOrder(data: any) {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getOrders() {
    return request<any[]>('/orders', { method: 'GET' });
  },

  async getOrderById(id: string) {
    return request(`/orders/${id}`, { method: 'GET' });
  },

  async cancelOrder(id: string, reason?: string) {
    return request(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }
};

// ----------------------------------------------------------------------------
// PAYMENTS & RAZORPAY API
// ----------------------------------------------------------------------------
export const paymentsApi = {
  async createOrder(data: {
    couponCode?: string;
    shippingAddressId?: string;
    customAddress?: any;
  }, idempotencyKey?: string) {
    return request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(data)
    }, idempotencyKey);
  },

  async verifyPayment(data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    return request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async sandboxSimulate(data: { orderId: string; razorpayOrderId: string }) {
    return request('/payments/sandbox-simulate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async refundPayment(paymentId: string, data: { amountCents?: number; reason?: string }) {
    return request(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getRefunds() {
    return request<any[]>('/payments/refunds', { method: 'GET' });
  }
};
