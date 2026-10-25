import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service.js';
import { ApiResponse } from '../types/api.js';

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.createOrder(req.body, req.user!.userId);
      const response: ApiResponse = {
        success: true,
        data: order,
        meta: { requestId: req.id }
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await orderService.getOrders(req.user!.userId);
      const response: ApiResponse = {
        success: true,
        data: orders,
        meta: {
          requestId: req.id,
          total: orders.length
        }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user!.userId);
      const response: ApiResponse = {
        success: true,
        data: order,
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.cancelOrder(req.params.id, req.user!.userId, req.body.reason);
      const response: ApiResponse = {
        success: true,
        data: order,
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();
