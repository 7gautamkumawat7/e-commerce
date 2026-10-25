import React, { useState, useEffect } from 'react';
import type { Category, Product } from '../types.js';
import { Hero, HERO_SLIDES } from '../components/Hero.js';
import { QuickLinks } from '../components/QuickLinks.js';
import { CategoryGrid } from '../components/CategoryGrid.js';
import { SplitBanner } from '../components/SplitBanner.js';
import { ProductCard } from '../components/ProductCard.js';
import {
  IconArrowRight,
  IconBolt,
  IconLaptop,
  IconShirt,
  IconHome,
  IconSparkleBeauty,
  IconPaw,
  IconStar,
  IconSparkles
} from '../components/Icons.js';

interface HomePageProps {
  products: readonly Product[];
  onSelectCategory: (category: Category) => void;
  onSelectProduct: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  onSelectCategory,
  onSelectProduct,
  onOpenQuickView
}) => {
  // Master 1.5-second heartbeat for both the main page ambient wallpaper and hero front background
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // Navigate to category or specific view
  const handleViewAllCategory = (cat: Category) => {
    onSelectCategory(cat);
    window.location.hash = `/category/${cat}`;
  };

  const handleViewAllDeals = () => {
    window.location.hash = '/deals';
  };

  const handleViewAllTopRated = () => {
    window.location.hash = '/top-rated';
  };

  // 0. Hero Showcase Products (Featured in the 1.5s rotating Hero Carousel)
  const showcaseProducts = React.useMemo(() => {
    const showcaseIds = [
      'elec-1',
      'elec-2',
      'elec-3',
      'home-4',
      'fash-1',
      'beauty-1'
    ];
    return showcaseIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);
  }, [products]);

  // 1. Deals of the Day (Top 10 highest discounts - completely fills 2 grid rows)
  const dealsOfDay = React.useMemo(() => {
    return [...products]
      .filter((p) => {
        const num = parseInt(p.discount.replace(/[^0-9]/g, ''), 10) || 0;
        return num > 0 || p.wasPrice !== undefined;
      })
      .sort((a, b) => {
        const discA = parseInt(a.discount.replace(/[^0-9]/g, ''), 10) || 0;
        const discB = parseInt(b.discount.replace(/[^0-9]/g, ''), 10) || 0;
        return discB - discA;
      })
      .slice(0, 10);
  }, [products]);

  // 2. Best of Tech & Electronics (10 products)
  const electronicsProducts = React.useMemo(() => {
    return products.filter((p) => p.category === 'electronics').slice(0, 10);
  }, [products]);

  // 3. Trending Fashion & Style (10 products)
  const fashionProducts = React.useMemo(() => {
    return products.filter((p) => p.category === 'fashion').slice(0, 10);
  }, [products]);

  // 4. Home & Living Essentials (10 products)
  const homeProducts = React.useMemo(() => {
    return products.filter((p) => p.category === 'home').slice(0, 10);
  }, [products]);

  // 5. Beauty & Wellness Essentials (10 products)
  const beautyProducts = React.useMemo(() => {
    return products.filter((p) => p.category === 'beauty').slice(0, 10);
  }, [products]);

  // 6. Pet Supplies & Accessories (10 products)
  const petProducts = React.useMemo(() => {
    return products.filter((p) => p.category === 'pets').slice(0, 10);
  }, [products]);

  // 7. Customer Top-Rated (10 products)
  const topRatedProducts = React.useMemo(() => {
    return [...products]
      .filter((p) => p.rating >= 4.7)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
  }, [products]);

  return (
    <div className="home-page-container">
      {/* Dynamic Main Page Ambient Backdrop that changes every 1.5s in sync with Hero */}
      <div className="main-page-ambient-backdrop" aria-hidden="true">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`main-page-bg-layer ${idx === heroSlide ? 'is-active' : ''}`}
            style={{ backgroundImage: `url('${slide.bgImage}')` }}
          />
        ))}
        <div className="main-page-bg-overlay" />
      </div>

      {/* 1. High-Impact Hero Banner with Synchronized 1.5s Background & Showcase */}
      <Hero
        currentSlide={heroSlide}
        onSlideChange={setHeroSlide}
        onSelectProduct={onSelectProduct}
        products={products}
      />

      {/* 2. Fast Benefits & Guarantees */}
      <QuickLinks />

      {/* 3. Featured in Today's 1.5s Showcase Products */}
      {showcaseProducts.length > 0 && (
        <section className="flipkart-shelf-section hero-showcase-section" aria-label="Featured in Today's 1.5s Showcase">
          <div className="flipkart-shelf-header">
            <div className="shelf-title-group">
              <div className="shelf-icon-badge shelf-badge-showcase" style={{ background: '#ede9fe', color: '#6366f1' }}>
                <IconSparkles size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 className="shelf-title">Featured in Today's 1.5s Showcase</h2>
                  <span className="hero-speed-badge" style={{ padding: '2px 8px', fontSize: '11px' }}>
                    <span className="hero-speed-badge-pulse"></span>
                    <span>Live 1.5s Carousel Collection</span>
                  </span>
                </div>
                <span className="shelf-subtitle">
                  Directly from our rotating hero showcase &bull; Instant Add to Cart &bull; Free Express Delivery
                </span>
              </div>
            </div>
            <button
              type="button"
              className="shelf-view-all-btn"
              onClick={() => { window.location.hash = '/shop'; }}
              aria-label="View all showcase products in catalog"
            >
              <span>EXPLORE ALL</span>
              <IconArrowRight size={13} />
            </button>
          </div>

          <div className="product-grid" style={{ width: '100%' }}>
            {showcaseProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenQuickView={onOpenQuickView}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Curated Category Showcase */}
      <CategoryGrid onSelectCategory={onSelectCategory} />

      {/* 4. Flipkart Shelf: Deals of the Day */}
      {dealsOfDay.length > 0 && (
        <section className="flipkart-shelf-section" aria-label="Deals of the Day">
          <div className="flipkart-shelf-header">
            <div className="shelf-title-group">
              <div className="shelf-icon-badge shelf-badge-deals">
                <IconBolt size={18} />
              </div>
              <div>
                <h2 className="shelf-title">Deals of the Day</h2>
                <span className="shelf-subtitle">Up to 45% Off &bull; Limited Time Deals</span>
              </div>
            </div>
            <button
              type="button"
              className="shelf-view-all-btn"
              onClick={handleViewAllDeals}
              aria-label="View all deals"
            >
              <span>VIEW ALL</span>
              <IconArrowRight size={13} />
            </button>
          </div>

          <div className="product-grid">
            {dealsOfDay.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenQuickView={onOpenQuickView}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. Split Promo Banners (Deals & Tech) */}
      <SplitBanner onSelectCategory={onSelectCategory} />

      {/* 6. Flipkart Shelf: Best of Electronics */}
      {electronicsProducts.length > 0 && (
        <section className="flipkart-shelf-section" aria-label="Best of Electronics">
          <div className="flipkart-shelf-header">
            <div className="shelf-title-group">
              <div className="shelf-icon-badge shelf-badge-tech">
                <IconLaptop size={18} />
              </div>
              <div>
                <h2 className="shelf-title">Best of Electronics</h2>
                <span className="shelf-subtitle">Headphones, Smartwatches, Cameras & Audio</span>
              </div>
            </div>
            <button
              type="button"
              className="shelf-view-all-btn"
              onClick={() => handleViewAllCategory('electronics')}
              aria-label="View all electronics"
            >
              <span>VIEW ALL</span>
              <IconArrowRight size={13} />
            </button>
          </div>

          <div className="product-grid">
            {electronicsProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenQuickView={onOpenQuickView}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. Flipkart Shelf: Trending Fashion & Style */}
      {fashionProducts.length > 0 && (
        <section className="flipkart-shelf-section" aria-label="Trending Fashion">
          <div className="flipkart-shelf-header">
            <div className="shelf-title-group">
              <div className="shelf-icon-badge shelf-badge-fashion">
                <IconShirt size={18} />
              </div>
              <div>
                <h2 className="shelf-title">Trending in Fashion</h2>
                <span className="shelf-subtitle">Minimalist Watches, Leather Goods & Essentials</span>
              </div>
            </div>
            <button
              type="button"
              className="shelf-view-all-btn"
              onClick={() => handleViewAllCategory('fashion')}
              aria-label="View all fashion"
            >
              <span>VIEW ALL</span>
              <IconArrowRight size={13} />
            </button>
          </div>

          <div className="product-grid">
            {fashionProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenQuickView={onOpenQuickView}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* 8. Flipkart Shelf: Home & Living Essentials */}
      {homeProducts.length > 0 && (
        <section className="flipkart-shelf-section" aria-label="Home and Living Essentials">
          <div className="flipkart-shelf-header">
            <div className="shelf-title-group">
              <div className="shelf-icon-badge shelf-badge-home">
                <IconHome size={18} />
              </div>
              <div>
                <h2 className="shelf-title">Home & Kitchen Essentials</h2>
                <span className="shelf-subtitle">Cookware, Espresso Machines & Organizers</span>
              </div>
            </div>
            <button
              type="button"
              className="shelf-view-all-btn"
              onClick={() => handleViewAllCategory('home')}
              aria-label="View all home products"
            >
              <span>VIEW ALL</span>
              <IconArrowRight size={13} />
            </button>
          </div>

          <div className="product-grid">
            {homeProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenQuickView={onOpenQuickView}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* 9. Flipkart Shelf: Beauty & Wellness Essentials */}
      {beautyProducts.length > 0 && (
        <section className="flipkart-shelf-section" aria-label="Beauty and Wellness Essentials">
          <div className="flipkart-shelf-header">
            <div className="shelf-title-group">
              <div className="shelf-icon-badge shelf-badge-beauty" style={{ background: '#ecfdf5', color: '#059669' }}>
                <IconSparkleBeauty size={18} />
              </div>
              <div>
                <h2 className="shelf-title">Beauty &amp; Wellness Essentials</h2>
                <span className="shelf-subtitle">Serums, Sonic Grooming &amp; Aromatherapy</span>
              </div>
            </div>
            <button
              type="button"
              className="shelf-view-all-btn"
              onClick={() => handleViewAllCategory('beauty')}
              aria-label="View all beauty products"
            >
              <span>VIEW ALL</span>
              <IconArrowRight size={13} />
            </button>
          </div>

          <div className="product-grid">
            {beautyProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenQuickView={onOpenQuickView}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* 10. Flipkart Shelf: Pet Supplies & Care */}
      {petProducts.length > 0 && (
        <section className="flipkart-shelf-section" aria-label="Pet Supplies and Care">
          <div className="flipkart-shelf-header">
            <div className="shelf-title-group">
              <div className="shelf-icon-badge shelf-badge-pets" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <IconPaw size={18} />
              </div>
              <div>
                <h2 className="shelf-title">Pet Care &amp; Supplies</h2>
                <span className="shelf-subtitle">Orthopedic Beds, Interactive Toys &amp; Feeders</span>
              </div>
            </div>
            <button
              type="button"
              className="shelf-view-all-btn"
              onClick={() => handleViewAllCategory('pets')}
              aria-label="View all pet supplies"
            >
              <span>VIEW ALL</span>
              <IconArrowRight size={13} />
            </button>
          </div>

          <div className="product-grid">
            {petProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenQuickView={onOpenQuickView}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* 11. Flipkart Shelf: Top-Rated Customer Favorites */}
      {topRatedProducts.length > 0 && (
        <section className="flipkart-shelf-section" aria-label="Top-Rated Customer Favorites">
          <div className="flipkart-shelf-header">
            <div className="shelf-title-group">
              <div className="shelf-icon-badge shelf-badge-rating">
                <IconStar size={18} filled={true} />
              </div>
              <div>
                <h2 className="shelf-title">Customer Acclaimed Favorites</h2>
                <span className="shelf-subtitle">Verified 4.8★ &amp; Above Community Choices</span>
              </div>
            </div>
            <button
              type="button"
              className="shelf-view-all-btn"
              onClick={handleViewAllTopRated}
              aria-label="View all top rated products"
            >
              <span>VIEW ALL</span>
              <IconArrowRight size={13} />
            </button>
          </div>

          <div className="product-grid">
            {topRatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenQuickView={onOpenQuickView}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
