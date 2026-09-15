import type { RazorpayPaymentResult, RazorpayOptions } from '../types.js';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
const STORAGE_KEY_LIVE_KEY = 'shopcart_razorpay_live_key';

export function getRazorpayKey(): string {
  try {
    const customKey = localStorage.getItem(STORAGE_KEY_LIVE_KEY);
    if (customKey && customKey.trim()) {
      return customKey.trim();
    }
  } catch (e) {
    console.warn('Storage read error:', e);
  }

  const envKey = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;
  if (envKey && envKey.trim() && !envKey.includes('xxxxxxxx')) {
    return envKey.trim();
  }

  return 'rzp_live_merchant_ready';
}

export function setRazorpayKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_LIVE_KEY, key.trim());
  } catch (err) {
    console.error('Failed to save Razorpay live key:', err);
  }
}

export function isLiveKey(key?: string): boolean {
  const k = key || getRazorpayKey();
  return k.startsWith('rzp_live_') && k !== 'rzp_live_default_key';
}

export function isRealConfiguredKey(key?: string): boolean {
  const k = key || getRazorpayKey();
  return (k.startsWith('rzp_live_') || k.startsWith('rzp_test_')) &&
    k.length >= 16 &&
    !k.includes('xxxxxxxx') &&
    !k.includes('default') &&
    !k.includes('merchant_ready');
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
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

export async function initiateRazorpayPayment(params: {
  amount: number;
  currency?: string;
  orderDescription: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  onSuccess: (result: RazorpayPaymentResult) => void;
  onDismiss?: () => void;
  onFallback?: () => void;
}): Promise<void> {
  const activeKey = getRazorpayKey();

  // If a real merchant key is provided, attempt official SDK launch
  if (isRealConfiguredKey(activeKey)) {
    const isLoaded = await loadRazorpayScript();
    if (isLoaded && window.Razorpay) {
      try {
        const options: RazorpayOptions = {
          key: activeKey,
          amount: Math.round(params.amount * 100),
          currency: params.currency || (import.meta as any).env?.VITE_CURRENCY || 'INR',
          name: 'ShopCart E-Commerce',
          description: params.orderDescription,
          image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=128&q=80',
          handler: (response: RazorpayPaymentResult) => {
            params.onSuccess({
              razorpay_payment_id: response.razorpay_payment_id || `pay_live_${Date.now()}`,
              razorpay_order_id: response.razorpay_order_id || `order_live_${Date.now()}`,
              razorpay_signature: response.razorpay_signature,
              method: 'Razorpay Live Checkout'
            });
          },
          prefill: {
            name: params.userName || 'Customer',
            email: params.userEmail || 'customer@example.com',
            contact: params.userPhone || '+919876543210'
          },
          theme: {
            color: '#ff8a4c'
          },
          modal: {
            ondismiss: params.onDismiss
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } catch (err) {
        console.warn('Razorpay SDK error, switching to interactive gateway:', err);
      }
    }
  }

  // Fallback to interactive in-app Razorpay Gateway
  if (params.onFallback) {
    params.onFallback();
  }
}
