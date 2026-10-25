import crypto from 'crypto';
import { env } from '../config/env.js';
import { transaction } from '../db/connection.js';
import { paymentRepository } from '../repositories/payment.repository.js';
import { orderRepository } from '../repositories/order.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { productService } from './product.service.js';
import { cartRepository } from '../repositories/cart.repository.js';
import { AppError } from '../types/api.js';
import { OrderStatus, PaymentStatus } from '../types/states.js';
import { logger } from '../utils/logger.js';

export class WebhookService {
  /**
   * Verifies Razorpay webhook HMAC signature.
   */
  verifyWebhookSignature(rawBody: string | Buffer, signatureHeader: string | undefined): boolean {
    if (!signatureHeader) return false;

    try {
      const generated = crypto
        .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      const expectedBuffer = Buffer.from(generated, 'utf-8');
      const providedBuffer = Buffer.from(signatureHeader, 'utf-8');

      return (
        expectedBuffer.length === providedBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, providedBuffer)
      );
    } catch (err) {
      logger.error({ err }, 'Error verifying webhook signature');
      return false;
    }
  }

  /**
   * Idempotent processing of Razorpay webhook events.
   */
  async processRazorpayWebhook(
    rawBody: string | Buffer,
    signatureHeader: string | undefined
  ): Promise<{ status: string; eventType: string; isDuplicate: boolean }> {
    // 1. Signature Verification
    const isValid = this.verifyWebhookSignature(rawBody, signatureHeader);
    if (!isValid) {
      logger.warn('Razorpay webhook signature verification failed.');
      throw new AppError(400, 'PAYMENT_SIGNATURE_INVALID', 'Invalid Razorpay webhook signature.');
    }

    const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString('utf-8'));
    const eventType: string = payload.event || 'unknown';
    // Razorpay webhook payloads include payload.event and an account/event id or entity id
    const providerEventId: string =
      payload.id ||
      payload.event_id ||
      `${eventType}_${payload.payload?.payment?.entity?.id || payload.payload?.order?.entity?.id || Date.now()}`;

    // 2. Prevent Duplicate Processing: Check/Record Event Log
    const { isDuplicate, event } = await paymentRepository.recordWebhookEvent({
      providerEventId,
      provider: 'RAZORPAY',
      eventType,
      payload
    });

    if (isDuplicate && event.processing_status === 'PROCESSED') {
      logger.info(
        { providerEventId, eventType },
        'Duplicate webhook event already successfully processed. Idempotently ignoring.'
      );
      return { status: 'ALREADY_PROCESSED', eventType, isDuplicate: true };
    }

    try {
      // 3. Dispatch Event Handlers
      switch (eventType) {
        case 'payment.captured':
        case 'payment.authorized':
        case 'order.paid':
          await this.handlePaymentSuccess(payload);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(payload);
          break;

        case 'refund.created':
        case 'refund.processed':
          await this.handleRefundProcessed(payload);
          break;

        default:
          logger.info({ eventType, providerEventId }, 'Unhandled webhook event type received');
      }

      await paymentRepository.markEventProcessed(providerEventId, 'PROCESSED');
      return { status: 'PROCESSED', eventType, isDuplicate: false };
    } catch (err: any) {
      logger.error({ err: err.message, providerEventId, eventType }, 'Webhook processing failed');
      await paymentRepository.markEventProcessed(providerEventId, 'FAILED', err.message);
      throw err;
    }
  }

  private async handlePaymentSuccess(payload: any): Promise<void> {
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
    const rzpPaymentId = paymentEntity?.id;

    if (!rzpOrderId) {
      logger.warn({ payload }, 'Webhook payment success missing order_id');
      return;
    }

    const payment = await paymentRepository.findByRazorpayOrderId(rzpOrderId);
    if (!payment) {
      logger.warn({ rzpOrderId }, 'Payment record not found for webhook order_id');
      return;
    }

    // Check if already processed (e.g. by frontend verification callback)
    if (payment.status === PaymentStatus.SUCCESS) {
      logger.info({ rzpOrderId, rzpPaymentId }, 'Payment already in SUCCESS state; skipping repeat deduction.');
      return;
    }

    const order = await orderRepository.getOrderWithItems(payment.order_id);
    if (!order) return;

    // Run reconciliation transaction
    await transaction(async (client) => {
      // 1. Deduct inventory atomically
      for (const item of order.items) {
        await productRepository.atomicDeductStock(item.product_id, item.quantity, client);
      }

      // 2. Mark payment SUCCESS
      await paymentRepository.updateStatus(
        payment.id,
        PaymentStatus.SUCCESS,
        {
          razorpayPaymentId: rzpPaymentId,
          method: paymentEntity?.method || 'razorpay'
        },
        client
      );

      // 3. Mark order CONFIRMED
      await orderRepository.updateStatus(order.id, OrderStatus.CONFIRMED, client);

      // 4. Clear cart if user exists
      const cart = await cartRepository.getOrCreateCart(order.user_id, client);
      if (cart) {
        await cartRepository.clearCart(cart.id, client);
      }
    });

    // Invalidate product caches
    for (const item of order.items) {
      await productService.invalidateProductCache(item.product_id);
    }

    logger.info({ orderId: order.id, rzpPaymentId }, 'Webhook reconciled payment successfully');
  }

  private async handlePaymentFailed(payload: any): Promise<void> {
    const paymentEntity = payload.payload?.payment?.entity;
    const rzpOrderId = paymentEntity?.order_id;
    const rzpPaymentId = paymentEntity?.id;

    if (!rzpOrderId) return;

    const payment = await paymentRepository.findByRazorpayOrderId(rzpOrderId);
    if (!payment) return;

    if (payment.status === PaymentStatus.SUCCESS) {
      // Never transition a successful payment to failed
      return;
    }

    await transaction(async (client) => {
      await paymentRepository.updateStatus(
        payment.id,
        PaymentStatus.FAILED,
        {
          razorpayPaymentId: rzpPaymentId,
          errorCode: paymentEntity?.error_code,
          errorDescription: paymentEntity?.error_description || paymentEntity?.error_reason
        },
        client
      );
    });

    logger.info({ paymentId: payment.id, rzpPaymentId }, 'Payment marked FAILED via webhook');
  }

  private async handleRefundProcessed(payload: any): Promise<void> {
    const refundEntity = payload.payload?.refund?.entity;
    const paymentEntity = payload.payload?.payment?.entity;

    const rzpPaymentId = refundEntity?.payment_id || paymentEntity?.id;
    if (!rzpPaymentId) return;

    const payment = await paymentRepository.findByRazorpayPaymentId(rzpPaymentId);
    if (!payment) return;

    const refundAmountCents = refundEntity?.amount || payment.amount_cents;
    const isFullRefund = refundAmountCents >= payment.amount_cents;
    const targetStatus = isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;

    await transaction(async (client) => {
      await paymentRepository.updateStatus(payment.id, targetStatus, {}, client);
    });

    logger.info({ paymentId: payment.id, targetStatus }, 'Payment refund reconciled via webhook');
  }

  /**
   * Helper to sign a test webhook payload for test suites.
   */
  signTestPayload(payloadString: string): string {
    return crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(payloadString)
      .digest('hex');
  }
}

export const webhookService = new WebhookService();
