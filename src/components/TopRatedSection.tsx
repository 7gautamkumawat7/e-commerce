import React from 'react';
import type { Product } from '../types.js';
import { PRODUCTS } from '../data/products.js';
import { IconStar, IconArrowRight, IconEye } from './Icons.js';

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

  const curatedTopPicks = [
    {
      id: 'beauty-1',
      title: 'Hyaluronic Acid Hydration Serum',
      category: 'Beauty & Wellness',
      price: '₹1,299',
      wasPrice: '₹1,999',
      rating: 4.9,
      reviews: 1850,
      image: 'ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1088_BEAUTY_train.jpeg'
    },
    {
      id: 'home-3',
      title: 'Bamboo Desk Storage Organizer',
      category: 'Home & Living',
      price: '₹1,499',
      wasPrice: '₹2,299',
      rating: 4.8,
      reviews: 410,
      image: 'ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10014_HOME_K_train.jpeg'
    },
    {
      id: 'fash-2',
      title: 'Heavyweight Streetwear Hoodie',
      category: 'Fashion & Style',
      price: '₹2,899',
      wasPrice: '₹4,199',
      rating: 4.7,
      reviews: 512,
      image: 'ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2301_CLOTHI_train.jpeg'
    }
  ];

  return (
    <section className="section-block" aria-label="Customer Top-Rated Favorites">
      <div className="section-heading">
        <div className="heading-text-group">
          <p className="eyebrow">COMMUNITY FAVORITES</p>
          <h2 className="section-title">Customers Are Loving These</h2>
        </div>
        <a href="#product-catalog-section" onClick={scrollToCatalog} className="section-link-btn">
          <span>Explore all top rated</span>
          <IconArrowRight size={15} />
        </a>
      </div>

      <div className="top-rated-grid">
        {curatedTopPicks.map((item) => (
          <div
            key={item.id}
            className="top-rated-card"
            onClick={() => handleQuickViewById(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleQuickViewById(item.id);
              }
            }}
          >
            <div className="top-rated-img-wrap">
              <img src={item.image} alt={item.title} className="top-rated-thumb" />
              <button
                className="top-rated-quick-view"
                aria-label={`Quick view ${item.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickViewById(item.id);
                }}
              >
                <IconEye size={15} />
              </button>
            </div>

            <div className="top-rated-info">
              <span className="top-rated-cat">{item.category}</span>
              <div className="top-rated-rating">
                <div className="stars-flex">
                  {[...Array(5)].map((_, i) => (
                    <IconStar key={i} size={12} filled={true} />
                  ))}
                </div>
                <span className="score-text">{item.rating}</span>
                <span className="review-count">({item.reviews})</span>
              </div>
              <h3 className="top-rated-name">{item.title}</h3>
              <div className="top-rated-pricing">
                <strong className="top-rated-price">{item.price}</strong>
                <span className="top-rated-was">{item.wasPrice}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
