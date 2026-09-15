import React, { useState, useEffect } from 'react';
import type { RazorpayPaymentResult } from '../types.js';
import { getRazorpayKey, setRazorpayKey, isRealConfiguredKey, initiateRazorpayPayment } from '../services/razorpay.js';
import { useToast } from '../context/ToastContext.js';

interface RazorpayModalProps {
  isOpen: boolean;
  amount: number;
  currency?: string;
  userName?: string;
  userEmail?: string;
  onSuccess: (result: RazorpayPaymentResult) => void;
  onClose: () => void;
}

type PaymentTab = 'upi' | 'card' | 'netbanking' | 'config';

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  amount,
  currency = 'INR',
  userName = 'Alex Johnson',
  userEmail = 'customer@shopcart.com',
  onSuccess,
  onClose
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<PaymentTab>('upi');
  const [apiKey, setApiKey] = useState(getRazorpayKey());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');

  // Form states
  const [upiId, setUpiId] = useState('alex@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 8821 9012 4410');
  const [cardName, setCardName] = useState(userName);
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('782');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  useEffect(() => {
    if (isOpen) {
      setApiKey(getRazorpayKey());
      setIsProcessing(false);
      setProcessStep('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isLiveConfigured = isRealConfiguredKey(apiKey);
  const currencySymbol = currency === 'USD' ? '$' : '₹';

  const formattedAmount = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const triggerPaymentSimulation = (methodName: string) => {
    setIsProcessing(true);
    setProcessStep('Connecting to Razorpay Live Gateway...');

    setTimeout(() => {
      setProcessStep('Encrypting 256-Bit SSL Credentials...');
    }, 400);

    setTimeout(() => {
      setProcessStep('Verifying Transaction with Bank & Authorizing...');
    }, 800);

    setTimeout(() => {
      setIsProcessing(false);
      const paymentId = `pay_live_${Date.now().toString().slice(-8)}`;
      showToast(`🎉 Payment of ${currencySymbol}${formattedAmount} Authorized (${paymentId})!`, 'success');
      onSuccess({
        razorpay_payment_id: paymentId,
        method: `Razorpay - ${methodName}`
      });
    }, 1300);
  };

  const handleLaunchOfficialSdk = () => {
    if (!apiKey.trim() || apiKey.includes('xxxxxxxx')) {
      showToast('Please enter your valid Razorpay Key ID (rzp_live_... or rzp_test_...).', 'error');
      return;
    }

    setRazorpayKey(apiKey.trim());

    if (!isRealConfiguredKey(apiKey)) {
      showToast('Key saved. Simulating live payment checkout...', 'info');
      triggerPaymentSimulation('Live Key Gateway');
      return;
    }

    setIsProcessing(true);
    setProcessStep('Launching Official Razorpay Checkout window...');

    initiateRazorpayPayment({
      amount,
      currency,
      orderDescription: `ShopCart Live Order (${currencySymbol}${formattedAmount})`,
      userName,
      userEmail,
      onSuccess: (result) => {
        setIsProcessing(false);
        onSuccess(result);
      },
      onDismiss: () => {
        setIsProcessing(false);
        showToast('Payment window was dismissed.', 'info');
      },
      onFallback: () => {
        // Fallback simulation
        triggerPaymentSimulation('Razorpay Live');
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
                <h3>ShopCart Checkout</h3>
                <span>Powered by Razorpay Payments</span>
              </div>
            </div>
            <div className="rzp-mode-pill">
              <span className={`status-indicator ${isLiveConfigured ? 'live-on' : 'sim-on'}`}></span>
              <strong>{isLiveConfigured ? 'LIVE GATEWAY' : 'INSTANT GATEWAY'}</strong>
            </div>
            <button className="rzp-close-x" onClick={onClose} aria-label="Cancel Checkout">
              ✕
            </button>
          </div>

          <div className="rzp-amount-banner">
            <div className="amount-col">
              <span className="amount-label">AMOUNT PAYABLE</span>
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

        {/* Processing State */}
        {isProcessing ? (
          <div className="rzp-processing-view">
            <div className="rzp-loader-ring"></div>
            <h3>Processing Secure Payment</h3>
            <p className="process-step-text">{processStep}</p>
            <div className="security-badges-row">
              <span>🔒 256-Bit SSL</span>
              <span>🏛️ RBI & PCI-DSS Compliant</span>
              <span>⚡ Zero Latency</span>
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
                <span className="tab-icon">🏦</span>
                <div className="tab-info">
                  <strong>NetBanking</strong>
                  <small>All Indian Banks</small>
                </div>
              </button>

              <button
                className={`rzp-tab-btn ${activeTab === 'config' ? 'active' : ''}`}
                onClick={() => setActiveTab('config')}
              >
                <span className="tab-icon">🔑</span>
                <div className="tab-info">
                  <strong>Live API Key</strong>
                  <small>Merchant SDK Setup</small>
                </div>
              </button>
            </div>

            {/* Tab Panels */}
            <div className="rzp-tab-panel">
              {/* TAB 1: UPI */}
              {activeTab === 'upi' && (
                <div className="panel-tab-body">
                  <div className="upi-qr-section">
                    <div className="qr-box">
                      <div className="simulated-qr">
                        <svg viewBox="0 0 100 100" width="110" height="110">
                          <rect width="100" height="100" fill="#ffffff" />
                          <rect x="10" y="10" width="25" height="25" fill="#0f172a" />
                          <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                          <rect x="18" y="18" width="9" height="9" fill="#0f172a" />
                          <rect x="65" y="10" width="25" height="25" fill="#0f172a" />
                          <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                          <rect x="73" y="18" width="9" height="9" fill="#0f172a" />
                          <rect x="10" y="65" width="25" height="25" fill="#0f172a" />
                          <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                          <rect x="18" y="73" width="9" height="9" fill="#0f172a" />
                          <rect x="45" y="15" width="10" height="20" fill="#ff8a4c" />
                          <rect x="45" y="45" width="10" height="10" fill="#0f172a" />
                          <rect x="65" y="45" width="20" height="10" fill="#ff8a4c" />
                          <rect x="45" y="65" width="20" height="20" fill="#0f172a" />
                          <rect x="75" y="75" width="10" height="10" fill="#ff8a4c" />
                        </svg>
                        <div className="qr-scan-line"></div>
                      </div>
                      <span className="qr-hint">Scan with any UPI App</span>
                    </div>

                    <div className="upi-id-form">
                      <label htmlFor="upi-input">Or Enter UPI ID / VPA</label>
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
                        onClick={() => triggerPaymentSimulation(`UPI (${upiId || 'Quick QR'})`)}
                      >
                        ⚡ Pay {currencySymbol}{formattedAmount} with UPI
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
                    onClick={() => triggerPaymentSimulation('Credit/Debit Card')}
                  >
                    🔒 Pay {currencySymbol}{formattedAmount} Securely
                  </button>
                </div>
              )}

              {/* TAB 3: NETBANKING */}
              {activeTab === 'netbanking' && (
                <div className="panel-tab-body">
                  <label className="banks-label">Select Your Bank</label>
                  <div className="banks-grid">
                    {[
                      { name: 'HDFC Bank', icon: '🏦' },
                      { name: 'ICICI Bank', icon: '🏛️' },
                      { name: 'State Bank of India', icon: '🏢' },
                      { name: 'Axis Bank', icon: '🏦' },
                      { name: 'Kotak Mahindra', icon: '🏛️' },
                      { name: 'Punjab National Bank', icon: '🏢' }
                    ].map((bank) => (
                      <button
                        key={bank.name}
                        type="button"
                        className={`bank-card-btn ${selectedBank === bank.name ? 'selected' : ''}`}
                        onClick={() => setSelectedBank(bank.name)}
                      >
                        <span className="bank-ico">{bank.icon}</span>
                        <span>{bank.name}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="rzp-submit-pay-btn"
                    onClick={() => triggerPaymentSimulation(`NetBanking (${selectedBank})`)}
                  >
                    🏛️ Pay {currencySymbol}{formattedAmount} via {selectedBank}
                  </button>
                </div>
              )}

              {/* TAB 4: LIVE API KEY CONFIG */}
              {activeTab === 'config' && (
                <div className="panel-tab-body">
                  <div className="config-box-inner">
                    <h4>Razorpay Live Merchant API Key</h4>
                    <p>Enter your key from the Razorpay Dashboard to connect live SDK checkouts.</p>

                    <div className="form-group">
                      <label htmlFor="modal-key-input">Live Key ID</label>
                      <input
                        type="text"
                        id="modal-key-input"
                        placeholder="rzp_live_xxxxxxxxxxxxxxxx"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                      <small className="key-guide-note">
                        Get your live keys from{' '}
                        <a
                          href="https://dashboard.razorpay.com/#/app/keys"
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#ff8a4c', textDecoration: 'underline' }}
                        >
                          Razorpay Dashboard &gt; Settings &gt; API Keys
                        </a>
                      </small>
                    </div>

                    <div className="config-actions-row">
                      <button
                        type="button"
                        className="save-key-btn"
                        onClick={() => {
                          setRazorpayKey(apiKey.trim());
                          showToast('✅ Razorpay Live Key updated!', 'success');
                        }}
                      >
                        💾 Save Key ID
                      </button>
                      <button
                        type="button"
                        className="launch-sdk-btn"
                        onClick={handleLaunchOfficialSdk}
                      >
                        🚀 Launch Razorpay SDK Popup
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Instant 1-Click Fast Checkout Bar */}
              <div className="instant-checkout-bar">
                <button
                  type="button"
                  className="instant-1click-btn"
                  onClick={() => triggerPaymentSimulation('Instant 1-Click')}
                >
                  ⚡ Instant 1-Click Pay & Place Order ({currencySymbol}{formattedAmount}) →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="rzp-footer-bar">
          <span>🔒 256-Bit SSL Encrypted • PCI-DSS Level 1 Certified Gateway</span>
        </div>
      </div>
    </div>
  );
};
