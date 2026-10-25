import { query, DbClient } from '../db/connection.js';
import { IdempotencyRecordEntity } from '../types/models.js';

export class IdempotencyRepository {
  async find(key: string, userId: string, endpoint: string, client?: DbClient): Promise<IdempotencyRecordEntity | null> {
    const q = client ? client.query.bind(client) : query;
    const res = await q<IdempotencyRecordEntity>(
      `SELECT * FROM idempotency_records
       WHERE idempotency_key = $1 AND user_id = $2 AND endpoint = $3 AND expires_at > CURRENT_TIMESTAMP`,
      [key, userId, endpoint]
    );
    return res.rows[0] || null;
  }

  async reserve(
    key: string,
    userId: string,
    endpoint: string,
    requestHash: string,
    ttlSeconds: number = 86400,
    client?: DbClient
  ): Promise<boolean> {
    const q = client ? client.query.bind(client) : query;
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const sql = `
      INSERT INTO idempotency_records (idempotency_key, user_id, endpoint, request_hash, status, expires_at)
      VALUES ($1, $2, $3, $4, 'PROCESSING', $5)
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING *;
    `;
    const res = await q(sql, [key, userId, endpoint, requestHash, expiresAt]);
    return res.rowCount === 1;
  }

  async complete(
    key: string,
    responseStatus: number,
    responseBody: any,
    client?: DbClient
  ): Promise<void> {
    const q = client ? client.query.bind(client) : query;
    const sql = `
      UPDATE idempotency_records
      SET status = 'COMPLETED',
          response_status = $2,
          response_body = $3
      WHERE idempotency_key = $1;
    `;
    await q(sql, [key, responseStatus, JSON.stringify(responseBody)]);
  }
}

export const idempotencyRepository = new IdempotencyRepository();
