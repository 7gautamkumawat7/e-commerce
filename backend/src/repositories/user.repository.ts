import { query, DbClient } from '../db/connection.js';
import { UserEntity, UserAddressEntity } from '../types/models.js';

export class UserRepository {
  async findByEmail(email: string, client?: DbClient): Promise<UserEntity | null> {
    const q = client ? client.query.bind(client) : query;
    const res = await q<UserEntity>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );
    return res.rows[0] || null;
  }

  async findById(id: string, client?: DbClient): Promise<UserEntity | null> {
    const q = client ? client.query.bind(client) : query;
    const res = await q<UserEntity>('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] || null;
  }

  async create(user: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    phone?: string | null;
    avatar?: string | null;
    memberTier?: string;
  }, client?: DbClient): Promise<UserEntity> {
    const q = client ? client.query.bind(client) : query;
    const res = await q<UserEntity>(
      `INSERT INTO users (id, name, email, password_hash, phone, avatar, member_tier)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        user.id,
        user.name.trim(),
        user.email.trim().toLowerCase(),
        user.passwordHash,
        user.phone || null,
        user.avatar || null,
        user.memberTier || 'Member'
      ]
    );
    return res.rows[0];
  }

  async update(id: string, updates: Partial<{
    name: string;
    phone: string | null;
    avatar: string | null;
    memberTier: string;
  }>, client?: DbClient): Promise<UserEntity | null> {
    const q = client ? client.query.bind(client) : query;
    const res = await q<UserEntity>(
      `UPDATE users
       SET name = COALESCE($2, name),
           phone = COALESCE($3, phone),
           avatar = COALESCE($4, avatar),
           member_tier = COALESCE($5, member_tier),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, updates.name, updates.phone, updates.avatar, updates.memberTier]
    );
    return res.rows[0] || null;
  }

  async getAddresses(userId: string, client?: DbClient): Promise<UserAddressEntity[]> {
    const q = client ? client.query.bind(client) : query;
    const res = await q<UserAddressEntity>(
      'SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at ASC',
      [userId]
    );
    return res.rows;
  }

  async findAddressesByUserId(userId: string, client?: DbClient): Promise<UserAddressEntity[]> {
    return this.getAddresses(userId, client);
  }

  async addAddress(address: {
    id: string;
    userId: string;
    title: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }, client?: DbClient): Promise<UserAddressEntity> {
    const q = client ? client.query.bind(client) : query;
    if (address.isDefault) {
      await q('UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1', [address.userId]);
    }
    const res = await q<UserAddressEntity>(
      `INSERT INTO user_addresses (id, user_id, title, street, city, state, zip_code, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        address.id,
        address.userId,
        address.title,
        address.street,
        address.city,
        address.state,
        address.zipCode,
        address.country,
        address.isDefault
      ]
    );
    return res.rows[0];
  }

  async updateAddress(
    id: string,
    userId: string,
    address: Partial<Omit<UserAddressEntity, 'id' | 'user_id' | 'created_at'>>,
    client?: DbClient
  ): Promise<UserAddressEntity | null> {
    const q = client ? client.query.bind(client) : query;
    if (address.is_default) {
      await q('UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
    }
    const res = await q<UserAddressEntity>(
      `UPDATE user_addresses
       SET title = COALESCE($3, title),
           street = COALESCE($4, street),
           city = COALESCE($5, city),
           state = COALESCE($6, state),
           zip_code = COALESCE($7, zip_code),
           country = COALESCE($8, country),
           is_default = COALESCE($9, is_default)
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [
        id,
        userId,
        address.title,
        address.street,
        address.city,
        address.state,
        address.zip_code,
        address.country,
        address.is_default
      ]
    );
    return res.rows[0] || null;
  }

  async deleteAddress(id: string, userId: string, client?: DbClient): Promise<boolean> {
    const q = client ? client.query.bind(client) : query;
    const res = await q('DELETE FROM user_addresses WHERE id = $1 AND user_id = $2', [id, userId]);
    return res.rowCount > 0;
  }
}

export const userRepository = new UserRepository();
