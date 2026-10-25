import { describe, it, expect } from 'vitest';
import {
  OrderStatus,
  PaymentStatus,
  validateOrderTransition,
  validatePaymentTransition,
  StateTransitionError
} from '../../src/types/states.js';

describe('Order & Payment State Machine Unit Tests', () => {
  describe('Order State Machine', () => {
    it('allows valid order progression CREATED -> CONFIRMED -> PROCESSING -> PACKED -> SHIPPED -> DELIVERED', () => {
      expect(() => validateOrderTransition(OrderStatus.CREATED, OrderStatus.CONFIRMED)).not.toThrow();
      expect(() => validateOrderTransition(OrderStatus.CONFIRMED, OrderStatus.PROCESSING)).not.toThrow();
      expect(() => validateOrderTransition(OrderStatus.PROCESSING, OrderStatus.PACKED)).not.toThrow();
      expect(() => validateOrderTransition(OrderStatus.PACKED, OrderStatus.SHIPPED)).not.toThrow();
      expect(() => validateOrderTransition(OrderStatus.SHIPPED, OrderStatus.DELIVERED)).not.toThrow();
    });

    it('allows cancellation from CREATED, CONFIRMED, or PROCESSING', () => {
      expect(() => validateOrderTransition(OrderStatus.CREATED, OrderStatus.CANCELLED)).not.toThrow();
      expect(() => validateOrderTransition(OrderStatus.CONFIRMED, OrderStatus.CANCELLED)).not.toThrow();
      expect(() => validateOrderTransition(OrderStatus.PROCESSING, OrderStatus.CANCELLED)).not.toThrow();
    });

    it('rejects impossible order state transitions like DELIVERED -> CREATED', () => {
      expect(() => validateOrderTransition(OrderStatus.DELIVERED, OrderStatus.CREATED)).toThrow(
        StateTransitionError
      );
    });

    it('rejects transition out of terminal CANCELLED state', () => {
      expect(() => validateOrderTransition(OrderStatus.CANCELLED, OrderStatus.CONFIRMED)).toThrow(
        StateTransitionError
      );
    });
  });

  describe('Payment State Machine', () => {
    it('allows standard payment progression CREATED -> PENDING -> AUTHORIZED -> CAPTURED -> SUCCESS', () => {
      expect(() => validatePaymentTransition(PaymentStatus.CREATED, PaymentStatus.PENDING)).not.toThrow();
      expect(() => validatePaymentTransition(PaymentStatus.PENDING, PaymentStatus.AUTHORIZED)).not.toThrow();
      expect(() => validatePaymentTransition(PaymentStatus.AUTHORIZED, PaymentStatus.CAPTURED)).not.toThrow();
      expect(() => validatePaymentTransition(PaymentStatus.CAPTURED, PaymentStatus.SUCCESS)).not.toThrow();
    });

    it('allows refund transitions SUCCESS -> REFUND_PENDING -> REFUNDED or PARTIALLY_REFUNDED', () => {
      expect(() => validatePaymentTransition(PaymentStatus.SUCCESS, PaymentStatus.REFUND_PENDING)).not.toThrow();
      expect(() => validatePaymentTransition(PaymentStatus.REFUND_PENDING, PaymentStatus.REFUNDED)).not.toThrow();
      expect(() => validatePaymentTransition(PaymentStatus.SUCCESS, PaymentStatus.PARTIALLY_REFUNDED)).not.toThrow();
    });

    it('strictly prevents impossible transitions such as REFUNDED -> CAPTURED', () => {
      expect(() => validatePaymentTransition(PaymentStatus.REFUNDED, PaymentStatus.CAPTURED)).toThrow(
        StateTransitionError
      );
    });

    it('strictly prevents transitions out of FAILED or CANCELLED', () => {
      expect(() => validatePaymentTransition(PaymentStatus.FAILED, PaymentStatus.SUCCESS)).toThrow(
        StateTransitionError
      );
      expect(() => validatePaymentTransition(PaymentStatus.CANCELLED, PaymentStatus.AUTHORIZED)).toThrow(
        StateTransitionError
      );
    });
  });
});
