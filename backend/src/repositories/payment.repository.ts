import { query, DbClient } from '../db/connection.js';
import { PaymentEntity, PaymentEventEntity, RefundEntity } from '../types/models.js';
import { PaymentStatusType, validatePaymentTransition } from '../types/states.js';
import { v4 as uuidv4 } from 'uuid';

export class PaymentRepository {
  async create(payment: {
    id: string;
    orderId: string;
    razorpayOrderId: string;
    amountCents: number;
    currency?: string;
    status: PaymentStatusType;
    method?: string;
  }, client: DbClient): Promise<PaymentEntity> {
    const sql = `
      INSERT INTO payments (
        id, order_id, razorpay_order_id, status, amount_cents, currency, method
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const res = await client.query<PaymentEntity>(sql, [
      payment.id,
      payment.orderId,
      payment.razorpayOrderId,
      payment.status,
      payment.amountCents,
      payment.currency || 'INR',
      payment.method || null
    ]);
    return res.rows[0];
  }

  async findById(id: string, client?: DbClient): Promise<PaymentEntity | null> {
    const q = client ? client.query.bind(client) : query;
    const res = await q<PaymentEntity>('SELECT * FROM payments WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async findByOrderId(orderId: string, client?: DbClient): Promise<PaymentEntity | null> {
    const q = client ? client.query.bind(client) : query;
    const res = await q<PaymentEntity>('SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1', [orderId]);
    return res.rows[0] || null;
  }

  async findByRazorpayOrderId(rzpOrderId: string, client?: DbClient): Promise<PaymentEntity | null> {
    const q = client ? client.query.bind(client) : query;
    const res = await q<PaymentEntity>('SELECT * FROM payments WHERE razorpay_order_id = $1', [rzpOrderId]);
    return res.rows[0] || null;
  }

  async findByRazorpayPaymentId(rzpPaymentId: string, client?: DbClient): Promise<PaymentEntity | null> {
    const q = client ? client.query.bind(client) : query;
    const res = await q<PaymentEntity>('SELECT * FROM payments WHERE razorpay_payment_id = $1', [rzpPaymentId]);
    return res.rows[0] || null;
  }

  async updateStatus(
    id: string,
    targetStatus: PaymentStatusType,
    metadata: {
      razorpayPaymentId?: string;
      method?: string;
      errorCode?: string;
      errorDescription?: string;
    } = {},
    client: DbClient
  ): Promise<PaymentEntity> {
    const current = await this.findById(id, client);
    if (!current) throw new Error(`Payment ${id} not found.`);

    // Strict state transition validation
    validatePaymentTransition(current.status, targetStatus);

    const sql = `
      UPDATE payments
      SET status = $2,
          razorpay_payment_id = COALESCE($3, razorpay_payment_id),
          method = COALESCE($4, method),
          error_code = COALESCE($5, error_code),
          error_description = COALESCE($6, error_description),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const res = await client.query<PaymentEntity>(sql, [
      id,
      targetStatus,
      metadata.razorpayPaymentId || null,
      metadata.method || null,
      metadata.errorCode || null,
      metadata.errorDescription || null
    ]);
    return res.rows[0];
  }

  // --------------------------------------------------------------------------
  // WEBHOOK EVENTS LOGGING (Idempotent Webhook Processing)
  // --------------------------------------------------------------------------

  async recordWebhookEvent(event: {
    providerEventId: string;
    provider?: string;
    eventType: string;
    payload: any;
  }, client?: DbClient): Promise<{ isDuplicate: boolean; event: PaymentEventEntity }> {
    const q = client ? client.query.bind(client) : query;
    const id = `evt_${uuidv4().replace(/-/g, '').slice(0, 16)}`;

    // Atomic insert with duplicate detection
    const sql = `
      INSERT INTO payment_events (id, provider_event_id, provider, event_type, payload, processing_status)
      VALUES ($1, $2, $3, $4, $5, 'RECEIVED')
      ON CONFLICT (provider_event_id) DO NOTHING
      RETURNING *;
    `;
    const res = await q<PaymentEventEntity>(sql, [
      id,
      event.providerEventId,
      event.provider || 'RAZORPAY',
      event.eventType,
      JSON.stringify(event.payload)
    ]);

    if (res.rowCount === 0) {
      // Event with this provider_event_id already exists!
      const existing = await q<PaymentEventEntity>(
        'SELECT * FROM payment_events WHERE provider_event_id = $1',
        [event.providerEventId]
      );
      return { isDuplicate: true, event: existing.rows[0] };
    }

    return { isDuplicate: false, event: res.rows[0] };
  }

  async markEventProcessed(providerEventId: string, status: 'PROCESSED' | 'FAILED' | 'IGNORED', errorMessage?: string, client?: DbClient): Promise<void> {
    const q = client ? client.query.bind(client) : query;
    await q(
      `UPDATE payment_events
       SET processing_status = $2,
           error_message = $3,
           processed_at = CURRENT_TIMESTAMP
       WHERE provider_event_id = $1`,
      [providerEventId, status, errorMessage || null]
    );
  }

  // --------------------------------------------------------------------------
  // REFUNDS
  // --------------------------------------------------------------------------

  async createRefund(refund: {
    id: string;
    paymentId: string;
    razorpayRefundId: string;
    amountCents: number;
    currency?: string;
    status: 'PENDING' | 'PROCESSED' | 'FAILED';
    reason?: string;
  }, client: DbClient): Promise<RefundEntity> {
    const sql = `
      INSERT INTO refunds (id, payment_id, razorpay_refund_id, amount_cents, currency, status, reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const res = await client.query<RefundEntity>(sql, [
      refund.id,
      refund.paymentId,
      refund.razorpayRefundId,
      refund.amountCents,
      refund.currency || 'INR',
      refund.status,
      refund.reason || null
    ]);
    return res.rows[0];
  }

  async getRefundsByPaymentId(paymentId: string, client?: DbClient): Promise<RefundEntity[]> {
    const q = client ? client.query.bind(client) : query;
    const res = await q<RefundEntity>('SELECT * FROM refunds WHERE payment_id = $1 ORDER BY created_at DESC', [paymentId]);
    return res.rows;
  }

  async getTotalRefundedAmount(paymentId: string, client?: DbClient): Promise<number> {
    const q = client ? client.query.bind(client) : query;
    const res = await q<{ total: string }>(
      "SELECT COALESCE(SUM(amount_cents), 0) as total FROM refunds WHERE payment_id = $1 AND status IN ('PROCESSED', 'PENDING')",
      [paymentId]
    );
    return parseInt(res.rows[0]?.total || '0', 10);
  }
}

export const paymentRepository = new PaymentRepository();
