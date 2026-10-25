import React, { useState, useEffect } from 'react';
import type { RazorpayPaymentResult } from '../types.js';
import { initiateRazorpayPayment } from '../services/razorpay.js';
import { paymentsApi } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';

interface RazorpayModalProps {
  isOpen: boolean;
  amount: number;
  currency?: string;
  userName?: string;
  userEmail?: string;
  couponCode?: string;
  onSuccess: (result: RazorpayPaymentResult) => void;
  onClose: () => void;
}

type PaymentTab = 'upi' | 'card' | 'netbanking' | 'official';

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  amount,
  currency = 'INR',
  userName = 'Customer',
  userEmail = 'customer@shopcart.dev',
  couponCode,
  onSuccess,
  onClose
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<PaymentTab>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');

  // Form states
  const [upiId, setUpiId] = useState('demo@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 8821 9012 4410');
  const [cardName, setCardName] = useState(userName);
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('782');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setProcessStep('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currencySymbol = currency === 'USD' ? '$' : '₹';
  const formattedAmount = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  /**
   * Executes a real server-verified transaction through the backend API.
   * Creates order on backend, deducts stock atomically, verifies signature, confirms order.
   */
  const handleExecuteSandboxPayment = async (methodName: string) => {
    setIsProcessing(true);
    setProcessStep('1/3 Creating server-authoritative order in PostgreSQL...');

    try {
      // 1. Authoritative Backend Order Creation
      const orderData: any = await paymentsApi.createOrder({ couponCode });
      setProcessStep(`2/3 Created Order #${orderData.orderNumber} (RZP: ${orderData.razorpayOrderId.slice(0, 14)}...)`);

      await new Promise((r) => setTimeout(r, 400));
      setProcessStep('3/3 Verifying HMAC-SHA256 signature & deducting inventory atomically...');

      // 2. Authoritative Backend Sandbox Verification (Server-Side Signed)
      const verifyRes: any = await paymentsApi.sandboxSimulate({
        orderId: orderData.orderId,
        razorpayOrderId: orderData.razorpayOrderId
      });

      if (verifyRes.verified) {
        showToast(
          `🎉 Payment Verified by Server! Order #${orderData.orderNumber} confirmed.`,
          'success'
        );
        onSuccess({
          razorpay_payment_id: verifyRes.razorpayPaymentId || `pay_sbx_${orderData.orderNumber}`,
          razorpay_order_id: orderData.razorpayOrderId,
          method: `Sandbox - ${methodName}`
        });
      }
    } catch (err: any) {
      showToast(err.message || 'Payment verification failed on server.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Launches official Razorpay Checkout SDK modal window
   */
  const handleLaunchOfficialSdk = () => {
    setIsProcessing(true);
    setProcessStep('Launching official Razorpay Checkout popup...');

    initiateRazorpayPayment({
      amount,
      currency,
      orderDescription: `ShopCart Order (${currencySymbol}${formattedAmount})`,
      userName,
      userEmail,
      couponCode,
      onSuccess: (result) => {
        setIsProcessing(false);
        showToast(`🎉 Payment Verified! Transaction: ${result.razorpay_payment_id}`, 'success');
        onSuccess(result);
      },
      onFailure: (errMsg) => {
        setIsProcessing(false);
        showToast(errMsg, 'error');
      },
      onDismiss: () => {
        setIsProcessing(false);
        showToast('Payment window dismissed.', 'info');
      },
      onFallback: () => {
        setIsProcessing(false);
        showToast('Razorpay popup unavailable. Switched to Sandbox Test Mode.', 'info');
        setActiveTab('upi');
      }
    });
  };

  return (
    <div className="modal-overlay open" id="razorpay-modal-overlay" onClick={onClose}>
      <div
        className="razorpay-checkout-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="rzp-header-main">
          <div className="rzp-top-row">
            <div className="rzp-brand-tag">
              <span className="rzp-logo-shield">🛡️</span>
              <div className="rzp-brand-text">
                <h3>ShopCart Payment Gateway</h3>
                <span>Server-Verified Razorpay Architecture</span>
              </div>
            </div>
            <div className="rzp-mode-pill">
              <span className="status-indicator live-on"></span>
              <strong>SANDBOX TEST MODE</strong>
            </div>
            <button className="rzp-close-x" onClick={onClose} aria-label="Cancel Checkout">
              ✕
            </button>
          </div>

          <div className="rzp-amount-banner">
            <div className="amount-col">
              <span className="amount-label">AMOUNT PAYABLE (SERVER-CALCULATED)</span>
              <div className="amount-val">
                {currencySymbol}
                {formattedAmount}
                <small>{currency}</small>
              </div>
            </div>
            <div className="customer-col">
              <span>👤 {userName}</span>
              <span>✉️ {userEmail}</span>
            </div>
          </div>
        </div>

        {/* Informative Security Banner */}
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.08)',
            borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
            padding: '8px 16px',
            fontSize: '0.8rem',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🔒</span>
          <span>
            <strong>DEMO PAYMENT UI:</strong> Orders, stock deductions, and HMAC signature validations are verified server-side via PostgreSQL & Redis.
          </span>
        </div>

        {/* Processing State */}
        {isProcessing ? (
          <div className="rzp-processing-view">
            <div className="rzp-loader-ring"></div>
            <h3>Processing Secure Payment</h3>
            <p className="process-step-text">{processStep}</p>
            <div className="security-badges-row">
              <span>🔒 HMAC-SHA256 Timing-Safe</span>
              <span>🏛️ PostgreSQL ACID Transaction</span>
              <span>⚡ Redis Cache & Lock</span>
            </div>
          </div>
        ) : (
          <div className="rzp-modal-content">
            {/* Payment Method Selector Sidebar / Tabs */}
            <div className="rzp-payment-tabs">
              <button
                className={`rzp-tab-btn ${activeTab === 'upi' ? 'active' : ''}`}
                onClick={() => setActiveTab('upi')}
              >
                <span className="tab-icon">⚡</span>
                <div className="tab-info">
                  <strong>UPI / QR Code</strong>
                  <small>GPay, PhonePe, Paytm</small>
                </div>
              </button>

              <button
                className={`rzp-tab-btn ${activeTab === 'card' ? 'active' : ''}`}
                onClick={() => setActiveTab('card')}
              >
                <span className="tab-icon">💳</span>
                <div className="tab-info">
                  <strong>Cards</strong>
                  <small>Visa, Mastercard, RuPay</small>
                </div>
              </button>

              <button
                className={`rzp-tab-btn ${activeTab === 'netbanking' ? 'active' : ''}`}
                onClick={() => setActiveTab('netbanking')}
              >
                <span className="tab-icon">🏛️</span>
                <div className="tab-info">
                  <strong>Netbanking</strong>
                  <small>HDFC, ICICI, SBI, Axis</small>
                </div>
              </button>

              <button
                className={`rzp-tab-btn ${activeTab === 'official' ? 'active' : ''}`}
                onClick={() => setActiveTab('official')}
              >
                <span className="tab-icon">🚀</span>
                <div className="tab-info">
                  <strong>Razorpay SDK</strong>
                  <small>Official Popup Window</small>
                </div>
              </button>
            </div>

            {/* TAB CONTENT PANELS */}
            <div className="rzp-tab-panels">
              {/* TAB 1: UPI */}
              {activeTab === 'upi' && (
                <div className="panel-tab-body">
                  <div className="upi-content-grid">
                    <div className="qr-box-wrap">
                      <div className="qr-sim-box">
                        <div className="qr-graphic">
                          <div className="qr-finder top-left"></div>
                          <div className="qr-finder top-right"></div>
                          <div className="qr-finder bottom-left"></div>
                          <div className="qr-center-logo">₹</div>
                        </div>
                      </div>
                      <span className="qr-hint">Scan with any UPI App</span>
                    </div>

                    <div className="upi-id-form">
                      <label htmlFor="upi-input">Enter UPI ID / VPA</label>
                      <input
                        type="text"
                        id="upi-input"
                        placeholder="username@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                      <div className="quick-upi-pills">
                        {['@okaxis', '@okhdfcbank', '@paytm', '@ybl'].map((handle) => (
                          <button
                            key={handle}
                            type="button"
                            className="upi-pill"
                            onClick={() => setUpiId(`alex${handle}`)}
                          >
                            {handle}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="rzp-submit-pay-btn"
                        onClick={() => handleExecuteSandboxPayment(`UPI (${upiId || 'QR'})`)}
                      >
                        ⚡ Authorize & Pay {currencySymbol}{formattedAmount} with UPI
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CARDS */}
              {activeTab === 'card' && (
                <div className="panel-tab-body">
                  <div className="visual-credit-card">
                    <div className="card-chip">💳 CHIP</div>
                    <div className="card-number-display">{cardNumber || '•••• •••• •••• ••••'}</div>
                    <div className="card-meta-row">
                      <div>
                        <span className="card-lbl">CARDHOLDER</span>
                        <strong className="card-val">{cardName || 'YOUR NAME'}</strong>
                      </div>
                      <div>
                        <span className="card-lbl">EXPIRES</span>
                        <strong className="card-val">{cardExpiry || 'MM/YY'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="card-inputs-grid">
                    <div className="form-group full-width">
                      <label>Card Number</label>
                      <input
                        type="text"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 8821 9012 4410"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Alex Johnson"
                      />
                    </div>
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV / CVC</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rzp-submit-pay-btn"
                    onClick={() => handleExecuteSandboxPayment('Credit/Debit Card')}
                  >
                    💳 Authorize & Pay {currencySymbol}{formattedAmount} with Card
                  </button>
                </div>
              )}

              {/* TAB 3: NETBANKING */}
              {activeTab === 'netbanking' && (
                <div className="panel-tab-body">
                  <span className="netbanking-subtitle">Select your bank for instant authorization:</span>
                  <div className="banks-grid">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map(
                      (bank) => (
                        <button
                          key={bank}
                          type="button"
                          className={`bank-card-item ${selectedBank === bank ? 'selected' : ''}`}
                          onClick={() => setSelectedBank(bank)}
                        >
                          <span className="bank-icon-box">🏛️</span>
                          <span className="bank-name">{bank}</span>
                        </button>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    className="rzp-submit-pay-btn"
                    onClick={() => handleExecuteSandboxPayment(`Netbanking (${selectedBank})`)}
                  >
                    🏛️ Pay {currencySymbol}{formattedAmount} via {selectedBank}
                  </button>
                </div>
              )}

              {/* TAB 4: OFFICIAL SDK */}
              {activeTab === 'official' && (
                <div className="panel-tab-body config-tab-body">
                  <div className="config-banner-info">
                    <h4>Official Razorpay Checkout SDK</h4>
                    <p>
                      Launches the official Razorpay JavaScript popup dialog. The backend generates an internal order and Razorpay order ID, and verifies the HMAC SHA256 signature upon completion.
                    </p>
                  </div>

                  <div className="security-note-box">
                    <span>💡</span>
                    <span>
                      Requires a valid Razorpay Key configured in backend environment variables. In local development with dummy keys, use the Sandbox UPI or Card tabs above.
                    </span>
                  </div>

                  <button
                    type="button"
                    className="rzp-submit-pay-btn"
                    onClick={handleLaunchOfficialSdk}
                  >
                    🚀 Launch Official Razorpay Modal ({currencySymbol}{formattedAmount})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="rzp-footer-trust">
          <span>🔒 End-to-End Encrypted</span>
          <span>⚡ Server-Verified Signature</span>
          <span>🛡️ Atomic PostgreSQL State Machine</span>
        </div>
      </div>
    </div>
  );
};
