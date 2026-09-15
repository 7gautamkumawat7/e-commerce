import React, { useState } from 'react';
import type { Product } from '../types.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useToast } from '../context/ToastContext.js';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(`🛒 Added ${quantity}x "${product.name.substring(0, 20)}..." to cart!`, 'success');
    onClose();
    openCart();
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
    <div className="modal-overlay open" id="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-modal-btn" id="close-modal-btn" aria-label="Close product preview" onClick={onClose}>
          ✕
        </button>
        <div id="modal-product-body">
          <div className="modal-product-grid">
            <div className="modal-media">
              <span className={`deal-badge ${product.badgeClass}`}>{product.discount}</span>
              <img
                src={product.image}
                alt={product.name}
                className="modal-img"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3361_ELECTR_train.jpeg';
                }}
              />
            </div>
            <div className="modal-info">
              <div className="modal-header-meta">
                <span className="cat-tag">{product.categoryName}</span>
                <span className="tag-pill">{product.tag}</span>
              </div>
              <h2>{product.name}</h2>
              <div className="modal-rating">
                <span className="stars">★★★★★</span>
                <span className="score">{product.rating}</span>
                <span className="rev-count">({product.reviews} verified customer reviews)</span>
              </div>

              <div className="modal-price-box">
                <span className="modal-price">₹{product.price.toLocaleString('en-IN')}</span>
                {product.wasPrice && (
                  <span className="modal-was-price">₹{product.wasPrice.toLocaleString('en-IN')}</span>
                )}
                <span className="modal-save-pill">Save {product.discount}</span>
              </div>

              <p className="modal-desc">{product.description}</p>

              <div className="modal-features">
                <h4>Key Features & Highlights:</h4>
                <ul>
                  {product.features.map((f, i) => (
                    <li key={i}>✓ {f}</li>
                  ))}
                </ul>
              </div>

              <div className="modal-actions-box">
                <div className="modal-qty">
                  <label htmlFor="modal-qty-input">Qty:</label>
                  <input
                    type="number"
                    id="modal-qty-input"
                    value={quantity}
                    min="1"
                    max="10"
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
                <button className="primary-button modal-add-btn" onClick={handleAddToCart}>
                  Add to Cart 🛒
                </button>
                <button
                  className={`wishlist-btn-large ${isWishlisted ? 'active' : ''}`}
                  onClick={handleWishlistToggle}
                >
                  {isWishlisted ? '❤️ Saved' : '🤍 Wishlist'}
                </button>
              </div>

              <div className="modal-guarantees">
                <span>🚚 Free 2-Day Delivery over ₹499</span>
                <span>🔒 30-Day Hassle-Free Returns</span>
                <span>🛡️ 1-Year Official Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
