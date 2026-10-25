import { Request, Response, NextFunction } from 'express';
import { cartService } from '../services/cart.service.js';
import { ApiResponse } from '../types/api.js';

export class CartController {
  async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await cartService.getCart(req.user!.userId);
      const response: ApiResponse = {
        success: true,
        data: summary,
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId, quantity } = req.body;
      const summary = await cartService.addItem(req.user!.userId, productId, quantity);
      const response: ApiResponse = {
        success: true,
        data: summary,
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const summary = await cartService.updateItemQuantity(req.user!.userId, productId, quantity);
      const response: ApiResponse = {
        success: true,
        data: summary,
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.params;
      const summary = await cartService.removeItem(req.user!.userId, productId);
      const response: ApiResponse = {
        success: true,
        data: summary,
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await cartService.clearCart(req.user!.userId);
      const response: ApiResponse = {
        success: true,
        data: { message: 'Cart cleared successfully.' },
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const cartController = new CartController();
