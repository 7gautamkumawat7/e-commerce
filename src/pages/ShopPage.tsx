import React, { useState, useMemo } from 'react';
import type { Product, Category, SortOption, ProductFilterState } from '../types.js';
import { FilterSidebar, ProductCard } from '../components/features/index.js';
import {
  IconSliders,
  IconSearch,
  IconFilter,
  IconGrid,
  IconList,
  IconX,
  IconRotateCcw
} from '../components/common/index.js';

interface ShopPageProps {
  products: readonly Product[];
  currentCategory: Category;
  searchQuery: string;
  onSelectCategory: (category: Category) => void;
  onSelectProduct: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
  pageTitle?: string;
  pageSubtitle?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  currentCategory,
  searchQuery,
  onSelectCategory,
  onSelectProduct,
  onOpenQuickView,
  pageTitle,
  pageSubtitle
}) => {
  const [filterState, setFilterState] = useState<ProductFilterState>({
    category: currentCategory,
    minPrice: 0,
    maxPrice: 20000,
    minRating: 0,
    minDiscount: 0,
    inStockOnly: false,
    selectedTag: '',
    searchQuery: searchQuery,
    sort: 'featured'
  });

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Keep category in sync if parent changes
  React.useEffect(() => {
    setFilterState((prev) => ({ ...prev, category: currentCategory }));
  }, [currentCategory]);

  // Keep search in sync if navbar search changes
  React.useEffect(() => {
    setFilterState((prev) => ({ ...prev, searchQuery }));
  }, [searchQuery]);

  const handleFilterChange = (updates: Partial<ProductFilterState>) => {
    setFilterState((prev) => {
      const next = { ...prev, ...updates };
      if (updates.category && updates.category !== prev.category) {
        onSelectCategory(updates.category);
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setFilterState({
      category: 'all',
      minPrice: 0,
      maxPrice: 20000,
      minRating: 0,
      minDiscount: 0,
      inStockOnly: false,
      selectedTag: '',
      searchQuery: '',
      sort: 'featured'
    });
    onSelectCategory('all');
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category
        if (filterState.category !== 'all' && p.category !== filterState.category) {
          return false;
        }

        // Search
        if (filterState.searchQuery) {
          const q = filterState.searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCat = p.categoryName.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchDesc) return false;
        }

        // Price
        if (p.price < filterState.minPrice || p.price > filterState.maxPrice) {
          return false;
        }

        // Rating
        if (filterState.minRating > 0 && p.rating < filterState.minRating) {
          return false;
        }

        // Discount
        if (filterState.minDiscount > 0) {
          const numDisc = parseInt(p.discount.replace(/[^0-9]/g, ''), 10) || 0;
          if (numDisc < filterState.minDiscount) return false;
        }

        // Tag
        if (
          filterState.selectedTag &&
          filterState.selectedTag !== 'All Tags' &&
          p.tag !== filterState.selectedTag
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filterState.sort === 'price-low') return a.price - b.price;
        if (filterState.sort === 'price-high') return b.price - a.price;
        if (filterState.sort === 'rating') return b.rating - a.rating;
        if (filterState.sort === 'discount') {
          const discA = parseInt(a.discount.replace(/[^0-9]/g, ''), 10) || 0;
          const discB = parseInt(b.discount.replace(/[^0-9]/g, ''), 10) || 0;
          return discB - discA;
        }
        return 0; // featured default
      });
  }, [products, filterState]);

  // Dynamic titles based on category
  const categoryTitles: Record<Category, { title: string; subtitle: string }> = {
    all: {
      title: pageTitle || 'Explore All Products',
      subtitle: pageSubtitle || 'Browse our complete catalog of hand-curated, authentic lifestyle and tech essentials.'
    },
    electronics: {
      title: 'Tech & Electronics Collection',
      subtitle: 'Premium audio, wearables, smart optics, and cutting-edge personal gadgets.'
    },
    fashion: {
      title: 'Fashion, Apparel & Accessories',
      subtitle: 'Modern minimalist timepieces, Italian leather essentials, and timeless wardrobe staples.'
    },
    home: {
      title: 'Home & Kitchen Essentials',
      subtitle: 'Artisan espresso machines, Scandinavian cookware, and ergonomic living solutions.'
    },
    beauty: {
      title: 'Beauty & Wellness Essentials',
      subtitle: 'Dermatologist-recommended skincare, ultrasonic facial devices, and aromatherapy.'
    },
    pets: {
      title: 'Pet Care & Accessories',
      subtitle: 'Orthopedic memory foam beds, interactive toys, and premium pet accessories.'
    }
  };

  const currentMeta = categoryTitles[filterState.category] || categoryTitles.all;

  // Active filter pills list
  const activeFilters = [];
  if (filterState.category !== 'all') {
    activeFilters.push({
      key: 'category',
      label: `Category: ${filterState.category.charAt(0).toUpperCase() + filterState.category.slice(1)}`,
      onRemove: () => handleFilterChange({ category: 'all' })
    });
  }
  if (filterState.minPrice > 0 || filterState.maxPrice < 20000) {
    activeFilters.push({
      key: 'price',
      label: `Price: ₹${filterState.minPrice} – ₹${filterState.maxPrice}`,
      onRemove: () => handleFilterChange({ minPrice: 0, maxPrice: 20000 })
    });
  }
  if (filterState.minRating > 0) {
    activeFilters.push({
      key: 'rating',
      label: `${filterState.minRating}★ & above`,
      onRemove: () => handleFilterChange({ minRating: 0 })
    });
  }
  if (filterState.minDiscount > 0) {
    activeFilters.push({
      key: 'discount',
      label: `${filterState.minDiscount}%+ Off`,
      onRemove: () => handleFilterChange({ minDiscount: 0 })
    });
  }
  if (filterState.selectedTag) {
    activeFilters.push({
      key: 'tag',
      label: `Tag: ${filterState.selectedTag}`,
      onRemove: () => handleFilterChange({ selectedTag: '' })
    });
  }
  if (filterState.searchQuery) {
    activeFilters.push({
      key: 'search',
      label: `Search: "${filterState.searchQuery}"`,
      onRemove: () => handleFilterChange({ searchQuery: '' })
    });
  }

  return (
    <div className="shop-page-container" id="shop-catalog-view">
      {/* Dynamic Header Banner with Breadcrumbs */}
      <div className="shop-hero-header">
        <nav className="shop-breadcrumb" aria-label="Breadcrumb">
          <button
            type="button"
            className="breadcrumb-link"
            onClick={() => {
              window.location.hash = '/';
            }}
          >
            Home
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">
            {filterState.category === 'all'
              ? 'Catalog'
              : filterState.category.charAt(0).toUpperCase() + filterState.category.slice(1)}
          </span>
        </nav>

        <h1 className="shop-page-title">{currentMeta.title}</h1>
        <p className="shop-page-subtitle">{currentMeta.subtitle}</p>
      </div>

      {/* Main Two-Column Layout: Sidebar + Product Grid */}
      <div className="shop-layout-grid">
        {/* Left Column: Filter Sidebar */}
        <FilterSidebar
          filterState={filterState}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          products={products}
          isOpenMobile={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />

        {/* Right Column: Catalog Content */}
        <main className="shop-content-area">
          {/* Top Controls Toolbar */}
          <div className="shop-toolbar-card">
            <div className="toolbar-left-group">
              {/* Mobile Filter Toggle Button */}
              <button
                type="button"
                className="mobile-filter-toggle-btn"
                onClick={() => setIsMobileDrawerOpen(true)}
              >
                <IconFilter size={16} />
                <span>Filters</span>
                {activeFilters.length > 0 && (
                  <span className="filter-badge-counter">{activeFilters.length}</span>
                )}
              </button>

              <span className="results-counter-pill">
                <strong>{filteredProducts.length}</strong> items available
              </span>
            </div>

            <div className="toolbar-right-group">
              {/* Sort Selector */}
              <div className="sort-dropdown-wrap">
                <IconSliders size={15} className="sort-icon-inline" />
                <label htmlFor="shop-sort-select" className="sr-only">
                  Sort by
                </label>
                <select
                  id="shop-sort-select"
                  className="shop-sort-select"
                  value={filterState.sort}
                  onChange={(e) => handleFilterChange({ sort: e.target.value as SortOption })}
                >
                  <option value="featured">Featured First</option>
                  <option value="discount">Biggest Discount</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="view-mode-toggle">
                <button
                  type="button"
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  title="Grid View"
                >
                  <IconGrid size={16} />
                </button>
                <button
                  type="button"
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  title="List View"
                >
                  <IconList size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {activeFilters.length > 0 && (
            <div className="active-filters-bar">
              <span className="active-filters-label">Active Filters:</span>
              <div className="filter-chips-list">
                {activeFilters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    className="active-filter-chip"
                    onClick={f.onRemove}
                    title="Click to remove"
                  >
                    <span>{f.label}</span>
                    <IconX size={12} className="chip-x" />
                  </button>
                ))}
                <button
                  type="button"
                  className="clear-all-link"
                  onClick={handleResetFilters}
                >
                  <IconRotateCcw size={12} />
                  <span>Clear All</span>
                </button>
              </div>
            </div>
          )}

          {/* Products Grid / List */}
          <div
            className={`catalog-products-container ${
              viewMode === 'list' ? 'list-view-mode' : 'grid-view-mode'
            }`}
            style={{ width: '100%' }}
          >
            {filteredProducts.length === 0 ? (
              <div className="empty-catalog-state">
                <div className="empty-catalog-icon">
                  <IconSearch size={38} />
                </div>
                <h3>No matching products found</h3>
                <p>
                  No items matched your current filter criteria. Try expanding your price range,
                  clearing applied filters, or selecting a different department.
                </p>
                <button
                  type="button"
                  className="btn-primary-glow btn-reset-filters"
                  onClick={handleResetFilters}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenQuickView={onOpenQuickView}
                  onSelectProduct={onSelectProduct}
                />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ShopPage;
