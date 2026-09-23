import React from 'react';
import type { Category } from '../types.js';
import { IconArrowRight, IconSparkles } from './Icons.js';

interface SplitBannerProps {
  onSelectCategory: (category: Category) => void;
}

export const SplitBanner: React.FC<SplitBannerProps> = ({ onSelectCategory }) => {
  const handleExplore = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelectCategory('home');
    const catalogEl = document.getElementById('product-catalog-section');
    catalogEl?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="split-banner-modern" aria-label="Editorial Home Showcase">
      <div className="split-copy-container">
        <div className="split-eyebrow-pill">
          <IconSparkles size={14} className="text-amber" />
          <span>YOUR SPACE, ELEVATED</span>
        </div>
        <h2 className="split-headline">
          Thoughtful pieces for
          <br />
          <span className="split-headline-accent">effortless living.</span>
        </h2>
        <p className="split-paragraph">
          From artisan stoneware coffee sets to pre-seasoned culinary cast iron and sustainable bamboo organizers — discover everyday essentials designed to endure.
        </p>
        <button className="btn-primary-glow" onClick={handleExplore}>
          <span>Explore Home & Kitchen</span>
          <IconArrowRight size={18} />
        </button>
      </div>

      <div className="split-visual-showcase">
        <div className="banner-visual-ambient"></div>
        {/* Layered Showcase Cards with actual photography */}
        <div className="banner-card-primary">
          <img
            src="ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10000_HOME_K_train.jpeg"
            alt="Handcrafted Matte Ceramic Mug Set"
            className="banner-primary-img"
          />
          <div className="banner-card-caption">
            <strong>Nordic Ceramic Set</strong>
            <small>Stoneware • ₹1,399</small>
          </div>
        </div>

        <div className="banner-card-float">
          <img
            src="ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10007_HOME_K_train.jpeg"
            alt="Cast Iron Skillet"
            className="banner-float-img"
          />
          <div className="banner-float-details">
            <span className="banner-pill-hot">Chef's Choice</span>
            <strong>Pre-Seasoned Cast Iron</strong>
            <small>₹2,199</small>
          </div>
        </div>
      </div>
    </section>
  );
};
