import React from 'react';
import { useCart } from '../context/CartContext.js';

export const QuickLinks: React.FC = () => {
  const { openCart } = useCart();

  const scrollToCatalog = (e: React.MouseEvent) => {
    e.preventDefault();
    const catalogSection = document.getElementById('product-catalog-section');
    catalogSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="quick-links">
      <a href="#product-catalog-section" onClick={scrollToCatalog}>
        <span>⚡</span>
        <strong>Lightning deals</strong>
        <small>Save up to 45%</small>
      </a>
      <a href="javascript:void(0)" onClick={() => openCart()}>
        <span>🚚</span>
        <strong>Fast delivery</strong>
        <small>Free over ₹499</small>
      </a>
      <a href="javascript:void(0)" onClick={() => openCart()}>
        <span>💳</span>
        <strong>Easy payments</strong>
        <small>Secure checkout</small>
      </a>
      <a href="#product-catalog-section" onClick={scrollToCatalog}>
        <span>♻️</span>
        <strong>Shop consciously</strong>
        <small>Better choices</small>
      </a>
    </section>
  );
};
