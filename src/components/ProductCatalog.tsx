import React, { useState, useMemo } from 'react';
import type { Product, Category, SortOption } from '../types.js';
import { ProductCard } from './ProductCard.js';

interface ProductCatalogProps {
  products: readonly Product[];
  currentCategory: Category;
  searchQuery: string;
  onSelectCategory: (category: Category) => void;
  onOpenQuickView: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  currentCategory,
  searchQuery,
  onSelectCategory,
  onOpenQuickView
}) => {
  const [currentSort, setCurrentSort] = useState<SortOption>('featured');

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCat = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch =
          !searchQuery ||
          product.name.toLowerCase().includes(searchQuery) ||
          product.categoryName.toLowerCase().includes(searchQuery) ||
          product.description.toLowerCase().includes(searchQuery);
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        if (currentSort === 'price-low') return a.price - b.price;
        if (currentSort === 'price-high') return b.price - a.price;
        if (currentSort === 'rating') return b.rating - a.rating;
        if (currentSort === 'discount') {
          const discA = parseInt(a.discount.replace(/[^0-9]/g, ''), 10) || 0;
          const discB = parseInt(b.discount.replace(/[^0-9]/g, ''), 10) || 0;
          return discB - discA;
        }
        return 0; // featured default
      });
  }, [products, currentCategory, searchQuery, currentSort]);

  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: 'All Items' },
    { id: 'electronics', label: '💻 Electronics' },
    { id: 'fashion', label: '👗 Fashion & Style' },
    { id: 'beauty', label: '🧴 Beauty & Health' },
    { id: 'home', label: '🏠 Home & Kitchen' },
    { id: 'pets', label: '🐾 Pet Supplies' }
  ];

  return (
    <section className="section-block" id="product-catalog-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">EXPLORE STORE CATALOG</p>
          <h2>Featured Products & Deals</h2>
        </div>
        <div className="catalog-controls">
          <span className="items-counter" id="products-count-badge">
            {filteredProducts.length} items found
          </span>
          <select
            id="catalog-sort"
            className="sort-select"
            aria-label="Sort products"
            value={currentSort}
            onChange={(e) => setCurrentSort(e.target.value as SortOption)}
          >
            <option value="featured">Featured</option>
            <option value="discount">Biggest Discount</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs / Pills */}
      <div className="filter-bar-container">
        <div className="filter-pills">
          {categories.map((c) => (
            <button
              key={c.id}
              className={`filter-pill ${currentCategory === c.id ? 'active' : ''}`}
              onClick={() => onSelectCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Product Grid */}
      <div className="product-grid" id="dynamic-product-grid">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try searching for different keywords or select another category.</p>
            <button className="primary-button reset-btn" onClick={() => onSelectCategory('all')}>
              View All Products
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenQuickView={onOpenQuickView}
            />
          ))
        )}
      </div>
    </section>
  );
};
