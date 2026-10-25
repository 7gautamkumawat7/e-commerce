import { Request, Response, NextFunction } from 'express';
import { couponService } from '../services/coupon.service.js';
import { cartService } from '../services/cart.service.js';
import { ApiResponse } from '../types/api.js';

export class CouponController {
  async applyCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.body;
      const cart = await cartService.getCart(req.user!.userId);

      const result = await couponService.validateAndCalculateDiscount(
        code,
        req.user!.userId,
        cart.subtotalCents
      );

      const response: ApiResponse = {
        success: true,
        data: {
          code: result.coupon.code,
          discountType: result.coupon.discount_type,
          discountValue: result.coupon.discount_value,
          discountCents: result.discountCents,
          subtotalCents: cart.subtotalCents,
          estimatedTotalCents: Math.max(0, cart.totalCents - result.discountCents)
        },
        meta: { requestId: req.id }
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const couponController = new CouponController();
