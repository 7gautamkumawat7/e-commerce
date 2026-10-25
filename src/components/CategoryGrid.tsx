import React from 'react';
import type { Category } from '../types.js';
import {
  IconLaptop,
  IconShirt,
  IconHome,
  IconSparkleBeauty,
  IconGamepad,
  IconPaw,
  IconArrowRight
} from './Icons.js';

import { PRODUCTS } from '../data/products.js';

interface CategoryGridProps {
  onSelectCategory: (category: Category) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory }) => {
  const handleCategoryClick = (cat: Category) => {
    onSelectCategory(cat);
    const catalogEl = document.getElementById('product-catalog-section');
    catalogEl?.scrollIntoView({ behavior: 'smooth' });
  };

  const categories = [
    {
      id: 'electronics' as Category,
      title: 'Tech & Electronics',
      subtitle: 'Audio, Wearables & Optics',
      count: `${PRODUCTS.filter((p) => p.category === 'electronics').length} Items`,
      icon: <IconLaptop size={28} />,
      themeClass: 'cat-theme-blue'
    },
    {
      id: 'fashion' as Category,
      title: 'Fashion & Style',
      subtitle: 'Apparel, Shoes & Watches',
      count: `${PRODUCTS.filter((p) => p.category === 'fashion').length} Items`,
      icon: <IconShirt size={28} />,
      themeClass: 'cat-theme-rose'
    },
    {
      id: 'home' as Category,
      title: 'Home & Living',
      subtitle: 'Kitchen, Decor & Organization',
      count: `${PRODUCTS.filter((p) => p.category === 'home').length} Items`,
      icon: <IconHome size={28} />,
      themeClass: 'cat-theme-amber'
    },
    {
      id: 'beauty' as Category,
      title: 'Beauty & Wellness',
      subtitle: 'Skincare & Personal Care',
      count: `${PRODUCTS.filter((p) => p.category === 'beauty').length} Items`,
      icon: <IconSparkleBeauty size={28} />,
      themeClass: 'cat-theme-emerald'
    },
    {
      id: 'electronics' as Category,
      title: 'Gaming & Audio',
      subtitle: 'Controllers & Studio Gear',
      count: `${PRODUCTS.filter((p) => p.category === 'electronics').length} Items`,
      icon: <IconGamepad size={28} />,
      themeClass: 'cat-theme-indigo'
    },
    {
      id: 'pets' as Category,
      title: 'Pet Supplies',
      subtitle: 'Beds, Toys & Feeding',
      count: `${PRODUCTS.filter((p) => p.category === 'pets').length} Items`,
      icon: <IconPaw size={28} />,
      themeClass: 'cat-theme-orange'
    }
  ];

  return (
    <section className="section-block" aria-label="Curated Categories">
      <div className="section-heading">
        <div className="heading-text-group">
          <p className="eyebrow">CURATED FOR YOU</p>
          <h2 className="section-title">Shop by Category</h2>
        </div>
        <button
          className="section-link-btn"
          onClick={() => handleCategoryClick('all')}
        >
          <span>See all products</span>
          <IconArrowRight size={15} />
        </button>
      </div>

      <div className="category-grid">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className={`category-card-modern ${cat.themeClass}`}
            onClick={() => handleCategoryClick(cat.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCategoryClick(cat.id);
              }
            }}
          >
            <div className="cat-icon-bubble">{cat.icon}</div>
            <div className="cat-card-body">
              <span className="cat-count-badge">{cat.count}</span>
              <strong className="cat-title">{cat.title}</strong>
              <small className="cat-desc">{cat.subtitle}</small>
            </div>
            <div className="cat-card-action">
              <span className="cat-explore-text">Explore</span>
              <IconArrowRight size={14} className="cat-arrow" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
