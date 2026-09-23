import React from 'react';
import { useToast } from '../context/ToastContext.js';
import { IconSparkles, IconShieldCheck, IconTruck, IconRotateCcw } from './Icons.js';

interface FooterProps {
  onNavigate: (view: 'store' | 'account', tab?: 'profile' | 'orders') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { showToast } = useToast();

  const handleScrollTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-modern">
      {/* Back to top button */}
      <button className="back-top-bar" onClick={handleScrollTop} aria-label="Scroll back to top">
        <span>Back to top</span>
        <span className="back-top-arrow">↑</span>
      </button>

      {/* Trust & Assurance Ribbon */}
      <div className="footer-ribbon">
        <div className="ribbon-item">
          <IconTruck size={22} className="ribbon-icon" />
          <div>
            <strong>Complimentary Express Shipping</strong>
            <small>On all qualifying orders over ₹499</small>
          </div>
        </div>
        <div className="ribbon-item">
          <IconShieldCheck size={22} className="ribbon-icon" />
          <div>
            <strong>100% Authentic Guarantee</strong>
            <small>Direct from certified manufacturer partners</small>
          </div>
        </div>
        <div className="ribbon-item">
          <IconRotateCcw size={22} className="ribbon-icon" />
          <div>
            <strong>30-Day Effortless Returns</strong>
            <small>Instant refunds & easy door-step pickups</small>
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-brand-col">
          <div className="footer-brand-header">
            <span className="brand-logo-symbol">
              <IconSparkles size={16} className="brand-sparkle" />
            </span>
            <span className="brand-mark">shop</span>
            <span className="brand-dot">cart</span>
          </div>
          <p className="footer-brand-desc">
            Curated modern commerce built for exceptional taste, everyday convenience, and uncompromising quality.
          </p>
          <div className="footer-compliance-badges">
            <span className="security-tag">🔒 256-Bit SSL Encrypted</span>
            <span className="security-tag">⚡ Razorpay Live Verified</span>
          </div>
        </div>

        <div className="footer-links-col">
          <h4>Discover</h4>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('ShopCart is a premium modern e-commerce platform.', 'info')}
          >
            About ShopCart
          </a>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('Careers at ShopCart: We are hiring frontend engineers!', 'info')}
          >
            Careers & Team
          </a>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('Press releases & media assets available.', 'info')}
          >
            Press & Media
          </a>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('Sustainable packaging and ethical sourcing commitment.', 'info')}
          >
            Sustainability Mission
          </a>
        </div>

        <div className="footer-links-col">
          <h4>Sell & Partner</h4>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('Sell your products on ShopCart marketplace.', 'info')}
          >
            Merchant Marketplace
          </a>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('Earn up to 12% commission as an affiliate partner.', 'info')}
          >
            Affiliate Program
          </a>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('Boost your product visibility with sponsored ads.', 'info')}
          >
            Brand Advertising
          </a>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('Wholesale and corporate gifting inquiries.', 'info')}
          >
            Corporate Solutions
          </a>
        </div>

        <div className="footer-links-col">
          <h4>Customer Care</h4>
          <a
            href="javascript:void(0)"
            onClick={() => onNavigate('account', 'profile')}
          >
            Your Profile
          </a>
          <a
            href="javascript:void(0)"
            onClick={() => onNavigate('account', 'orders')}
          >
            Order Tracking & Returns
          </a>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('Free express 2-day delivery on all orders over ₹499!', 'info')}
          >
            Shipping Policies
          </a>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('24/7 dedicated concierge at support@shopcart.com', 'info')}
          >
            Help Center & Contact
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>&copy; {new Date().getFullYear()} ShopCart Inc. Modern React &amp; TypeScript Enterprise Platform.</span>
          <div className="footer-legal-links">
            <a href="javascript:void(0)" onClick={() => showToast('Privacy Policy details', 'info')}>Privacy Notice</a>
            <span className="dot-sep">&bull;</span>
            <a href="javascript:void(0)" onClick={() => showToast('Terms of Service details', 'info')}>Conditions of Use</a>
            <span className="dot-sep">&bull;</span>
            <a href="javascript:void(0)" onClick={() => showToast('Accessibility statement', 'info')}>Accessibility Standards</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
