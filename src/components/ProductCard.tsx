import React from 'react';
import type { Product } from '../types.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useToast } from '../context/ToastContext.js';
import { IconCart, IconHeart, IconEye, IconStar } from './Icons.js';

interface ProductCardProps {
  product: Product;
  onOpenQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenQuickView }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, 1);
    showToast(`Added "${product.name.substring(0, 24)}..." to cart!`, 'success');

    const cartBtn = document.getElementById('cart-button');
    if (cartBtn) {
      cartBtn.classList.add('bump-anim');
      setTimeout(() => cartBtn.classList.remove('bump-anim'), 400);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleWishlist(product.id);
    if (added) {
      showToast('Saved to your Wishlist!', 'success');
    } else {
      showToast('Removed from Wishlist', 'info');
    }
  };

  return (
    <article className="product-card dynamic-card" data-id={product.id}>
      <div className="product-image-wrap">
        {/* Deal Badge */}
        {product.discount && (
          <span className={`deal-badge ${product.badgeClass}`}>
            {product.discount}
          </span>
        )}

        {/* Wishlist Button with SVG Icon */}
        <button
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          title={isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
        >
          <IconHeart size={18} filled={isWishlisted} />
        </button>

        {/* High-Res Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="product-img"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3361_ELECTR_train.jpeg';
          }}
        />

        {/* Glassmorphic Quick View Overlay */}
        <div className="quick-overlay">
          <button
            className="quick-view-btn"
            onClick={() => onOpenQuickView(product)}
            aria-label={`Quick view ${product.name}`}
          >
            <IconEye size={16} />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      <div className="product-info">
        <div className="meta-row">
          <span className="cat-tag">{product.categoryName}</span>
          <div className="rating-pill">
            <IconStar size={13} filled={true} />
            <span className="rating-val">{product.rating}</span>
            <span className="review-val">({product.reviews})</span>
          </div>
        </div>

        <h3
          className="product-title"
          onClick={() => onOpenQuickView(product)}
          title={product.name}
        >
          {product.name}
        </h3>

        <div className="pricing-row">
          <div className="price-box">
            <span className="price">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.wasPrice && (
              <span className="was-price">₹{product.wasPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
          <span className="stock-pill">In Stock</span>
        </div>

        <button
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          aria-label={`Add ${product.name} to cart`}
        >
          <IconCart size={17} />
          <span>Add to Cart</span>
        </button>
      </div>
    </article>
  );
};
