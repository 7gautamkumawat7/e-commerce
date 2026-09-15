import React from 'react';
import { useToast } from '../context/ToastContext.js';

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
    <footer>
      <a href="#" className="back-top" onClick={handleScrollTop}>
        Back to top ↑
      </a>
      <div className="footer-main">
        <div className="footer-brand">
          <span className="brand-mark">shop</span>
          <span className="brand-dot">.</span>
          <p>
            Simple shopping for
            <br />
            every kind of day.
          </p>
        </div>
        <div>
          <h4>Get to know us</h4>
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
            Careers
          </a>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('Press releases & media assets available.', 'info')}
          >
            Press center
          </a>
        </div>
        <div>
          <h4>Make money with us</h4>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('Sell your products on ShopCart marketplace.', 'info')}
          >
            Sell products
          </a>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('Earn up to 12% commission as an affiliate partner.', 'info')}
          >
            Become an affiliate
          </a>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('Boost your product visibility with sponsored ads.', 'info')}
          >
            Advertise products
          </a>
        </div>
        <div>
          <h4>Let us help you</h4>
          <a
            href="javascript:void(0)"
            onClick={() => onNavigate('account', 'profile')}
          >
            Your account
          </a>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('Free 2-day delivery on all orders over ₹499!', 'info')}
          >
            Shipping rates
          </a>
          <a
            href="javascript:void(0)"
            onClick={() => onNavigate('account', 'orders')}
          >
            Returns & replacements
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 ShopCart. Modern React & TypeScript e-commerce platform.</span>
        <span>Privacy · Terms · Accessibility</span>
      </div>
    </footer>
  );
};
