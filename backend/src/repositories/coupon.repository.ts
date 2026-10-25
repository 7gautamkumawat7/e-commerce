import { query, DbClient } from '../db/connection.js';
import { CouponEntity } from '../types/models.js';
import { v4 as uuidv4 } from 'uuid';

export class CouponRepository {
  async findByCode(code: string, client?: DbClient): Promise<CouponEntity | null> {
    const q = client ? client.query.bind(client) : query;
    const res = await q<CouponEntity>(
      'SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) AND is_active = TRUE',
      [code.trim()]
    );
    return res.rows[0] || null;
  }

  async countUserUsages(couponId: string, userId: string, client?: DbClient): Promise<number> {
    const q = client ? client.query.bind(client) : query;
    const res = await q<{ count: string }>(
      'SELECT COUNT(*) as count FROM coupon_usages WHERE coupon_id = $1 AND user_id = $2',
      [couponId, userId]
    );
    return parseInt(res.rows[0]?.count || '0', 10);
  }

  async countTotalUsages(couponId: string, client?: DbClient): Promise<number> {
    const q = client ? client.query.bind(client) : query;
    const res = await q<{ count: string }>(
      'SELECT COUNT(*) as count FROM coupon_usages WHERE coupon_id = $1',
      [couponId]
    );
    return parseInt(res.rows[0]?.count || '0', 10);
  }

  async recordUsage(couponId: string, userId: string, orderId: string, client: DbClient): Promise<void> {
    const id = `use_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
    await client.query(
      `INSERT INTO coupon_usages (id, coupon_id, user_id, order_id)
       VALUES ($1, $2, $3, $4)`,
      [id, couponId, userId, orderId]
    );
  }
}

export const couponRepository = new CouponRepository();
