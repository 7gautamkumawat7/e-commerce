import React from 'react';
import type { Category } from '../types.js';

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
    <section className="split-banner">
      <div className="split-copy">
        <p className="eyebrow">YOUR SPACE, YOUR STORY</p>
        <h2>
          Small changes.
          <br />
          <em>Big difference.</em>
        </h2>
        <p>Refresh your home with thoughtful pieces that make every day feel a little more you.</p>
        <a className="secondary-button" href="#product-catalog-section" onClick={handleExplore}>
          Explore home →
        </a>
      </div>
      <div className="room-art">
        <div className="plant">🌿</div>
        <div className="lamp">💡</div>
        <div className="chair">🪑</div>
        <div className="rug"></div>
      </div>
    </section>
  );
};
