import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { env } from '../config/env.js';
import { ApiResponse } from '../types/api.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientInfo = {
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        userAgent: (req.headers['user-agent'] as string) || 'Browser'
      };
      const result = await authService.register(req.body, clientInfo);

      // Set HTTP-only secure cookie for tokens
      res.cookie('access_token', result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000 // 15 mins
      });
      res.cookie('refresh_token', result.refreshToken, COOKIE_OPTIONS);

      const response: ApiResponse = {
        success: true,
        data: result,
        meta: { requestId: req.id }
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientInfo = {
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        userAgent: (req.headers['user-agent'] as string) || 'Browser'
      };
      const result = await authService.login(req.body, clientInfo);

      res.cookie('access_token', result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000
      });
      res.cookie('refresh_token', result.refreshToken, COOKIE_OPTIONS);

      const response: ApiResponse = {
        success: true,
        data: result,
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.sendOtp(req.body.email);
      const response: ApiResponse = {
        success: true,
        data: result,
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientInfo = {
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        userAgent: (req.headers['user-agent'] as string) || 'Browser'
      };
      const result = await authService.verifyOtpAndLogin(req.body, clientInfo);

      res.cookie('access_token', result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000
      });
      res.cookie('refresh_token', result.refreshToken, COOKIE_OPTIONS);

      const response: ApiResponse = {
        success: true,
        data: result,
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.refresh_token || req.body?.refreshToken;
      if (!token) {
        res.status(401).json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'No refresh token provided.' }
        });
        return;
      }
      const result = await authService.refreshToken(token);
      res.cookie('access_token', result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000
      });
      res.status(200).json({
        success: true,
        data: result,
        meta: { requestId: req.id }
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getMe(req.user!.userId);
      const response: ApiResponse = {
        success: true,
        data: user,
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await authService.updateProfile(req.user!.userId, req.body);
      const response: ApiResponse = {
        success: true,
        data: updated,
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async addAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const address = await authService.addAddress(req.user!.userId, req.body);
      const response: ApiResponse = {
        success: true,
        data: address,
        meta: { requestId: req.id }
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.deleteAddress(req.user!.userId, req.params.id);
      const response: ApiResponse = {
        success: true,
        data: { message: 'Address removed successfully.' },
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        await authService.logout(req.user.userId);
      }
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      const response: ApiResponse = {
        success: true,
        data: { message: 'Logged out successfully.' },
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
