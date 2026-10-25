import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service.js';
import { refundService } from '../services/refund.service.js';
import { ApiResponse, AppError } from '../types/api.js';
import { env } from '../config/env.js';

export class PaymentController {
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await paymentService.createPaymentOrder(req.user!.userId, req.body);
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

  async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await paymentService.verifyPayment(req.user!.userId, req.body);
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

  async sandboxSimulate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (env.NODE_ENV === 'production') {
        throw new AppError(403, 'FORBIDDEN', 'Sandbox simulation endpoint is disabled in production environments.');
      }
      const { orderId, razorpayOrderId } = req.body;
      const razorpayPaymentId = `pay_sbx_${Date.now()}`;
      const razorpaySignature = paymentService.generateTestSignature(razorpayOrderId, razorpayPaymentId);
      const result = await paymentService.verifyPayment(req.user!.userId, {
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      });
      const response: ApiResponse = {
        success: true,
        data: {
          ...result,
          razorpayPaymentId,
          razorpaySignature,
          mode: 'DEMO_PAYMENT_SANDBOX'
        },
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async createRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refund = await refundService.processRefund(req.user!.userId, req.params.id, req.body);
      const response: ApiResponse = {
        success: true,
        data: refund,
        meta: { requestId: req.id }
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getRefunds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refunds = await refundService.getRefunds(req.user!.userId);
      const response: ApiResponse = {
        success: true,
        data: refunds,
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const paymentController = new PaymentController();
