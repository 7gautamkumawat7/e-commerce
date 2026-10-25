import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAddress {
  id: string;
  title: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface ILoginHistory {
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  method: 'password' | 'otp' | 'oauth';
}

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  isVerified: boolean;
  memberTier: string;
  avatar?: string;
  roles: string[];
  addresses: IUserAddress[];
  loginHistory: ILoginHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const UserAddressSchema = new Schema<IUserAddress>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, default: 'Home' },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    phone: { type: String },
    isDefault: { type: Boolean, default: false }
  },
  { _id: false }
);

const LoginHistorySchema = new Schema<ILoginHistory>(
  {
    timestamp: { type: Date, default: Date.now },
    ip: { type: String },
    userAgent: { type: String },
    method: { type: String, enum: ['password', 'otp', 'oauth'], default: 'password' }
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String },
    phone: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    memberTier: { type: String, default: 'Member' },
    avatar: { type: String },
    roles: { type: [String], default: ['customer'] },
    addresses: { type: [UserAddressSchema], default: [] },
    loginHistory: { type: [LoginHistorySchema], default: [] }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.password;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
