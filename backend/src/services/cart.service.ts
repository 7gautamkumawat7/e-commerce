import { cartRepository, CartItemWithProduct } from '../repositories/cart.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { AppError } from '../types/api.js';

export interface CartSummary {
  items: CartItemWithProduct[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  freeShippingThresholdCents: number;
  freeShippingRemainingCents: number;
  freeShippingProgress: number;
  totalItemsCount: number;
}

export class CartService {
  async getCart(userId: string): Promise<CartSummary> {
    const cart = await cartRepository.getOrCreateCart(userId);
    const items = await cartRepository.getCartItems(cart.id);

    const subtotalCents = items.reduce((acc, item) => acc + item.price_cents * item.quantity, 0);
    const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

    const freeShippingThresholdCents = 49900; // ₹499
    const shippingCents = subtotalCents === 0 || subtotalCents >= freeShippingThresholdCents ? 0 : 4900; // ₹49
    const totalCents = subtotalCents + shippingCents;

    const freeShippingProgress = Math.min(100, Math.round((subtotalCents / freeShippingThresholdCents) * 100));
    const freeShippingRemainingCents = Math.max(0, freeShippingThresholdCents - subtotalCents);

    return {
      items,
      subtotalCents,
      shippingCents,
      totalCents,
      freeShippingThresholdCents,
      freeShippingRemainingCents,
      freeShippingProgress,
      totalItemsCount
    };
  }

  async addItem(userId: string, productId: string, quantity: number = 1): Promise<CartSummary> {
    if (quantity <= 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Item quantity must be greater than zero.');
    }

    const product = await productRepository.findById(productId);
    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
    }

    if (product.stock_quantity < quantity) {
      throw new AppError(
        400,
        'OUT_OF_STOCK',
        `Insufficient inventory. Only ${product.stock_quantity} available in stock.`
      );
    }

    const cart = await cartRepository.getOrCreateCart(userId);
    await cartRepository.addItem(cart.id, productId, quantity);

    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<CartSummary> {
    const cart = await cartRepository.getOrCreateCart(userId);

    if (quantity > 0) {
      const product = await productRepository.findById(productId);
      if (!product) {
        throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
      }
      if (product.stock_quantity < quantity) {
        throw new AppError(
          400,
          'OUT_OF_STOCK',
          `Cannot increase quantity. Only ${product.stock_quantity} units available.`
        );
      }
    }

    await cartRepository.updateItemQuantity(cart.id, productId, quantity);
    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string): Promise<CartSummary> {
    const cart = await cartRepository.getOrCreateCart(userId);
    await cartRepository.removeItem(cart.id, productId);
    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await cartRepository.getOrCreateCart(userId);
    await cartRepository.clearCart(cart.id);
  }
}

export const cartService = new CartService();
