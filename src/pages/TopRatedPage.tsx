import React, { useState } from 'react';
import type { Product, Category } from '../types.js';
import { ProductCard } from '../components/features/index.js';
import { IconStar } from '../components/common/index.js';

interface TopRatedPageProps {
  products: readonly Product[];
  onSelectCategory: (category: Category) => void;
  onSelectProduct: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
}

export const TopRatedPage: React.FC<TopRatedPageProps> = ({
  products,
  onSelectProduct,
  onOpenQuickView
}) => {
  const [minRating, setMinRating] = useState<number>(4.6);

  // Highest rated products
  const topRatedProducts = products
    .filter((p) => p.rating >= minRating)
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);

  const testimonials = [
    {
      author: 'Vikram Mehta',
      city: 'Bengaluru',
      quote:
        'The ANC Headphones and smart tracker watch have transformed my work-from-home routine. Fast delivery and stellar build quality.',
      rating: 5,
      productName: 'ANC Wireless Over-Ear Headphones'
    },
    {
      author: 'Ananya Deshpande',
      city: 'Mumbai',
      quote:
        'Ordered the vintage instant camera for my sister’s anniversary. She was thrilled! Authentic products and seamless Razorpay checkout.',
      rating: 5,
      productName: 'Vintage Instant Print Camera'
    },
    {
      author: 'Kunal Sen',
      city: 'New Delhi',
      quote:
        'The espresso machine delivers true cafe-quality crema every single morning. Top-notch customer support and easy warranty registration.',
      rating: 5,
      productName: '15-Bar Italian Pump Espresso Machine'
    }
  ];

  return (
    <div className="top-rated-page-container">
      {/* 1. Header Hero */}
      <section className="top-rated-hero">
        <div className="top-rated-hero-badge">
          <IconStar size={16} filled={true} />
          <span>CUSTOMER ACCLAIMED & BEST SELLERS</span>
        </div>
        <h1 className="top-rated-title">Highest-Rated Essentials</h1>
        <p className="top-rated-subtitle">
          Explore products verified with 4.6+ star ratings by over 15,000 real shoppers. Every item here represents industry-leading quality, durability, and user satisfaction.
        </p>

        {/* Rating Filter Pills */}
        <div className="rating-tier-pills">
          {[
            { label: 'All Top Rated (4.5★+)', val: 4.5 },
            { label: 'Highest Rated (4.7★+)', val: 4.7 },
            { label: 'Flawless 4.8★ & Above', val: 4.8 }
          ].map((tier) => (
            <button
              key={tier.val}
              type="button"
              className={`filter-pill ${minRating === tier.val ? 'active' : ''}`}
              onClick={() => setMinRating(tier.val)}
            >
              <IconStar size={14} filled={true} />
              <span>{tier.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Customer Testimonial Quotes Carousel / Grid */}
      <section className="testimonials-cards-grid">
        {testimonials.map((t, idx) => (
          <div key={idx} className="testimonial-card">
            <div className="testimonial-stars-row">
              {[...Array(t.rating)].map((_, i) => (
                <IconStar key={i} size={15} filled={true} />
              ))}
            </div>
            <p className="testimonial-quote">"{t.quote}"</p>
            <div className="testimonial-author-row">
              <div className="author-avatar">{t.author.charAt(0)}</div>
              <div>
                <strong className="author-name">{t.author}</strong>
                <small className="author-city">Verified Buyer &bull; {t.city}</small>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 3. Products Grid */}
      <div className="section-heading" style={{ marginTop: '20px' }}>
        <div className="heading-text-group">
          <p className="eyebrow">COMMUNITY FAVORITES</p>
          <h2 className="section-title">
            Top Rated Selection ({topRatedProducts.length} Items)
          </h2>
        </div>
      </div>

      <div className="product-grid" id="top-rated-product-grid">
        {topRatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenQuickView={onOpenQuickView}
            onSelectProduct={onSelectProduct}
          />
        ))}
      </div>
    </div>
  );
};

export default TopRatedPage;
