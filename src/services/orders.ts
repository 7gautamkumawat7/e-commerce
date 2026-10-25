import type { Order, CartItem } from '../types.js';
import { getCurrentUser } from './auth.js';
import { ordersApi } from './api.js';

let inMemoryOrders: Order[] = [];
let isOrdersLoaded = false;

function mapApiOrderToFrontendOrder(apiOrder: any): Order {
  let address = 'Primary Delivery Address';
  if (apiOrder.shippingAddress) {
    if (typeof apiOrder.shippingAddress === 'string') {
      address = apiOrder.shippingAddress;
    } else {
      address = `${apiOrder.shippingAddress.street || ''}, ${apiOrder.shippingAddress.city || ''}, ${apiOrder.shippingAddress.state || ''} ${apiOrder.shippingAddress.zipCode || ''}`;
    }
  } else if (apiOrder.shipping_address_json) {
    address = typeof apiOrder.shipping_address_json === 'string'
      ? apiOrder.shipping_address_json
      : `${apiOrder.shipping_address_json.street || ''}, ${apiOrder.shipping_address_json.city || ''}, ${apiOrder.shipping_address_json.state || ''} ${apiOrder.shipping_address_json.zipCode || ''}`;
  }

  const dateObj = apiOrder.createdAt || apiOrder.created_at ? new Date(apiOrder.createdAt || apiOrder.created_at) : new Date();
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  let displayStatus: Order['status'] = 'Processing';
  const rawStatus = (apiOrder.orderStatus || apiOrder.status || '').toLowerCase();
  if (rawStatus === 'delivered') displayStatus = 'Delivered';
  else if (rawStatus === 'shipped') displayStatus = 'Shipped';
  else if (rawStatus === 'out_for_delivery' || rawStatus === 'out for delivery') displayStatus = 'Out for Delivery';
  else if (rawStatus === 'cancelled') displayStatus = 'Cancelled';
  else if (rawStatus === 'confirmed' || rawStatus === 'placed' || rawStatus === 'processing') displayStatus = 'Processing';

  const subtotal = apiOrder.amountSubtotal !== undefined ? apiOrder.amountSubtotal : (apiOrder.subtotal_cents || 0) / 100;
  const shipping = apiOrder.amountShipping !== undefined ? apiOrder.amountShipping : (apiOrder.shipping_cents || 0) / 100;
  const discount = apiOrder.amountDiscount !== undefined ? apiOrder.amountDiscount : (apiOrder.discount_cents || 0) / 100;
  const total = apiOrder.amountTotal !== undefined ? apiOrder.amountTotal : (apiOrder.total_cents || 0) / 100;

  const items = (apiOrder.items || []).map((item: any) => ({
    productId: item.productId || item.product_id,
    name: item.name || item.product_name,
    price: item.price !== undefined ? item.price : (item.price_cents || 0) / 100,
    quantity: item.quantity,
    image: item.image
  }));

  return {
    id: apiOrder.orderId || apiOrder.order_number || apiOrder.id,
    userId: apiOrder.userId || apiOrder.user_id,
    date: dateStr,
    status: displayStatus,
    items,
    subtotal,
    shipping,
    discount,
    total,
    trackingNumber: apiOrder.trackingNumber || apiOrder.tracking_number || `TRK-IN-${(apiOrder.orderId || apiOrder.id || '').slice(-8)}`,
    shippingAddress: address,
    paymentId: apiOrder.paymentDetails?.razorpayPaymentId || apiOrder.payment_id,
    paymentMethod: apiOrder.paymentDetails?.method || apiOrder.payment_method
  };
}

export async function fetchUserOrders(): Promise<Order[]> {
  try {
    const list = await ordersApi.getOrders();
    inMemoryOrders = list.map(mapApiOrderToFrontendOrder);
    isOrdersLoaded = true;
    return inMemoryOrders;
  } catch {
    return inMemoryOrders;
  }
}

export function getUserOrders(userId?: string): Order[] {
  const current = getCurrentUser();
  if (!current && !userId) {
    return [];
  }
  const targetId = userId || current!.id;

  if (!isOrdersLoaded) {
    fetchUserOrders();
  }

  return inMemoryOrders.filter((o) => o.userId === targetId);
}

export function addLocalOrder(order: Order): void {
  inMemoryOrders.unshift(order);
}

export function createOrderFromCart(
  cartItems: CartItem[],
  subtotal: number,
  shipping: number,
  discount: number,
  total: number,
  customAddress?: string,
  paymentId?: string,
  paymentMethod?: string
): Order {
  const user = getCurrentUser();
  const userId = user ? user.id : 'guest';

  const defaultAddr = user?.addresses?.find((a) => a.isDefault);
  const formattedAddress =
    customAddress ||
    (defaultAddr
      ? `${defaultAddr.street}, ${defaultAddr.city}, ${defaultAddr.state} ${defaultAddr.zipCode}`
      : '123 MG Road, Mumbai, MH 400001');

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const orderId = `ORD-${now.getFullYear()}-${randomDigits}`;

  const newOrder: Order = {
    id: orderId,
    userId,
    date: dateStr,
    status: 'Processing',
    items: cartItems.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })),
    subtotal,
    shipping,
    discount,
    total,
    trackingNumber: `TRK-IN-${Math.floor(10000000 + Math.random() * 90000000)}`,
    shippingAddress: formattedAddress,
    paymentId,
    paymentMethod: paymentMethod || 'razorpay'
  };

  addLocalOrder(newOrder);

  // Save to MongoDB orders collection via backend API
  if (user) {
    ordersApi.createOrder({
      items: newOrder.items,
      shippingAddress: {
        street: formattedAddress.split(',')[0]?.trim() || formattedAddress,
        city: defaultAddr?.city || 'Mumbai',
        state: defaultAddr?.state || 'MH',
        zipCode: defaultAddr?.zipCode || '400001',
        country: defaultAddr?.country || 'India',
        phone: user.phone
      },
      amountSubtotal: subtotal,
      amountDiscount: discount,
      amountShipping: shipping,
      amountTotal: total,
      paymentMethod: paymentMethod || 'razorpay',
      paymentDetails: {
        method: paymentMethod || 'razorpay',
        razorpayPaymentId: paymentId
      }
    }).catch((err) => {
      console.warn('Failed writing order to MongoDB:', err);
    });
  }

  return newOrder;
}
