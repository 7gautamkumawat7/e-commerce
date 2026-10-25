import { v4 as uuidv4 } from 'uuid';
import { orderRepository, OrderWithItems } from '../repositories/order.repository.js';
import { paymentRepository } from '../repositories/payment.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { OrderModel, IOrder } from '../models/order.model.js';
import { UserModel } from '../models/user.model.js';
import { isMongoHealthy } from '../db/mongodb.js';
import { transaction } from '../db/connection.js';
import { AppError } from '../types/api.js';
import { OrderStatus } from '../types/states.js';
import { logger } from '../utils/logger.js';

export class OrderService {
  /**
   * Creates a new order directly in MongoDB orders collection.
   */
  async createOrder(data: any, userId: string): Promise<any> {
    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Resolve customer information
    let customerName = data.customerName || 'Customer';
    let customerEmail = data.customerEmail || '';
    let customerPhone = data.customerPhone || data.shippingAddress?.phone || '';

    if (isMongoHealthy()) {
      const user = await UserModel.findOne({ id: userId });
      if (user) {
        customerName = user.name || customerName;
        customerEmail = user.email || customerEmail;
        customerPhone = user.phone || customerPhone;
      }
    }

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);

    const initialTracking = [
      {
        status: 'Order Placed',
        timestamp: new Date(),
        location: `${data.shippingAddress?.city || 'Warehouse'}, India`,
        note: 'Your order has been placed and received by our fulfillment center.'
      }
    ];

    if (isMongoHealthy()) {
      try {
        const mongoOrder = await OrderModel.create({
          orderId,
          userId,
          customerName,
          customerEmail,
          customerPhone,
          items: data.items,
          shippingAddress: data.shippingAddress,
          amountSubtotal: data.amountSubtotal,
          amountDiscount: data.amountDiscount || 0,
          amountShipping: data.amountShipping || 0,
          amountTotal: data.amountTotal,
          currency: 'INR',
          paymentDetails: data.paymentDetails || {
            method: data.paymentMethod || 'razorpay',
            status: data.paymentDetails?.razorpayPaymentId ? 'captured' : 'pending',
            razorpayOrderId: data.paymentDetails?.razorpayOrderId,
            razorpayPaymentId: data.paymentDetails?.razorpayPaymentId,
            razorpaySignature: data.paymentDetails?.razorpaySignature
          },
          orderStatus: data.paymentDetails?.razorpayPaymentId ? 'confirmed' : 'placed',
          estimatedDelivery,
          trackingHistory: initialTracking
        });

        logger.info({ orderId, userId, amountTotal: data.amountTotal }, 'Saved order in MongoDB orders collection');
        return mongoOrder.toJSON();
      } catch (err: any) {
        logger.error({ err: err.message }, 'Failed saving order to MongoDB, proceeding to fallback');
      }
    }

