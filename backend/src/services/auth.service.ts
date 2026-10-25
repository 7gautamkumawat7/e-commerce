import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { userRepository } from '../repositories/user.repository.js';
import { UserModel, IUser } from '../models/user.model.js';
import { otpService } from './otp.service.js';
import { isMongoHealthy } from '../db/mongodb.js';
import { env } from '../config/env.js';
import { AppError } from '../types/api.js';
import { UserEntity, UserAddressEntity } from '../types/models.js';
import { logger } from '../utils/logger.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    memberTier: string;
    isVerified: boolean;
    addresses: UserAddressEntity[];
    loginHistory?: any[];
  };
}

export class AuthService {
  /**
   * Registers a new user account in MongoDB (with sync to repository).
   */
  async register(data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
  }, clientInfo?: { ip?: string; userAgent?: string }): Promise<AuthTokens> {
    const normalizedEmail = data.email.trim().toLowerCase();

    // 1. Check existing in MongoDB
    if (isMongoHealthy()) {
      const existingMongo = await UserModel.findOne({ email: normalizedEmail });
      if (existingMongo) {
        throw new AppError(409, 'USER_ALREADY_EXISTS', 'An account with this email address already exists.');
      }
    } else {
      const existingRepo = await userRepository.findByEmail(normalizedEmail);
      if (existingRepo) {
        throw new AppError(409, 'USER_ALREADY_EXISTS', 'An account with this email address already exists.');
      }
    }

    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;
    const userId = `usr_${uuidv4().replace(/-/g, '').slice(0, 16)}`;

    // Default starter address
    const defaultAddress: UserAddressEntity = {
      id: `addr_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
      user_id: userId,
      title: 'Home',
      street: '123 MG Road',
      city: 'Mumbai',
      state: 'MH',
      zip_code: '400001',
      country: 'India',
      is_default: true,
      created_at: new Date()
    };

    let mongoUser: IUser | null = null;
    if (isMongoHealthy()) {
      try {
        mongoUser = await UserModel.create({
          id: userId,
          name: data.name.trim(),
          email: normalizedEmail,
          password: passwordHash,
          phone: data.phone || null,
          isVerified: false,
          memberTier: 'Member',
          addresses: [
            {
              id: defaultAddress.id,
              title: defaultAddress.title,
              street: defaultAddress.street,
              city: defaultAddress.city,
              state: defaultAddress.state,
              zipCode: defaultAddress.zip_code,
              country: defaultAddress.country,
              isDefault: true
            }
          ],
          loginHistory: [
            {
              timestamp: new Date(),
              ip: clientInfo?.ip || '127.0.0.1',
              userAgent: clientInfo?.userAgent || 'Browser',
              method: 'password'
            }
          ]
        });
        logger.info({ userId, email: normalizedEmail }, 'Saved new user in MongoDB');
      } catch (err: any) {
        logger.warn({ err: err.message }, 'Failed writing user to MongoDB, using fallback');
      }
    }

    // Secondary sync to user repository
    try {
      await userRepository.create({
        id: userId,
        name: data.name,
        email: normalizedEmail,
        passwordHash: passwordHash || '',
        phone: data.phone || null,
        avatar: null,
        memberTier: 'Member'
      });
      await userRepository.addAddress({
        id: defaultAddress.id,
        userId: defaultAddress.user_id,
        title: defaultAddress.title,
        street: defaultAddress.street,
        city: defaultAddress.city,
        state: defaultAddress.state,
        zipCode: defaultAddress.zip_code,
        country: defaultAddress.country,
        isDefault: true
      });
    } catch {
      // ignore sync duplicate
    }

    return this.generateAuthResponse(
      {
        id: userId,
        name: data.name,
        email: normalizedEmail,
        phone: data.phone || null,
        avatar: null,
        memberTier: 'Member',
        isVerified: false
      },
      [defaultAddress]
    );
  }

  /**
   * Password-based login. Validates password via bcrypt and stores login information in MongoDB.
   */
  async login(
    credentials: { email: string; password: string },
    clientInfo?: { ip?: string; userAgent?: string }
  ): Promise<AuthTokens> {
    const normalizedEmail = credentials.email.trim().toLowerCase();

    // Try MongoDB first
    let userFromMongo: IUser | null = null;
    if (isMongoHealthy()) {
      userFromMongo = await UserModel.findOne({ email: normalizedEmail });
    }

    if (userFromMongo && userFromMongo.password) {
      const isMatch = await bcrypt.compare(credentials.password, userFromMongo.password);
      if (!isMatch) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
      }

      // Record login information in MongoDB
      userFromMongo.loginHistory.push({
        timestamp: new Date(),
        ip: clientInfo?.ip || '127.0.0.1',
        userAgent: clientInfo?.userAgent || 'Browser',
        method: 'password'
      });
      await userFromMongo.save();

      const addresses: UserAddressEntity[] = userFromMongo.addresses.map((a) => ({
        id: a.id,
        user_id: userFromMongo!.id,
        title: a.title,
        street: a.street,
        city: a.city,
        state: a.state,
        zip_code: a.zipCode,
        country: a.country,
        is_default: a.isDefault,
        created_at: new Date()
      }));

      return this.generateAuthResponse(
        {
          id: userFromMongo.id,
          name: userFromMongo.name,
          email: userFromMongo.email,
          phone: userFromMongo.phone,
          avatar: userFromMongo.avatar,
          memberTier: userFromMongo.memberTier,
          isVerified: userFromMongo.isVerified
        },
        addresses
      );
    }

    // Fallback check in relational repository
    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(credentials.password, user.password_hash);
    if (!isMatch) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    const addresses = await userRepository.getAddresses(user.id);

    // Sync to MongoDB if connected
    if (isMongoHealthy()) {
      try {
        await UserModel.findOneAndUpdate(
          { email: normalizedEmail },
          {
            $set: {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              memberTier: user.member_tier,
              avatar: user.avatar
            },
            $push: {
              loginHistory: {
                timestamp: new Date(),
                ip: clientInfo?.ip || '127.0.0.1',
                userAgent: clientInfo?.userAgent || 'Browser',
                method: 'password'
              }
            }
          },
          { upsert: true }
        );
      } catch (err: any) {
        logger.warn({ err: err.message }, 'Failed updating login info to MongoDB');
      }
    }

    return this.generateAuthResponse(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        memberTier: user.member_tier,
        isVerified: true
      },
      addresses
    );
  }

  /**
   * Generates a time-limited OTP using Redis and dispatches it.
   */
  async sendOtp(email: string): Promise<{ success: boolean; expiresInSeconds: number; devOtp?: string }> {
    return await otpService.generateOtp(email);
  }

  /**
   * Verifies time-limited OTP against Redis, logs in or registers user in MongoDB, and records login history.
   */
  async verifyOtpAndLogin(
    data: { email: string; otp: string; name?: string },
    clientInfo?: { ip?: string; userAgent?: string }
  ): Promise<AuthTokens> {
    const normalizedEmail = data.email.trim().toLowerCase();

    // 1. Verify OTP with Redis
    await otpService.verifyOtp(normalizedEmail, data.otp);

    // 2. Fetch or create user in MongoDB
    let user: any = null;
    let addresses: UserAddressEntity[] = [];

    if (isMongoHealthy()) {
      user = await UserModel.findOne({ email: normalizedEmail });
      if (!user) {
        // Automatically create account on first OTP verification
        const userId = `usr_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
        const defaultName = data.name || normalizedEmail.split('@')[0];
        const defaultAddress = {
          id: `addr_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
          title: 'Home',
          street: '123 MG Road',
          city: 'Mumbai',
          state: 'MH',
          zipCode: '400001',
          country: 'India',
          isDefault: true
        };

        user = await UserModel.create({
          id: userId,
          name: defaultName,
          email: normalizedEmail,
          isVerified: true,
          memberTier: 'Member',
          addresses: [defaultAddress],
          loginHistory: [
            {
              timestamp: new Date(),
              ip: clientInfo?.ip || '127.0.0.1',
              userAgent: clientInfo?.userAgent || 'Browser',
              method: 'otp'
            }
          ]
        });
      } else {
        user.isVerified = true;
        user.loginHistory.push({
          timestamp: new Date(),
          ip: clientInfo?.ip || '127.0.0.1',
          userAgent: clientInfo?.userAgent || 'Browser',
          method: 'otp'
        });
        await user.save();
      }

      addresses = (user.addresses || []).map((a: any) => ({
        id: a.id,
        user_id: user.id,
        title: a.title,
        street: a.street,
        city: a.city,
        state: a.state,
        zip_code: a.zipCode,
        country: a.country,
        is_default: a.isDefault,
        created_at: new Date()
      }));
    } else {
      // Fallback repo check
      let repoUser = await userRepository.findByEmail(normalizedEmail);
      if (!repoUser) {
        const userId = `usr_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
        repoUser = await userRepository.create({
          id: userId,
          name: data.name || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          passwordHash: ''
        });
      }
      user = repoUser;
      addresses = await userRepository.getAddresses(user.id);
    }

    return this.generateAuthResponse(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        avatar: user.avatar || null,
        memberTier: user.memberTier || user.member_tier || 'Member',
        isVerified: true
      },
      addresses
    );
  }

  /**
   * Retrieves current authenticated user profile from MongoDB.
   */
  async getMe(userId: string): Promise<any> {
    if (isMongoHealthy()) {
      const mongoUser = await UserModel.findOne({ id: userId });
      if (mongoUser) {
        return {
          id: mongoUser.id,
          name: mongoUser.name,
          email: mongoUser.email,
          phone: mongoUser.phone,
          avatar: mongoUser.avatar,
          memberTier: mongoUser.memberTier,
          isVerified: mongoUser.isVerified,
          addresses: mongoUser.addresses,
          loginHistory: mongoUser.loginHistory.slice(-5) // Return last 5 logins
        };
      }
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, 'AUTH_REQUIRED', 'User account not found.');
    }
    const addresses = await userRepository.getAddresses(userId);
    const { password_hash, ...safeUser } = user;
    return {
      ...safeUser,
      addresses
    };
  }

  /**
   * Updates user profile in MongoDB.
   */
  async updateProfile(
    userId: string,
    updates: Partial<{ name: string; phone: string | null; avatar: string | null }>
  ): Promise<any> {
    if (isMongoHealthy()) {
      const updated = await UserModel.findOneAndUpdate(
        { id: userId },
        { $set: updates },
        { new: true }
      );
      if (updated) {
        return {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          avatar: updated.avatar,
          memberTier: updated.memberTier
        };
      }
    }

    const repoUpdated = await userRepository.update(userId, updates);
    if (!repoUpdated) {
      throw new AppError(404, 'AUTH_REQUIRED', 'User account not found.');
    }
    const { password_hash, ...safeUser } = repoUpdated;
    return safeUser;
  }

  /**
   * Adds address to user profile in MongoDB.
   */
  async addAddress(userId: string, addressData: any): Promise<any> {
    const addressId = `addr_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
    const newAddr = {
      id: addressId,
      title: addressData.title || 'Home',
      street: addressData.street,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      country: addressData.country || 'India',
      phone: addressData.phone,
      isDefault: addressData.isDefault || false
    };

    if (isMongoHealthy()) {
      const user = await UserModel.findOne({ id: userId });
      if (user) {
        if (newAddr.isDefault) {
          user.addresses.forEach((a: any) => (a.isDefault = false));
        }
        user.addresses.push(newAddr);
        await user.save();
        return newAddr;
      }
    }

    return await userRepository.addAddress({
      id: addressId,
      userId,
      title: newAddr.title,
      street: newAddr.street,
      city: newAddr.city,
      state: newAddr.state,
      zipCode: newAddr.zipCode,
      country: newAddr.country,
      isDefault: newAddr.isDefault
    });
  }

  /**
   * Deletes address from user profile in MongoDB.
   */
  async deleteAddress(userId: string, addressId: string): Promise<boolean> {
    if (isMongoHealthy()) {
      const result = await UserModel.updateOne(
        { id: userId },
        { $pull: { addresses: { id: addressId } } }
      );
      if (result.modifiedCount > 0) return true;
    }

    const deleted = await userRepository.deleteAddress(addressId, userId);
    if (!deleted) {
      throw new AppError(404, 'VALIDATION_ERROR', 'Address not found or unauthorized.');
    }
    return true;
  }

  /**
   * Refresh Token rotation for continuous secure production sessions.
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;
      const user = isMongoHealthy()
        ? await UserModel.findOne({ id: decoded.userId })
        : await userRepository.findById(decoded.userId);

      if (!user) {
        throw new AppError(401, 'INVALID_TOKEN', 'User session expired or invalidated.');
      }

      const payload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        memberTier: user.memberTier || user.member_tier
      };

      const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRY as any
      });

      return { accessToken };
    } catch {
      throw new AppError(401, 'INVALID_TOKEN', 'Refresh token is invalid or expired.');
    }
  }

  async logout(_userId?: string): Promise<void> {
    return Promise.resolve();
  }

  private generateAuthResponse(
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
      avatar?: string | null;
      memberTier?: string;
      isVerified?: boolean;
    },
    addresses: UserAddressEntity[]
  ): AuthTokens {
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      memberTier: user.memberTier || 'Member'
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY as any
    });

    const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY as any
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        avatar: user.avatar || null,
        memberTier: user.memberTier || 'Member',
        isVerified: user.isVerified || false,
        addresses
      }
    };
  }
}

export const authService = new AuthService();
