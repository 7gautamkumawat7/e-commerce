import React from 'react';
import type { Product } from '../types.js';
import { PRODUCTS } from '../data/products.js';

interface TopRatedSectionProps {
  onOpenQuickView: (product: Product) => void;
}

export const TopRatedSection: React.FC<TopRatedSectionProps> = ({ onOpenQuickView }) => {
  const handleQuickViewById = (productId: string) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (product) onOpenQuickView(product);
  };

  const scrollToCatalog = (e: React.MouseEvent) => {
    e.preventDefault();
    const catalogSection = document.getElementById('product-catalog-section');
    catalogSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <p className="eyebrow">TOP-RATED PICKS</p>
          <h2>Customers are loving these</h2>
        </div>
        <a href="#product-catalog-section" onClick={scrollToCatalog}>
          Explore more →
        </a>
      </div>
      <div className="mini-grid">
        <a
          href="javascript:void(0)"
          className="mini-product"
          onClick={() => handleQuickViewById('home-3')}
        >
          <span className="mini-art">🧺</span>
          <div>
            <span className="rating">★★★★★</span>
            <h3>Smart organization essentials</h3>
            <strong>From ₹1,499</strong>
          </div>
        </a>
        <a
          href="javascript:void(0)"
          className="mini-product"
          onClick={() => handleQuickViewById('beauty-1')}
        >
          <span className="mini-art">🌸</span>
          <div>
            <span className="rating">★★★★★</span>
            <h3>Beauty favorites for your routine</h3>
            <strong>From ₹1,299</strong>
          </div>
        </a>
        <a
          href="javascript:void(0)"
          className="mini-product"
          onClick={() => handleQuickViewById('fash-2')}
        >
          <span className="mini-art">🎒</span>
          <div>
            <span className="rating">★★★★☆</span>
            <h3>Comfy apparel & accessories</h3>
            <strong>From ₹2,899</strong>
          </div>
        </a>
      </div>
    </section>
  );
};