    // In-memory or fallback return
    return {
      orderId,
      userId,
      customerName,
      customerEmail,
      items: data.items,
      shippingAddress: data.shippingAddress,
      amountSubtotal: data.amountSubtotal,
      amountDiscount: data.amountDiscount || 0,
      amountShipping: data.amountShipping || 0,
      amountTotal: data.amountTotal,
      currency: 'INR',
      paymentDetails: data.paymentDetails || { method: 'razorpay', status: 'pending' },
      orderStatus: 'placed',
      estimatedDelivery,
      trackingHistory: initialTracking,
      createdAt: new Date()
    };
  }

  /**
   * Retrieves all orders for the authenticated user from MongoDB.
   */
  async getOrders(userId: string): Promise<any[]> {
    if (isMongoHealthy()) {
      const mongoOrders = await OrderModel.find({ userId }).sort({ createdAt: -1 });
      if (mongoOrders && mongoOrders.length > 0) {
        return mongoOrders.map(o => o.toJSON());
      }
    }

    try {
      const repoOrders = await orderRepository.findByUserId(userId);
      return repoOrders;
    } catch {
      return [];
    }
  }

  /**
   * Retrieves an order by ID with ownership verification.
   */
  async getOrderById(orderId: string, userId: string): Promise<any> {
    if (isMongoHealthy()) {
      const mongoOrder = await OrderModel.findOne({ orderId });
      if (mongoOrder) {
        if (mongoOrder.userId !== userId) {
          throw new AppError(403, 'FORBIDDEN', 'You do not have permission to access this order.');
        }
        return mongoOrder.toJSON();
      }
    }

    const order = await orderRepository.getOrderWithItems(orderId);
    if (!order) {
      throw new AppError(404, 'ORDER_NOT_FOUND', `Order with ID '${orderId}' not found.`);
    }

    // Server-side Ownership / Authorization check
    if (order.user_id !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to access this order.');
    }

    const payment = await paymentRepository.findByOrderId(orderId);

    return {
      ...order,
      payment: payment
        ? {
            id: payment.id,
            status: payment.status,
            amountCents: payment.amount_cents,
            currency: payment.currency,
            razorpayPaymentId: payment.razorpay_payment_id,
            method: payment.method,
            createdAt: payment.created_at
          }
        : null
    };
  }

  /**
   * Cancels an order with status checks and tracking history updates in MongoDB.
   */
  async cancelOrder(orderId: string, userId: string, reason?: string): Promise<any> {
    if (isMongoHealthy()) {
      const mongoOrder = await OrderModel.findOne({ orderId });
      if (mongoOrder) {
        if (mongoOrder.userId !== userId) {
          throw new AppError(403, 'FORBIDDEN', 'You do not have permission to cancel this order.');
        }

        if (mongoOrder.orderStatus === 'cancelled') {
          throw new AppError(400, 'ORDER_ALREADY_CANCELLED', 'This order is already cancelled.');
        }

        if (mongoOrder.orderStatus === 'delivered') {
          throw new AppError(400, 'ORDER_NOT_CANCELLABLE', 'Delivered orders cannot be cancelled.');
        }

        mongoOrder.orderStatus = 'cancelled';
        mongoOrder.cancellationReason = reason || 'Cancelled by customer';
        mongoOrder.trackingHistory.push({
          status: 'Order Cancelled',
          timestamp: new Date(),
          location: 'Customer Request',
          note: reason || 'Order was cancelled by the customer.'
        });
        await mongoOrder.save();
        logger.info({ orderId, userId, reason }, 'Order cancelled in MongoDB');
        return mongoOrder.toJSON();
      }
    }

    const order = await orderRepository.getOrderWithItems(orderId);
    if (!order) {
      throw new AppError(404, 'ORDER_NOT_FOUND', `Order with ID '${orderId}' not found.`);
    }

    if (order.user_id !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to cancel this order.');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new AppError(400, 'ORDER_ALREADY_CANCELLED', 'This order is already cancelled.');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new AppError(400, 'ORDER_NOT_CANCELLABLE', 'Delivered orders cannot be cancelled.');
    }

    return await transaction(async (client) => {
      // 1. Update order status to CANCELLED
      const updatedOrder = await orderRepository.updateStatus(orderId, OrderStatus.CANCELLED, client);

      // 2. If the order was CONFIRMED or later, inventory was already deducted -> restore it atomically!
      if (order.status !== OrderStatus.CREATED) {
        for (const item of order.items) {
          await productRepository.atomicRestoreStock(item.product_id, item.quantity, client);
        }
        logger.info({ orderId, itemsCount: order.items.length }, 'Restored product inventory for cancelled order');
      }

      // 3. If there is a payment, mark payment cancelled if not captured
      const payment = await paymentRepository.findByOrderId(orderId, client);
      if (payment && (payment.status === 'CREATED' || payment.status === 'PENDING')) {
        await paymentRepository.updateStatus(payment.id, 'CANCELLED', { errorDescription: reason || 'Order cancelled by customer' }, client);
      }

      logger.info({ orderId, userId, reason }, 'Order cancelled successfully');

      return {
        ...updatedOrder,
        items: order.items
      };
    });
  }
}

export const orderService = new OrderService();
