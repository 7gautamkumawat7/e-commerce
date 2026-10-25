import React from 'react';
import type { Category, ProductFilterState, Product } from '../types.js';
import {
  IconFilter,
  IconStar,
  IconX,
  IconRotateCcw,
  IconCheck
} from './Icons.js';

interface FilterSidebarProps {
  filterState: ProductFilterState;
  onFilterChange: (updates: Partial<ProductFilterState>) => void;
  onResetFilters: () => void;
  products: readonly Product[];
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filterState,
  onFilterChange,
  onResetFilters,
  products,
  isOpenMobile = false,
  onCloseMobile
}) => {
  // Compute category counts
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: products.length,
      electronics: 0,
      fashion: 0,
      home: 0,
      beauty: 0,
      pets: 0
    };
    products.forEach((p) => {
      if (counts[p.category] !== undefined) {
        counts[p.category] += 1;
      }
    });
    return counts;
  }, [products]);

  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'fashion', label: 'Fashion & Apparel' },
    { id: 'home', label: 'Home & Kitchen' },
    { id: 'beauty', label: 'Beauty & Wellness' },
    { id: 'pets', label: 'Pet Supplies' }
  ];

  const priceBrackets = [
    { label: 'All Prices', min: 0, max: 20000 },
    { label: 'Under ₹3,000', min: 0, max: 3000 },
    { label: '₹3,000 – ₹5,000', min: 3000, max: 5000 },
    { label: '₹5,000 – ₹8,000', min: 5000, max: 8000 },
    { label: 'Above ₹8,000', min: 8000, max: 20000 }
  ];

  const ratingOptions = [
    { label: '4.5★ & above', value: 4.5 },
    { label: '4.0★ & above', value: 4.0 },
    { label: '3.5★ & above', value: 3.5 },
    { label: 'All Ratings', value: 0 }
  ];

  const discountOptions = [
    { label: 'Any Discount', value: 0 },
    { label: '15% Off or more', value: 15 },
    { label: '25% Off or more', value: 25 },
    { label: '35% Off or more', value: 35 }
  ];

  const tags = ['All Tags', 'Bestseller', 'Top Deal', 'Trending', 'Limited'];

  const hasActiveFilters =
    filterState.category !== 'all' ||
    filterState.minPrice > 0 ||
    filterState.maxPrice < 20000 ||
    filterState.minRating > 0 ||
    filterState.minDiscount > 0 ||
    filterState.inStockOnly ||
    (filterState.selectedTag !== '' && filterState.selectedTag !== 'All Tags');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div className="filter-drawer-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`filter-sidebar ${isOpenMobile ? 'drawer-open' : ''}`}>
        <div className="filter-header">
          <div className="filter-title-wrap">
            <IconFilter size={18} className="filter-header-icon" />
            <h3 className="filter-title">Filters</h3>
          </div>

          <div className="filter-actions-top">
            {hasActiveFilters && (
              <button
                type="button"
                className="filter-reset-link"
                onClick={onResetFilters}
                title="Reset all filters"
              >
                <IconRotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}

            {isOpenMobile && (
              <button
                type="button"
                className="filter-close-btn"
                onClick={onCloseMobile}
                aria-label="Close filters"
              >
                <IconX size={18} />
              </button>
            )}
          </div>
        </div>

        {/* 1. Category Filter */}
        <div className="filter-section">
          <h4 className="filter-section-title">Department</h4>
          <div className="filter-options-list">
            {categories.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = filterState.category === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`filter-cat-row ${isSelected ? 'active' : ''}`}
                  onClick={() => onFilterChange({ category: cat.id })}
                >
                  <span className="cat-radio-indicator">
                    {isSelected && <span className="cat-radio-dot" />}
                  </span>
                  <span className="cat-name">{cat.label}</span>
                  <span className="cat-count">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Price Range Filter */}
        <div className="filter-section">
          <div className="filter-section-header">
            <h4 className="filter-section-title">Price Range</h4>
            <span className="filter-price-display">
              ₹{filterState.minPrice.toLocaleString('en-IN')} – ₹{filterState.maxPrice.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Dual Range Slider */}
          <div className="price-slider-wrap">
            <input
              type="range"
              min={0}
              max={20000}
              step={500}
              value={filterState.maxPrice}
              onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) })}
              className="price-range-input"
              aria-label="Maximum price"
            />
          </div>

          {/* Quick Price Preset Chips */}
          <div className="price-chips-grid">
            {priceBrackets.map((bracket, idx) => {
              const isActive =
                filterState.minPrice === bracket.min && filterState.maxPrice === bracket.max;

              return (
                <button
                  key={idx}
                  type="button"
                  className={`price-chip ${isActive ? 'active' : ''}`}
                  onClick={() => onFilterChange({ minPrice: bracket.min, maxPrice: bracket.max })}
                >
                  {bracket.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Customer Rating Filter */}
        <div className="filter-section">
          <h4 className="filter-section-title">Customer Rating</h4>
          <div className="filter-options-list">
            {ratingOptions.map((opt, idx) => {
              const isSelected = filterState.minRating === opt.value;

              return (
                <button
                  key={idx}
                  type="button"
                  className={`rating-filter-row ${isSelected ? 'active' : ''}`}
                  onClick={() => onFilterChange({ minRating: opt.value })}
                >
                  <div className="rating-stars-preview">
                    {opt.value > 0 ? (
                      <>
                        <IconStar size={15} filled={true} />
                        <span className="rating-num-label">{opt.label}</span>
                      </>
                    ) : (
                      <span className="rating-num-label">{opt.label}</span>
                    )}
                  </div>
                  {isSelected && <IconCheck size={14} className="filter-check-icon" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Minimum Discount Filter */}
        <div className="filter-section">
          <h4 className="filter-section-title">Deals & Discounts</h4>
          <div className="discount-pills-list">
            {discountOptions.map((disc, idx) => {
              const isSelected = filterState.minDiscount === disc.value;

              return (
                <button
                  key={idx}
                  type="button"
                  className={`discount-pill-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => onFilterChange({ minDiscount: disc.value })}
                >
                  {disc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Special Tags & Badges */}
        <div className="filter-section">
          <h4 className="filter-section-title">Collection & Badges</h4>
          <div className="tag-chips-wrap">
            {tags.map((tag, idx) => {
              const isSelected =
                (tag === 'All Tags' && (!filterState.selectedTag || filterState.selectedTag === 'All Tags')) ||
                filterState.selectedTag === tag;

              return (
                <button
                  key={idx}
                  type="button"
                  className={`tag-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => onFilterChange({ selectedTag: tag === 'All Tags' ? '' : tag })}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. In-Stock Availability Toggle */}
        <div className="filter-section filter-toggle-section">
          <div className="toggle-label-wrap">
            <strong className="toggle-title">In Stock Only</strong>
            <small className="toggle-subtitle">Exclude out-of-stock items</small>
          </div>
          <label className="switch-toggle" aria-label="Toggle in-stock items only">
            <input
              type="checkbox"
              checked={filterState.inStockOnly}
              onChange={(e) => onFilterChange({ inStockOnly: e.target.checked })}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {/* Mobile Apply Button */}
        {isOpenMobile && (
          <div className="mobile-drawer-footer">
            <button
              type="button"
              className="btn-primary-glow btn-full"
              onClick={onCloseMobile}
            >
              Apply Filters
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
