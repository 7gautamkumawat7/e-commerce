import { query, DbClient } from '../db/connection.js';
import { OrderEntity, OrderItemEntity } from '../types/models.js';
import { OrderStatusType, validateOrderTransition } from '../types/states.js';

export interface OrderWithItems extends OrderEntity {
  items: OrderItemEntity[];
}

export class OrderRepository {
  async create(order: {
    id: string;
    userId: string;
    orderNumber: string;
    status: OrderStatusType;
    subtotalCents: number;
    shippingCents: number;
    discountCents: number;
    totalCents: number;
    currency: string;
    shippingAddressJson: any;
    trackingNumber: string;
    notes?: string;
  }, client: DbClient): Promise<OrderEntity> {
    const sql = `
      INSERT INTO orders (
        id, user_id, order_number, status, subtotal_cents, shipping_cents,
        discount_cents, total_cents, currency, shipping_address_json,
        tracking_number, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
    const res = await client.query<OrderEntity>(sql, [
      order.id,
      order.userId,
      order.orderNumber,
      order.status,
      order.subtotalCents,
      order.shippingCents,
      order.discountCents,
      order.totalCents,
      order.currency,
      JSON.stringify(order.shippingAddressJson),
      order.trackingNumber,
      order.notes || null
    ]);
    return res.rows[0];
  }

  async createItems(items: {
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    priceCents: number;
    quantity: number;
    totalCents: number;
    image: string;
  }[], client: DbClient): Promise<void> {
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (
          id, order_id, product_id, product_name, price_cents, quantity, total_cents, image
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          item.id,
          item.orderId,
          item.productId,
          item.productName,
          item.priceCents,
          item.quantity,
          item.totalCents,
          item.image
        ]
      );
    }
  }

  async findById(id: string, client?: DbClient): Promise<OrderEntity | null> {
    const q = client ? client.query.bind(client) : query;
    const res = await q<OrderEntity>('SELECT * FROM orders WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async findByUserId(userId: string, client?: DbClient): Promise<OrderWithItems[]> {
    const q = client ? client.query.bind(client) : query;
    const orderRes = await q<OrderEntity>(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    if (orderRes.rows.length === 0) return [];

    const orderIds = orderRes.rows.map((o) => o.id);
    const placeholders = orderIds.map((_, i) => `$${i + 1}`).join(',');
    const itemsRes = await q<OrderItemEntity>(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders}) ORDER BY created_at ASC`,
      orderIds
    );

    const itemsByOrderId = new Map<string, OrderItemEntity[]>();
    for (const item of itemsRes.rows) {
      const list = itemsByOrderId.get(item.order_id) || [];
      list.push(item);
      itemsByOrderId.set(item.order_id, list);
    }

    return orderRes.rows.map((order) => ({
      ...order,
      items: itemsByOrderId.get(order.id) || []
    }));
  }

  async getOrderWithItems(id: string, client?: DbClient): Promise<OrderWithItems | null> {
    const order = await this.findById(id, client);
    if (!order) return null;
    const q = client ? client.query.bind(client) : query;
    const itemsRes = await q<OrderItemEntity>('SELECT * FROM order_items WHERE order_id = $1', [id]);
    return {
      ...order,
      items: itemsRes.rows
    };
  }

  async updateStatus(id: string, targetStatus: OrderStatusType, client: DbClient): Promise<OrderEntity> {
    const current = await this.findById(id, client);
    if (!current) throw new Error(`Order ${id} not found.`);
    validateOrderTransition(current.status, targetStatus);

    const res = await client.query<OrderEntity>(
      `UPDATE orders
       SET status = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *;`,
      [id, targetStatus]
    );
    return res.rows[0];
  }
}

export const orderRepository = new OrderRepository();
