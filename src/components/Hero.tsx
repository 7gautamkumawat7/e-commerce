import React from 'react';
import {
  IconArrowRight,
  IconBolt,
  IconShieldCheck,
  IconTruck,
  IconRotateCcw,
  IconStar,
  IconSparkles
} from './Icons.js';

export const Hero: React.FC = () => {
  const scrollToCatalog = (e: React.MouseEvent) => {
    e.preventDefault();
    const catalogSection = document.getElementById('product-catalog-section');
    catalogSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="hero-modern" aria-label="Hero Introduction">
      {/* Background ambient lighting */}
      <div className="hero-ambient-glow" aria-hidden="true">
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
      </div>

      <div className="hero-grid">
        {/* Left Column: Compelling Editorial Typography & CTAs */}
        <div className="hero-copy-column">
          <div className="hero-badge">
            <span className="badge-glow-dot"></span>
            <IconSparkles size={14} className="badge-icon" />
            <span>SUMMER 2026 EDIT • CURATED EXCELLENCE</span>
          </div>

          <h1 className="hero-title">
            Make room for
            <br />
            <span className="gradient-text">exceptional living.</span>
          </h1>

          <p className="hero-subtitle">
            Meticulously engineered electronics, modern fashion, and artisanal home essentials.
            Designed for those who appreciate premium quality and effortless everyday delivery.
          </p>

          <div className="hero-cta-group">
            <a
              className="btn-primary-glow"
              href="#product-catalog-section"
              onClick={scrollToCatalog}
            >
              <span>Explore Catalog</span>
              <IconArrowRight size={18} className="btn-arrow" />
            </a>

            <a
              className="btn-secondary-glass"
              href="#product-catalog-section"
              onClick={scrollToCatalog}
            >
              <IconBolt size={18} className="text-amber" />
              <span>Flash Deals</span>
            </a>
          </div>

          {/* Social Proof & Guarantees */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <IconTruck size={18} className="trust-icon" />
              <div>
                <strong>Free Delivery</strong>
                <small>Orders over ₹499</small>
              </div>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <IconShieldCheck size={18} className="trust-icon" />
              <div>
                <strong>100% Genuine</strong>
                <small>Verified authentic</small>
              </div>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <IconRotateCcw size={18} className="trust-icon" />
              <div>
                <strong>30-Day Returns</strong>
                <small>Hassle-free exchange</small>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Layered 3D Product Showcase with Real Photography */}
        <div className="hero-visual-column">
          <div className="showcase-card-main">
            <div className="showcase-badge-deal">
              <span>-33% OFF</span>
            </div>

            <div className="showcase-img-container">
              <img
                src="ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3361_ELECTR_train.jpeg"
                alt="Studio Wireless Noise-Canceling Headphones"
                className="showcase-img"
              />
            </div>

            <div className="showcase-card-details">
              <span className="showcase-cat">AUDIO & ELECTRONICS</span>
              <h3 className="showcase-name">ANC Wireless Studio Pro Headphones</h3>

              <div className="showcase-price-row">
                <div className="price-tag">
                  <span className="price-current">₹4,999</span>
                  <span className="price-original">₹7,499</span>
                </div>
                <span className="stock-chip">⚡ In Stock</span>
              </div>
            </div>

            {/* Floating Glassmorphic Social Rating Chip */}
            <div className="floating-chip floating-chip-rating">
              <div className="stars-row">
                {[...Array(5)].map((_, i) => (
                  <IconStar key={i} size={14} filled={true} />
                ))}
              </div>
              <div className="rating-info">
                <strong>4.8 / 5.0</strong>
                <small>(1,420+ Shoppers)</small>
              </div>
            </div>

            {/* Floating Glassmorphic Delivery Speed Chip */}
            <div className="floating-chip floating-chip-delivery">
              <span className="speed-dot"></span>
              <div>
                <strong>Same-Day Dispatch</strong>
                <small>Live GPS Tracking</small>
              </div>
            </div>
          </div>

          {/* Secondary Accent Floating Card (Smartwatch) */}
          <div className="showcase-card-secondary" onClick={scrollToCatalog}>
            <img
              src="ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3368_ELECTR_train.jpeg"
              alt="AMOLED Fitness Smartwatch"
              className="secondary-thumb"
            />
            <div className="secondary-info">
              <span className="secondary-tag">HOT DEAL</span>
              <strong>AMOLED Smartwatch</strong>
              <span className="secondary-price">₹5,999</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
