import React, { useState } from 'react';
import type { RazorpayPaymentResult } from '../types.js';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { RazorpayModal } from './RazorpayModal.js';
import {
  IconCart,
  IconX,
  IconSparkles,
  IconTrash,
  IconLock,
  IconArrowRight
} from './Icons.js';

interface CartDrawerProps {
  onNavigate: (view: 'store' | 'account', tab?: 'profile' | 'orders') => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const { cart, isCartOpen, closeCart, updateQuantity, removeFromCart, summary, applyPromo, checkout } = useCart();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [promoCode, setPromoCode] = useState('');
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyPromo(promoCode);
    showToast(res.message, res.success ? 'success' : 'error');
  };

  const handlePaymentSuccess = (result: RazorpayPaymentResult) => {
    setIsRazorpayModalOpen(false);
    const res = checkout(
      undefined,
      result.razorpay_payment_id,
      result.method || 'Razorpay Test Checkout'
    );

    if (res.success) {
      showToast(`Payment Authorized (${result.razorpay_payment_id})! ${res.message}`, 'success');
      if (currentUser) {
        setTimeout(() => {
          onNavigate('account', 'orders');
        }, 800);
      }
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      showToast('Your cart is empty. Please add items to proceed.', 'error');
      return;
    }

    setIsRazorpayModalOpen(true);
  };

  return (
    <>
      <div className="cart-overlay open" id="cart-overlay" onClick={closeCart}></div>
      <aside className="cart-drawer open" id="cart-drawer" aria-label="Shopping Cart">
        <div className="cart-header">
          <div className="cart-title-wrap">
            <IconCart size={20} className="cart-header-icon" />
            <h3>
              Shopping Bag <small>({summary.totalCount})</small>
            </h3>
          </div>
          <button
            className="close-drawer-btn"
            id="close-cart-btn"
            aria-label="Close cart"
            onClick={closeCart}
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="free-shipping-tracker">
          <div id="free-shipping-note">
            {summary.subtotal >= 499 ? (
              <span className="free-shipping-success">
                <IconSparkles size={14} className="text-amber" />
                <strong>Free Express Delivery unlocked!</strong>
              </span>
            ) : (
              <span>
                Add <strong>₹{summary.freeShippingRemaining.toLocaleString('en-IN')}</strong> more for <strong>Free Delivery</strong>
              </span>
            )}
          </div>
          <div className="tracker-bar">
            <div
              className="tracker-fill"
              id="free-shipping-progress"
              style={{ width: `${summary.freeShippingProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="cart-items-container" id="cart-items-list">
          {cart.length === 0 ? (
            <div className="empty-cart-view">
              <div className="empty-cart-icon-wrap">
                <IconCart size={40} className="empty-cart-svg" />
              </div>
              <h4>Your Cart is Empty</h4>
              <p>Explore our trending catalog and discover items crafted for you.</p>
              <button
                className="btn-primary-glow start-shopping-btn"
                onClick={() => {
                  closeCart();
                  onNavigate('store');
                }}
              >
                <span>Start Shopping</span>
                <IconArrowRight size={16} />
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item-row">
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-thumb"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3361_ELECTR_train.jpeg';
                  }}
                />
                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <span className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</span>
                  <div className="cart-qty-controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, -1)}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="qty-val">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => {
                        removeFromCart(item.id);
                        showToast('Item removed from cart', 'info');
                      }}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <form className="promo-box" onSubmit={handleApplyPromo}>
              <input
                type="text"
                id="promo-input"
                placeholder="Promo code (SUMMER20)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button type="submit" id="apply-promo-btn">
                Apply
              </button>
            </form>
            <div className="summary-line">
              <span>Subtotal</span>
              <span id="cart-subtotal">₹{summary.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-line">
              <span>Estimated Delivery</span>
              <span id="cart-shipping">{summary.shipping === 0 ? 'FREE' : `₹${summary.shipping.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
            </div>
            {summary.discount > 0 && (
              <div className="summary-line discount-line">
                <span>Promo Discount</span>
                <span id="cart-discount">-₹{summary.discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="summary-line total-line">
              <span>Total Amount</span>
              <span id="cart-total">₹{summary.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <button className="checkout-btn razorpay-btn" onClick={handleProceedToPayment}>
              <IconLock size={16} />
              <span>Checkout via Razorpay Live</span>
              <IconArrowRight size={16} />
            </button>
          </div>
        )}
      </aside>

      {/* Interactive Razorpay Live / Configuration Modal fallback */}
      <RazorpayModal
        isOpen={isRazorpayModalOpen}
        amount={summary.total}
        currency="INR"
        userName={currentUser?.name || 'Valued Customer'}
        userEmail={currentUser?.email || 'customer@example.com'}
        onSuccess={handlePaymentSuccess}
        onClose={() => setIsRazorpayModalOpen(false)}
      />
    </>
  );
};
