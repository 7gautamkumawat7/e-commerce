import React, { useState, useEffect } from 'react';
import type { Product, Category } from '../types.js';
import { ProductCard } from '../components/features/index.js';
import { useToast } from '../context/ToastContext.js';
import {
  IconBolt,
  IconSparkles,
  IconCheck
} from '../components/common/index.js';

interface DealsPageProps {
  products: readonly Product[];
  onSelectCategory: (category: Category) => void;
  onSelectProduct: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
}

export const DealsPage: React.FC<DealsPageProps> = ({
  products,
  onSelectProduct,
  onOpenQuickView
}) => {
  const { showToast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedDiscountFilter, setSelectedDiscountFilter] = useState<number>(0);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 15
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    showToast(`Coupon code "${code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 3000);
  };

  // Only products with discounts
  const dealProducts = products
    .filter((p) => {
      const discNum = parseInt(p.discount.replace(/[^0-9]/g, ''), 10) || 0;
      if (discNum < selectedDiscountFilter) return false;
      return discNum > 0 || p.wasPrice !== undefined;
    })
    .sort((a, b) => {
      const discA = parseInt(a.discount.replace(/[^0-9]/g, ''), 10) || 0;
      const discB = parseInt(b.discount.replace(/[^0-9]/g, ''), 10) || 0;
      return discB - discA;
    });

  const coupons = [
    {
      code: 'SUMMER20',
      discount: '20% OFF',
      description: 'On all orders above ₹1,999',
      badge: 'Most Popular'
    },
    {
      code: 'FLASH500',
      discount: '₹500 FLAT',
      description: 'Instant discount on electronics',
      badge: 'Limited Stock'
    },
    {
      code: 'FREESHIP',
      discount: 'FREE DELIVERY',
      description: 'No minimum order value',
      badge: 'Zero Delivery Fee'
    }
  ];

  return (
    <div className="deals-page-container">
      {/* 1. Flash Deals Banner with Live Countdown */}
      <section className="deals-banner-card">
        <div className="deals-banner-content">
          <div className="deals-badge-glow">
            <IconBolt size={16} />
            <span>LIMITED TIME MEGA EVENT</span>
          </div>
          <h1 className="deals-hero-title">
            Flash Sale & Clearance Discounts
          </h1>
          <p className="deals-hero-subtitle">
            Save up to 45% on top-rated electronics, fashion timepieces, kitchenware, and grooming essentials. Act quickly while supplies last!
          </p>

          {/* Live Countdown Timer */}
          <div className="deals-countdown-box">
            <span className="timer-label">Sale Concludes In:</span>
            <div className="timer-digits-row">
              <div className="timer-unit">
                <strong>{String(timeLeft.hours).padStart(2, '0')}</strong>
                <small>Hours</small>
              </div>
              <span className="timer-colon">:</span>
              <div className="timer-unit">
                <strong>{String(timeLeft.minutes).padStart(2, '0')}</strong>
                <small>Minutes</small>
              </div>
              <span className="timer-colon">:</span>
              <div className="timer-unit">
                <strong>{String(timeLeft.seconds).padStart(2, '0')}</strong>
                <small>Seconds</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Available Coupon Codes Bar */}
      <section className="coupons-grid-section">
        <div className="section-header-compact">
          <IconSparkles size={18} className="text-amber" />
          <h3>Available Coupon Codes (Click to Copy)</h3>
        </div>

        <div className="coupons-cards-grid">
          {coupons.map((c) => {
            const isCopied = copiedCode === c.code;

            return (
              <div
                key={c.code}
                className="coupon-pill-card"
                onClick={() => handleCopyCode(c.code)}
                role="button"
                tabIndex={0}
              >
                <div className="coupon-card-header">
                  <span className="coupon-discount-tag">{c.discount}</span>
                  <span className="coupon-mini-badge">{c.badge}</span>
                </div>
                <div className="coupon-code-row">
                  <span className="coupon-code-text">{c.code}</span>
                  <button type="button" className="copy-action-btn">
                    {isCopied ? (
                      <>
                        <IconCheck size={14} className="text-emerald" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <span>Copy Code</span>
                    )}
                  </button>
                </div>
                <small className="coupon-desc">{c.description}</small>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Deal Filter Options */}
      <div className="deals-filter-bar">
        <span className="filter-label">Filter Deals:</span>
        <div className="discount-filter-pills">
          {[
            { label: 'All Discounted Items', val: 0 },
            { label: '20% Off & Above', val: 20 },
            { label: '30% Off & Above', val: 30 },
            { label: '40% Off & Above', val: 40 }
          ].map((tier) => (
            <button
              key={tier.val}
              type="button"
              className={`filter-pill ${selectedDiscountFilter === tier.val ? 'active' : ''}`}
              onClick={() => setSelectedDiscountFilter(tier.val)}
            >
              {tier.label}
            </button>
          ))}
        </div>
        <span className="deals-items-counter">
          {dealProducts.length} flash deals active
        </span>
      </div>

      {/* 4. Product Grid */}
      <div className="product-grid" id="deals-product-grid">
        {dealProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenQuickView={onOpenQuickView}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </div>
    </div>
  );
};

export default DealsPage;
