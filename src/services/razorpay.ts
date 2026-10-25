import type { RazorpayPaymentResult, RazorpayOptions } from '../types.js';
import { paymentsApi } from './api.js';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export function getRazorpayKey(): string {
  return 'rzp_test_shopcartDevKey01';
}

export function setRazorpayKey(_key: string): void {
  // Key is managed authoritatively via backend environment variables
}

export function isLiveKey(_key?: string): boolean {
  return false;
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Razorpay SDK script could not be loaded from CDN.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Initiates the backend-driven Razorpay checkout flow.
 * 1. Creates order via backend: POST /api/payments/create-order
 * 2. Launches official Razorpay Checkout modal
 * 3. Verifies HMAC SHA256 signature server-side: POST /api/payments/verify
 */
export async function initiateRazorpayPayment(params: {
  amount: number;
  currency?: string;
  orderDescription: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  couponCode?: string;
  onSuccess: (result: RazorpayPaymentResult) => void;
  onFailure?: (error: string) => void;
  onDismiss?: () => void;
  onFallback?: (backendOrderData: any) => void;
}): Promise<void> {
  try {
    // 1. Authoritative Backend Order Creation
    const orderData: any = await paymentsApi.createOrder({
      couponCode: params.couponCode
    });

    const isLoaded = await loadRazorpayScript();
    const RazorpayConstructor = (window as any).Razorpay;

    if (isLoaded && RazorpayConstructor && orderData.keyId) {
      try {
        const options: RazorpayOptions = {
          key: orderData.keyId,
          amount: orderData.amountCents,
          currency: orderData.currency || 'INR',
          name: 'ShopCart E-Commerce',
          description: params.orderDescription || `Order #${orderData.orderNumber}`,
          image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=128&q=80',
          order_id: orderData.razorpayOrderId,
          handler: async (response: RazorpayPaymentResult) => {
            try {
              // 2. Authoritative Server-Side HMAC Signature Verification
              const verifyRes: any = await paymentsApi.verifyPayment({
                orderId: orderData.orderId,
                razorpayOrderId: response.razorpay_order_id || '',
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature || ''
              });

              if (verifyRes.verified) {
                params.onSuccess({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  method: 'Razorpay Verified'
                });
              } else {
                params.onFailure?.('Payment verification failed on server.');
              }
            } catch (err: any) {
              params.onFailure?.(err.message || 'Server signature verification failed.');
            }
          },
          prefill: {
            name: params.userName || 'Customer',
            email: params.userEmail || 'customer@shopcart.com',
            contact: params.userPhone || '+919876543210'
          },
          theme: {
            color: '#ff8a4c'
          },
          modal: {
            ondismiss: params.onDismiss
          }
        };

        const rzp = new RazorpayConstructor(options);
        rzp.open();
        return;
      } catch (sdkError: any) {
        console.warn('Razorpay SDK modal error; invoking Sandbox UI:', sdkError);
      }
    }

    // Fallback to Sandboxed UI if popup blocked or offline test keys
    if (params.onFallback) {
      params.onFallback(orderData);
    }
  } catch (err: any) {
    params.onFailure?.(err.message || 'Failed to initialize payment with backend.');
  }
}
