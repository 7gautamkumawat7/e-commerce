import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

export interface IOrderShippingAddress {
  title?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface IOrderPaymentDetails {
  method: 'razorpay' | 'cod' | 'card' | 'upi';
  status: 'pending' | 'captured' | 'failed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export interface ITrackingEvent {
  status: string;
  timestamp: Date;
  location?: string;
  note?: string;
}

export interface IOrder extends Document {
  orderId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: IOrderItem[];
  shippingAddress: IOrderShippingAddress;
  amountSubtotal: number;
  amountDiscount: number;
  amountShipping: number;
  amountTotal: number;
  currency: string;
  paymentDetails: IOrderPaymentDetails;
  orderStatus: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  estimatedDelivery?: Date;
  trackingHistory: ITrackingEvent[];
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
    category: { type: String }
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IOrderShippingAddress>(
  {
    title: { type: String, default: 'Home' },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    phone: { type: String }
  },
  { _id: false }
);

const PaymentDetailsSchema = new Schema<IOrderPaymentDetails>(
  {
    method: { type: String, enum: ['razorpay', 'cod', 'card', 'upi'], default: 'razorpay' },
    status: { type: String, enum: ['pending', 'captured', 'failed', 'refunded'], default: 'pending' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String }
  },
  { _id: false }
);

const TrackingEventSchema = new Schema<ITrackingEvent>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    location: { type: String },
    note: { type: String }
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true, index: true },
    customerPhone: { type: String },
    items: { type: [OrderItemSchema], required: true },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    amountSubtotal: { type: Number, required: true },
    amountDiscount: { type: Number, default: 0 },
    amountShipping: { type: Number, default: 0 },
    amountTotal: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    paymentDetails: { type: PaymentDetailsSchema, required: true },
    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
      index: true
    },
    estimatedDelivery: { type: Date },
    trackingHistory: { type: [TrackingEventSchema], default: [] },
    cancellationReason: { type: String }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
