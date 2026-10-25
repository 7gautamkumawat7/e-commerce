import { query, DbClient } from '../db/connection.js';
import { CartEntity, CartItemEntity } from '../types/models.js';
import { v4 as uuidv4 } from 'uuid';

export interface CartItemWithProduct extends CartItemEntity {
  name: string;
  price_cents: number;
  image: string;
  category_name: string;
  stock_quantity: number;
}

export class CartRepository {
  async getOrCreateCart(userId: string, client?: DbClient): Promise<CartEntity> {
    const q = client ? client.query.bind(client) : query;
    let res = await q<CartEntity>('SELECT * FROM carts WHERE user_id = $1', [userId]);
    if (res.rows[0]) return res.rows[0];

    const cartId = `cart_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
    res = await q<CartEntity>(
      `INSERT INTO carts (id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [cartId, userId]
    );
    return res.rows[0];
  }

  async findByUserId(userId: string, client?: DbClient): Promise<CartEntity> {
    return this.getOrCreateCart(userId, client);
  }

  async getCartItems(cartId: string, client?: DbClient): Promise<CartItemWithProduct[]> {
    const q = client ? client.query.bind(client) : query;
    const sql = `
      SELECT ci.*,
             p.name,
             p.price_cents,
             p.image,
             p.category_name,
             COALESCE(i.stock_quantity, 0) as stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at ASC
    `;
    const res = await q<CartItemWithProduct>(sql, [cartId]);
    return res.rows;
  }

  async addItem(cartId: string, productId: string, quantity: number, client?: DbClient): Promise<CartItemEntity> {
    const q = client ? client.query.bind(client) : query;
    const itemId = `ci_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
    const sql = `
      INSERT INTO cart_items (id, cart_id, product_id, quantity)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (cart_id, product_id) DO UPDATE SET
        quantity = cart_items.quantity + EXCLUDED.quantity,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const res = await q<CartItemEntity>(sql, [itemId, cartId, productId, quantity]);
    return res.rows[0];
  }

  async updateItemQuantity(cartId: string, productId: string, quantity: number, client?: DbClient): Promise<CartItemEntity | null> {
    const q = client ? client.query.bind(client) : query;
    if (quantity <= 0) {
      await this.removeItem(cartId, productId, client);
      return null;
    }
    const sql = `
      UPDATE cart_items
      SET quantity = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE cart_id = $1 AND product_id = $2
      RETURNING *;
    `;
    const res = await q<CartItemEntity>(sql, [cartId, productId, quantity]);
    return res.rows[0] || null;
  }

  async removeItem(cartId: string, productId: string, client?: DbClient): Promise<void> {
    const q = client ? client.query.bind(client) : query;
    await q('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);
  }

  async clearCart(cartId: string, client?: DbClient): Promise<void> {
    const q = client ? client.query.bind(client) : query;
    await q('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
  }
}

export const cartRepository = new CartRepository();
