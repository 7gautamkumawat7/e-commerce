import React from 'react';
import type { Product } from '../types.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useToast } from '../context/ToastContext.js';

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
    showToast(`🛒 Added "${product.name.substring(0, 24)}..." to cart!`, 'success');

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
      showToast('❤️ Added to your Wishlist!', 'success');
    } else {
      showToast('🤍 Removed from Wishlist', 'info');
    }
  };

  return (
    <article className="product-card dynamic-card" data-id={product.id}>
      <div className="product-image-wrap">
        <span className={`deal-badge ${product.badgeClass}`}>{product.discount}</span>
        <button
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          aria-label="Add to wishlist"
          title="Save to wishlist"
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
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
        <div className="quick-overlay">
          <button className="quick-view-btn" onClick={() => onOpenQuickView(product)}>
            Quick View 👁️
          </button>
        </div>
      </div>

      <div className="product-info">
        <div className="meta-row">
          <span className="cat-tag">{product.categoryName}</span>
          <span className="rating">
            ★ {product.rating} <small>({product.reviews})</small>
          </span>
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

        <button className="add-to-cart-btn" onClick={handleAddToCart}>
          <span>🛒</span> Add to Cart
        </button>
      </div>
    </article>
  );
};
