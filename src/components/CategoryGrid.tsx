import React from 'react';
import type { Category } from '../types.js';

interface CategoryGridProps {
  onSelectCategory: (category: Category) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory }) => {
  const handleCategoryClick = (cat: Category) => {
    onSelectCategory(cat);
    const catalogEl = document.getElementById('product-catalog-section');
    catalogEl?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CURATED FOR YOU</p>
          <h2>Shop by category</h2>
        </div>
        <a href="javascript:void(0)" onClick={() => handleCategoryClick('all')}>
          See all products →
        </a>
      </div>
      <div className="category-grid">
        <a
          href="javascript:void(0)"
          className="category-card category-blue"
          onClick={() => handleCategoryClick('electronics')}
        >
          <span className="category-emoji">💻</span>
          <div>
            <strong>Tech & electronics</strong>
            <small>Explore devices</small>
          </div>
        </a>
        <a
          href="javascript:void(0)"
          className="category-card category-pink"
          onClick={() => handleCategoryClick('fashion')}
        >
          <span className="category-emoji">👟</span>
          <div>
            <strong>Fashion & style</strong>
            <small>Find your look</small>
          </div>
        </a>
        <a
          href="javascript:void(0)"
          className="category-card category-yellow"
          onClick={() => handleCategoryClick('home')}
        >
          <span className="category-emoji">🏠</span>
          <div>
            <strong>Home & living</strong>
            <small>Make it yours</small>
          </div>
        </a>
        <a
          href="javascript:void(0)"
          className="category-card category-green"
          onClick={() => handleCategoryClick('beauty')}
        >
          <span className="category-emoji">🧴</span>
          <div>
            <strong>Beauty & wellness</strong>
            <small>Feel your best</small>
          </div>
        </a>
        <a
          href="javascript:void(0)"
          className="category-card category-lilac"
          onClick={() => handleCategoryClick('electronics')}
        >
          <span className="category-emoji">🎮</span>
          <div>
            <strong>Gaming & Audio</strong>
            <small>Level up</small>
          </div>
        </a>
        <a
          href="javascript:void(0)"
          className="category-card category-orange"
          onClick={() => handleCategoryClick('pets')}
        >
          <span className="category-emoji">🐾</span>
          <div>
            <strong>Pet supplies</strong>
            <small>For your best friend</small>
          </div>
        </a>
      </div>
    </section>
  );
};
