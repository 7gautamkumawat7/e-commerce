import React, { useState, useEffect } from 'react';
import type { Product, Category } from '../types.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useToast } from '../context/ToastContext.js';
import {
  getReviewsForProduct,
  addReviewForProduct,
  voteHelpful,
  getReviewStats
} from '../data/reviews.js';
import {
  IconStar,
  IconHeart,
  IconCart,
  IconBolt,
  IconTruck,
  IconShieldCheck,
  IconRotateCcw,
  IconCheck,
  IconArrowLeft,
  IconThumbsUp,
  IconMapPin
} from '../components/common/index.js';
import { ProductCard } from '../components/features/index.js';

interface ProductDetailPageProps {
  product: Product;
  allProducts: readonly Product[];
  onBack: () => void;
  onSelectCategory: (category: Category) => void;
  onSelectProduct: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onBack,
  onSelectCategory,
  onSelectProduct,
  onOpenQuickView,
  onBuyNow
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedColor, setSelectedColor] = useState('Default');
  const [activeTab, setActiveTab] = useState<'reviews' | 'description'>('reviews');
  const [starFilter, setStarFilter] = useState<number>(0);

  // Reviews state
  const [reviewsList, setReviewsList] = useState(() => getReviewsForProduct(product.id));
  const [reviewStats, setReviewStats] = useState(() => getReviewStats(product.id));

  // Write a Review Form state
  const [isWriteFormOpen, setIsWriteFormOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newHoverRating, setNewHoverRating] = useState(0);
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');

  // Delivery check state
  const [pincode, setPincode] = useState('');
  const [deliveryResult, setDeliveryResult] = useState<string | null>(null);

  const isWishlisted = isInWishlist(product.id);

  // Sync state when product changes
  useEffect(() => {
    setSelectedImage(product.image);
    setQuantity(1);
    setReviewsList(getReviewsForProduct(product.id));
    setReviewStats(getReviewStats(product.id));
    setDeliveryResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id, product.image]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(`Added ${quantity}x "${product.name}" to cart!`, 'success');

    const cartBtn = document.getElementById('cart-button');
    if (cartBtn) {
      cartBtn.classList.add('bump-anim');
      setTimeout(() => cartBtn.classList.remove('bump-anim'), 400);
    }
  };

  const handleBuyNowClick = () => {
    onBuyNow(product, quantity);
  };

  const handleWishlistToggle = () => {
    const added = toggleWishlist(product.id);
    showToast(
      added ? 'Saved to your Wishlist!' : 'Removed from your Wishlist',
      added ? 'success' : 'info'
    );
  };

  const handleCheckDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.trim().length < 6) {
      showToast('Please enter a valid 6-digit postal code', 'error');
      return;
    }
    const days = Math.floor(Math.random() * 2) + 1;
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + days);
    const dateFormatted = estDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    setDeliveryResult(`FREE Express Delivery by ${dateFormatted} for pincode ${pincode}`);
    showToast(`Delivery available to pincode ${pincode}!`, 'success');
  };

  const handleHelpfulVote = (reviewId: string) => {
    const increment = voteHelpful(reviewId);
    if (increment > 0) {
      setReviewsList((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
      );
      showToast('Thank you for your feedback!', 'success');
    } else {
      showToast('You already voted on this review.', 'info');
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newTitle.trim() || !newComment.trim()) {
      showToast('Please fill out all review fields before submitting.', 'error');
      return;
    }

    const created = addReviewForProduct(product.id, {
      userName: newName.trim(),
      rating: newRating,
      title: newTitle.trim(),
      comment: newComment.trim()
    });

    setReviewsList((prev) => [created, ...prev]);
    setReviewStats(getReviewStats(product.id));
    setIsWriteFormOpen(false);
    setNewName('');
    setNewTitle('');
    setNewComment('');
    setNewRating(5);
    setActiveTab('reviews');
    showToast('Your verified review has been published! Thank you.', 'success');
  };

  // Filter reviews by rating if starFilter is set
  const filteredReviews = reviewsList.filter((r) => {
    if (starFilter === 0) return true;
    return Math.round(r.rating) === starFilter;
  });

  // Related products from the same category (fill shelf completely)
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 8);

  // Gallery angles
  const galleryThumbnails = [
    product.image,
    'products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3361_ELECTR_train.jpeg',
    'products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3368_ELECTR_train.jpeg'
  ];

  const colors = ['Midnight Black', 'Platinum Silver', 'Deep Navy'];

  return (
    <div className="product-detail-page" id="product-detail-view">
      {/* Breadcrumbs Navigation */}
      <nav className="detail-breadcrumb-bar" aria-label="Breadcrumb">
        <button type="button" className="breadcrumb-back-btn" onClick={onBack}>
          <IconArrowLeft size={16} />
          <span>Back to Catalog</span>
        </button>

        <span className="breadcrumb-separator">/</span>
        <button
          type="button"
          className="breadcrumb-crumb"
          onClick={() => {
            window.location.hash = '/';
          }}
        >
          Home
        </button>

        <span className="breadcrumb-separator">/</span>
        <button
          type="button"
          className="breadcrumb-crumb"
          onClick={() => {
            onSelectCategory(product.category);
            window.location.hash = `/category/${product.category}`;
          }}
        >
          {product.categoryName}
        </button>

        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current" title={product.name}>
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase Two-Column Grid */}
      <section className="product-showcase-grid">
        {/* Left Column: Gallery & Image Zoom */}
        <div className="product-gallery-column">
          <div className="main-image-frame">
            {product.discount && (
              <span className={`detail-deal-badge ${product.badgeClass}`}>
                {product.discount}
              </span>
            )}

            <button
              type="button"
              className={`detail-wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={handleWishlistToggle}
              title={isWishlisted ? 'In Wishlist' : 'Save to Wishlist'}
            >
              <IconHeart size={20} filled={isWishlisted} />
            </button>

            <img
              src={selectedImage}
              alt={product.name}
              className="main-detail-img"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = product.image;
              }}
            />

            <span className="image-zoom-hint">Hover to view high resolution details</span>
          </div>

          {/* Gallery Thumbnails */}
          <div className="gallery-thumbnails-strip">
            {galleryThumbnails.map((imgSrc, idx) => (
              <button
                key={idx}
                type="button"
                className={`gallery-thumb-btn ${selectedImage === imgSrc ? 'active' : ''}`}
                onClick={() => setSelectedImage(imgSrc)}
              >
                <img src={imgSrc} alt={`${product.name} thumbnail ${idx + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Information, Pricing & Actions */}
        <div className="product-info-column">
          <div className="detail-meta-header">
            <span className="detail-category-pill">{product.categoryName}</span>
            <span className="detail-tag-pill">{product.tag || 'Top Choice'}</span>
            <span className="detail-sku-pill">SKU: {product.id.toUpperCase()}</span>
          </div>

          <h1 className="detail-product-title">{product.name}</h1>

          {/* Rating Summary Link */}
          <div className="detail-rating-row">
            <div className="rating-pill rating-pill-large">
              <IconStar size={16} filled={true} />
              <strong className="rating-score">{reviewStats.average}</strong>
            </div>

            <button
              type="button"
              className="reviews-jump-btn"
              onClick={() => {
                setActiveTab('reviews');
                const el = document.getElementById('reviews-section-anchor');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>{reviewStats.total} customer ratings & reviews</span>
            </button>

            <span className="verified-badge-pill">
              <IconCheck size={12} />
              <span>Verified Authenticity</span>
            </span>
          </div>

          {/* Price & Savings Box */}
          <div className="detail-price-box">
            <div className="price-main-line">
              <span className="currency-symbol">₹</span>
              <span className="detail-price-number">
                {product.price.toLocaleString('en-IN')}
              </span>
              {product.wasPrice && (
                <span className="detail-was-price">
                  ₹{product.wasPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {product.wasPrice && (
              <div className="savings-alert-pill">
                <IconBolt size={14} className="text-amber" />
                <span>
                  You save ₹{(product.wasPrice - product.price).toLocaleString('en-IN')} (
                  {product.discount || 'Special Discount'})
                </span>
              </div>
            )}
            <small className="detail-tax-notice">Inclusive of all taxes &bull; Free standard shipping</small>
          </div>

          {/* Key Features Bullet List */}
          <div className="detail-features-box">
            <h4 className="features-headline">Key Highlights:</h4>
            <ul className="features-checklist">
              {product.features && product.features.length > 0 ? (
                product.features.map((feat, idx) => (
                  <li key={idx} className="feature-item">
                    <IconCheck size={16} className="feature-check" />
                    <span>{feat}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="feature-item">
                    <IconCheck size={16} className="feature-check" />
                    <span>Engineered with premium, durable materials for longevity</span>
                  </li>
                  <li className="feature-item">
                    <IconCheck size={16} className="feature-check" />
                    <span>100% genuine guaranteed with official manufacturer warranty</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Color Finish Picker */}
          <div className="variant-selector-wrap">
            <span className="variant-label">
              Color: <strong>{selectedColor}</strong>
            </span>
            <div className="variant-options-row">
              {colors.map((color, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`variant-option-chip ${selectedColor === color ? 'active' : ''}`}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & CTA Purchase Group */}
          <div className="purchase-action-container">
            <div className="quantity-control-group">
              <span className="qty-label">Quantity:</span>
              <div className="qty-picker">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="qty-display">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="cta-buttons-row">
              <button
                type="button"
                className="btn-add-cart-large"
                onClick={handleAddToCart}
              >
                <IconCart size={20} />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                className="btn-buy-now-large"
                onClick={handleBuyNowClick}
              >
                <IconBolt size={20} />
                <span>Buy Now (Instant Checkout)</span>
              </button>
            </div>
          </div>

          {/* Pincode Delivery Estimator */}
          <div className="delivery-estimator-box">
            <div className="estimator-title-row">
              <IconTruck size={18} className="text-primary" />
              <strong>Delivery Options & Check Pincode</strong>
            </div>

            <form onSubmit={handleCheckDelivery} className="pincode-form">
              <div className="pincode-input-wrap">
                <IconMapPin size={16} className="pincode-icon" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="pincode-input"
                />
              </div>
              <button type="submit" className="pincode-check-btn">
                Check
              </button>
            </form>

            {deliveryResult && (
              <div className="delivery-success-alert">
                <IconCheck size={16} />
                <span>{deliveryResult}</span>
              </div>
            )}
          </div>

          {/* Trust Guarantees Grid */}
          <div className="trust-guarantees-grid">
            <div className="trust-pill-item">
              <IconShieldCheck size={20} className="trust-badge-icon" />
              <div>
                <strong>100% Authentic</strong>
                <small>Genuine Product</small>
              </div>
            </div>
            <div className="trust-pill-item">
              <IconRotateCcw size={20} className="trust-badge-icon" />
              <div>
                <strong>30-Day Returns</strong>
                <small>Hassle-free guarantee</small>
              </div>
            </div>
            <div className="trust-pill-item">
              <IconTruck size={20} className="trust-badge-icon" />
              <div>
                <strong>Free Delivery</strong>
                <small>Orders over ₹499</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Information & Customer Reviews Tabbed Section */}
      <section className="product-details-tab-section" id="reviews-section-anchor">
        <div className="detail-tabs-header" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'reviews'}
            className={`detail-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <IconStar size={17} />
            <span>Customer Reviews & Ratings ({reviewStats.total})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'description'}
            className={`detail-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            <span>Overview & Technical Specifications</span>
          </button>
        </div>

        {/* Tab 1: Customer Reviews & Ratings */}
        {activeTab === 'reviews' && (
          <div className="tab-panel reviews-tab-panel">
            {/* Reviews Score Card & Breakdown */}
            <div className="reviews-score-card">
              <div className="overall-score-column">
                <span className="big-rating-number">{reviewStats.average}</span>
                <div className="stars-cluster">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IconStar
                      key={star}
                      size={20}
                      filled={star <= Math.round(reviewStats.average)}
                    />
                  ))}
                </div>
                <span className="total-ratings-text">
                  Based on {reviewStats.total} customer evaluations
                </span>
                <span className="verified-recommend-rate">
                  98% of customers recommend this product
                </span>

                <button
                  type="button"
                  className="btn-primary-glow btn-write-review-trigger"
                  onClick={() => setIsWriteFormOpen((prev) => !prev)}
                >
                  {isWriteFormOpen ? 'Close Review Form' : 'Write a Customer Review'}
                </button>
              </div>

              {/* Star Distribution Breakdown */}
              <div className="rating-bars-column">
                <h4 className="breakdown-title">Rating Breakdown</h4>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const pct = reviewStats.percentageBreakdown[stars] || 0;
                  const count = reviewStats.breakdown[stars] || 0;
                  const isSelected = starFilter === stars;

                  return (
                    <button
                      key={stars}
                      type="button"
                      className={`rating-bar-row ${isSelected ? 'active-filter' : ''}`}
                      onClick={() => setStarFilter((prev) => (prev === stars ? 0 : stars))}
                      title={`Filter by ${stars} star reviews`}
                    >
                      <span className="star-bar-label">{stars} Star</span>
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="star-pct-label">{pct}%</span>
                      <span className="star-count-label">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Write A Review Form */}
            {isWriteFormOpen && (
              <form onSubmit={handleSubmitReview} className="write-review-form">
                <div className="form-heading-row">
                  <h3>Share Your Experience with this Product</h3>
                  <p>Your honest review helps fellow shoppers make informed choices.</p>
                </div>

                {/* Clickable Star Rating Input */}
                <div className="form-group star-rating-picker-group">
                  <label className="form-label">Overall Rating *</label>
                  <div className="interactive-stars-row">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (newHoverRating || newRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          className="star-input-btn"
                          onMouseEnter={() => setNewHoverRating(star)}
                          onMouseLeave={() => setNewHoverRating(0)}
                          onClick={() => setNewRating(star)}
                          aria-label={`Rate ${star} out of 5 stars`}
                        >
                          <IconStar size={28} filled={isFilled} />
                        </button>
                      );
                    })}
                    <span className="star-selected-feedback">
                      {newRating === 5 && 'Excellent - 5 Stars'}
                      {newRating === 4 && 'Good - 4 Stars'}
                      {newRating === 3 && 'Average - 3 Stars'}
                      {newRating === 2 && 'Fair - 2 Stars'}
                      {newRating === 1 && 'Poor - 1 Star'}
                    </span>
                  </div>
                </div>

                <div className="form-row-dual">
                  <div className="form-group">
                    <label className="form-label">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Review Headline *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Exceptional sound and battery life!"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Comments & Feedback *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what you liked, features that stood out, or any suggestions for improvement..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="form-textarea"
                  />
                </div>

                <div className="form-actions-row">
                  <button
                    type="button"
                    className="btn-secondary-glass"
                    onClick={() => setIsWriteFormOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-glow">
                    Submit Verified Review
                  </button>
                </div>
              </form>
            )}

            {/* Filter chips if a star filter is applied */}
            {starFilter > 0 && (
              <div className="reviews-active-filter-bar">
                <span>Showing {starFilter}-star reviews only ({filteredReviews.length})</span>
                <button
                  type="button"
                  className="clear-star-filter-btn"
                  onClick={() => setStarFilter(0)}
                >
                  Show all reviews
                </button>
              </div>
            )}

            {/* Customer Reviews Feed */}
            <div className="reviews-feed-container">
              {filteredReviews.length === 0 ? (
                <div className="empty-reviews-state">
                  <p>No reviews found for this star rating filter.</p>
                  <button
                    type="button"
                    className="btn-secondary-glass"
                    onClick={() => setStarFilter(0)}
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                filteredReviews.map((rev) => (
                  <article key={rev.id} className="review-card">
                    <div className="review-card-header">
                      <div className="reviewer-info-group">
                        <div className="reviewer-avatar">
                          {rev.userAvatar || rev.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong className="reviewer-name">{rev.userName}</strong>
                          {rev.verifiedPurchase && (
                            <span className="verified-badge">
                              <IconCheck size={11} />
                              <span>Verified Purchase</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="review-date">{rev.date}</span>
                    </div>

                    <div className="review-rating-line">
                      <div className="stars-mini-row">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <IconStar
                            key={s}
                            size={14}
                            filled={s <= rev.rating}
                          />
                        ))}
                      </div>
                      <h4 className="review-headline">{rev.title}</h4>
                    </div>

                    <p className="review-body-text">{rev.comment}</p>

                    <div className="review-footer-bar">
                      <button
                        type="button"
                        className="helpful-vote-btn"
                        onClick={() => handleHelpfulVote(rev.id)}
                      >
                        <IconThumbsUp size={14} />
                        <span>Helpful ({rev.helpfulCount})</span>
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Overview & Technical Specifications */}
        {activeTab === 'description' && (
          <div className="tab-panel description-tab-panel">
            <div className="description-text-block">
              <h3 className="sub-headline">Product Overview</h3>
              <p className="lead-paragraph">{product.description}</p>
              <p>
                Engineered for maximum reliability and daily convenience, each unit undergoes strict quality control and safety certifications before arriving at your doorstep. Backed by our standard 30-day money-back guarantee and dedicated round-the-clock customer support.
              </p>
            </div>

            <div className="specifications-table-block">
              <h3 className="sub-headline">Technical Specifications</h3>
              <table className="specs-table">
                <tbody>
                  <tr>
                    <th>Product Model</th>
                    <td>{product.name}</td>
                  </tr>
                  <tr>
                    <th>Category</th>
                    <td>{product.categoryName}</td>
                  </tr>
                  <tr>
                    <th>Model Identifier</th>
                    <td>{product.id.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <th>Warranty Period</th>
                    <td>1 Year Limited Manufacturer Warranty</td>
                  </tr>
                  <tr>
                    <th>In The Box</th>
                    <td>1x Main Unit, User Guide, Warranty Card, Accessories</td>
                  </tr>
                  <tr>
                    <th>Return Policy</th>
                    <td>30-Day Free Replacement or Full Refund</td>
                  </tr>
                  <tr>
                    <th>Country of Origin</th>
                    <td>India</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Related / Similar Products Section */}
      {relatedProducts.length > 0 && (
        <section className="section-block related-products-section">
          <div className="section-heading">
            <div className="heading-text-group">
              <p className="eyebrow">SIMILAR RECOMMENDATIONS</p>
              <h2 className="section-title">Customers Also Explored</h2>
            </div>
          </div>

          <div className="product-grid">
            {relatedProducts.map((relProduct) => (
              <ProductCard
                key={relProduct.id}
                product={relProduct}
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

export default ProductDetailPage;
