import { query, DbClient } from '../db/connection.js';
import { ProductEntity, InventoryEntity } from '../types/models.js';

export interface ProductWithInventory extends ProductEntity {
  stock_quantity: number;
}

export class ProductRepository {
  async findAll(params: {
    category?: string;
    search?: string;
    sort?: 'featured' | 'discount' | 'price-low' | 'price-high' | 'rating';
    limit?: number;
    offset?: number;
  } = {}, client?: DbClient): Promise<{ products: ProductWithInventory[]; total: number }> {
    const q = client ? client.query.bind(client) : query;
    const conditions: string[] = ['p.is_active = TRUE'];
    const values: any[] = [];
    let idx = 1;

    if (params.category && params.category !== 'all') {
      conditions.push(`p.category = $${idx++}`);
      values.push(params.category);
    }

    if (params.search && params.search.trim()) {
      const searchTerm = `%${params.search.trim().toLowerCase()}%`;
      conditions.push(`(
        LOWER(p.name) LIKE $${idx} OR
        LOWER(p.description) LIKE $${idx} OR
        LOWER(p.category_name) LIKE $${idx}
      )`);
      values.push(searchTerm);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'ORDER BY p.rating DESC, p.created_at DESC';
    if (params.sort === 'price-low') {
      orderBy = 'ORDER BY p.price_cents ASC';
    } else if (params.sort === 'price-high') {
      orderBy = 'ORDER BY p.price_cents DESC';
    } else if (params.sort === 'rating') {
      orderBy = 'ORDER BY p.rating DESC';
    } else if (params.sort === 'discount') {
      orderBy = 'ORDER BY (p.was_price_cents - p.price_cents) DESC NULLS LAST';
    }

    const limit = Math.min(params.limit || 50, 100);
    const offset = params.offset || 0;

    const countSql = `SELECT COUNT(*) as count FROM products p ${whereClause}`;
    const countRes = await q<{ count: string }>(countSql, values);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const sql = `
      SELECT p.*, COALESCE(i.stock_quantity, 0) as stock_quantity
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      ${whereClause}
      ${orderBy}
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    values.push(limit, offset);
    const res = await q<ProductWithInventory>(sql, values);

    return {
      products: res.rows,
      total
    };
  }

  async findById(id: string, client?: DbClient): Promise<ProductWithInventory | null> {
    const q = client ? client.query.bind(client) : query;
    const sql = `
      SELECT p.*, COALESCE(i.stock_quantity, 0) as stock_quantity
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.id = $1 AND p.is_active = TRUE
    `;
    const res = await q<ProductWithInventory>(sql, [id]);
    return res.rows[0] || null;
  }

  async findManyByIds(ids: string[], client?: DbClient): Promise<ProductWithInventory[]> {
    if (ids.length === 0) return [];
    const q = client ? client.query.bind(client) : query;
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    const sql = `
      SELECT p.*, COALESCE(i.stock_quantity, 0) as stock_quantity
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.id IN (${placeholders}) AND p.is_active = TRUE
    `;
    const res = await q<ProductWithInventory>(sql, ids);
    return res.rows;
  }

  /**
   * Concurrency-Safe Atomic Stock Deduction
   * Guarantees two concurrent checkouts cannot over-sell limited inventory.
   * Returns true if stock was successfully decremented, false if insufficient stock or locked.
   */
  async atomicDeductStock(productId: string, quantity: number, client: DbClient): Promise<boolean> {
    const sql = `
      UPDATE inventory
      SET stock_quantity = stock_quantity - $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $2
        AND stock_quantity >= $1
      RETURNING stock_quantity;
    `;
    const res = await client.query(sql, [quantity, productId]);
    return res.rowCount === 1;
  }

  /**
   * Concurrency-Safe Atomic Stock Restoration (compensation or cancellation)
   */
  async atomicRestoreStock(productId: string, quantity: number, client: DbClient): Promise<void> {
    const sql = `
      UPDATE inventory
      SET stock_quantity = stock_quantity + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $2;
    `;
    await client.query(sql, [quantity, productId]);
  }
}

export const productRepository = new ProductRepository();
