export const OrderStatus = {
  CREATED: 'CREATED',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  CREATED: 'CREATED',
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  REFUND_PENDING: 'REFUND_PENDING',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED'
} as const;

export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus];

// Allowed state transitions for Order
export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatusType, OrderStatusType[]> = {
  CREATED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [], // Terminal state
  CANCELLED: []  // Terminal state
};

// Allowed state transitions for Payment
export const ALLOWED_PAYMENT_TRANSITIONS: Record<PaymentStatusType, PaymentStatusType[]> = {
  CREATED: ['PENDING', 'AUTHORIZED', 'SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED'],
  PENDING: ['AUTHORIZED', 'SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED'],
  AUTHORIZED: ['CAPTURED', 'SUCCESS', 'FAILED', 'CANCELLED'],
  CAPTURED: ['SUCCESS', 'REFUND_PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED'],
  SUCCESS: ['REFUND_PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED'],
  FAILED: [], // Terminal state
  CANCELLED: [], // Terminal state
  EXPIRED: [], // Terminal state
  REFUND_PENDING: ['REFUNDED', 'PARTIALLY_REFUNDED', 'SUCCESS'], // SUCCESS on refund failure
  REFUNDED: [], // Terminal state
  PARTIALLY_REFUNDED: ['REFUND_PENDING', 'REFUNDED'] // Can refund more until fully refunded
};

export class StateTransitionError extends Error {
  constructor(
    public readonly entityType: 'ORDER' | 'PAYMENT',
    public readonly currentStatus: string,
    public readonly targetStatus: string
  ) {
    super(`Invalid ${entityType} status transition from ${currentStatus} to ${targetStatus}`);
    this.name = 'StateTransitionError';
  }
}

export function validateOrderTransition(current: OrderStatusType, target: OrderStatusType): void {
  if (current === target) return;
  const allowed = ALLOWED_ORDER_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    throw new StateTransitionError('ORDER', current, target);
  }
}

export function validatePaymentTransition(current: PaymentStatusType, target: PaymentStatusType): void {
  if (current === target) return;
  const allowed = ALLOWED_PAYMENT_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    throw new StateTransitionError('PAYMENT', current, target);
  }
}
