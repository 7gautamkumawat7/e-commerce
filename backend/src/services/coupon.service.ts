import { couponRepository } from '../repositories/coupon.repository.js';
import { AppError } from '../types/api.js';
import { CouponEntity } from '../types/models.js';

export interface ValidatedCouponResult {
  coupon: CouponEntity;
  discountCents: number;
}

export class CouponService {
  async validateAndCalculateDiscount(
    code: string,
    userId: string,
    subtotalCents: number
  ): Promise<ValidatedCouponResult> {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon || !coupon.is_active) {
      throw new AppError(400, 'COUPON_INVALID', `Coupon code '${code}' is invalid or inactive.`);
    }

    const now = new Date();
    if (new Date(coupon.valid_from) > now || new Date(coupon.valid_until) < now) {
      throw new AppError(400, 'COUPON_EXPIRED', `Coupon code '${code}' has expired.`);
    }

    if (subtotalCents < coupon.min_order_amount_cents) {
      const minInRupees = (coupon.min_order_amount_cents / 100).toFixed(0);
      throw new AppError(
        400,
        'COUPON_INVALID',
        `Minimum order amount of ₹${minInRupees} required to use coupon '${code}'.`
      );
    }

    const totalUsages = await couponRepository.countTotalUsages(coupon.id);
    if (totalUsages >= coupon.usage_limit) {
      throw new AppError(400, 'COUPON_LIMIT_REACHED', 'This coupon has reached its maximum global usage limit.');
    }

    const userUsages = await couponRepository.countUserUsages(coupon.id, userId);
    if (userUsages >= coupon.per_user_limit) {
      throw new AppError(
        400,
        'COUPON_LIMIT_REACHED',
        `You have already reached the redemption limit (${coupon.per_user_limit}x) for coupon '${code}'.`
      );
    }

    // Calculate server-side discount
    let discountCents = 0;
    if (coupon.discount_type === 'PERCENTAGE') {
      discountCents = Math.round((subtotalCents * coupon.discount_value) / 100);
      if (coupon.max_discount_cents > 0 && discountCents > coupon.max_discount_cents) {
        discountCents = coupon.max_discount_cents;
      }
    } else if (coupon.discount_type === 'FIXED') {
      discountCents = coupon.discount_value;
    }

    // Cap discount to subtotal
    discountCents = Math.min(discountCents, subtotalCents);

    return {
      coupon,
      discountCents
    };
  }
}

export const couponService = new CouponService();
