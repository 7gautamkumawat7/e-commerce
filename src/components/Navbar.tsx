import React, { useState, useRef, useEffect } from 'react';
import type { Category } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { useLocation } from '../context/LocationContext.js';
import { useToast } from '../context/ToastContext.js';

interface NavbarProps {
  currentCategory: Category;
  onSelectCategory: (category: Category) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  onNavigate: (view: 'store' | 'account', tab?: 'profile' | 'orders' | 'wishlist' | 'addresses') => void;
  currentView: 'store' | 'account';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCategory,
  onSelectCategory,
  onSearch,
  searchQuery,
  onNavigate,
  currentView
}) => {
  const { currentUser, openAuthModal, logout } = useAuth();
  const { summary, openCart } = useCart();
  const { currentLocation, isDetecting, openLocationModal, detectLocation } = useLocation();
  const { showToast } = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const locationText = currentLocation.formatted || 'Detecting Location...';
  const userGreeting = currentUser
    ? `Hello, ${currentUser.name.split(' ')[0]}`
    : 'Hello, sign in';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput.trim().toLowerCase());
    if (currentView !== 'store') {
      onNavigate('store');
    }
  };

  const handleCategorySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value.toLowerCase();
    let cat: Category = 'all';
    if (selected === 'tech & electronics') cat = 'electronics';
    else if (selected === 'fashion & style') cat = 'fashion';
    else if (selected === 'home & living') cat = 'home';
    else if (selected === 'beauty & wellness') cat = 'beauty';
    else if (selected === 'pet supplies') cat = 'pets';

    onSelectCategory(cat);
    if (currentView !== 'store') {
      onNavigate('store');
    }
  };

  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: '☰ All Products' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'fashion', label: 'Fashion' },
    { id: 'home', label: 'Home & Kitchen' },
    { id: 'beauty', label: 'Beauty' },
    { id: 'pets', label: 'Pet Supplies' }
  ];

  return (
    <div className="navbar-wrapper">
      {/* 1. Top Strip Announcement */}
      <div className="top-strip">
        <p>
          🚚 Free delivery on orders over ₹499 | Use code <strong>SUMMER20</strong> for 20% off
        </p>
        <div className="top-links">
          <a
            href="javascript:void(0)"
            onClick={() => {
              if (currentView !== 'store') onNavigate('store');
              const el = document.getElementById('product-catalog-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Today's Deals
          </a>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('📞 Customer support is available 24/7 at support@shopcart.com', 'info')}
          >
            Customer Service
          </a>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('💼 Merchant partner portal opening soon!', 'info')}
          >
            Sell with us
          </a>
        </div>
      </div>

      {/* 2. Main Header Bar */}
      <header className="main-header">
        <a
          className="brand"
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('store');
          }}
        >
          <span className="brand-mark">shop</span>
          <span className="brand-dot">.</span>
          <small>Everything delivered</small>
        </a>

        {/* Deliver to widget - Auto Detect & Modal trigger */}
        <div
          className={`location ${isDetecting ? 'detecting' : ''}`}
          onClick={openLocationModal}
          title="Click to change or auto-detect delivery location"
          style={{ cursor: 'pointer' }}
        >
          <span className="location-icon">{isDetecting ? '⏳' : '⌖'}</span>
          <span>
            <small>Deliver to</small>
            <strong className="location-pill-text">
              {isDetecting ? 'Locating...' : locationText}
            </strong>
          </span>
          <button
            className="quick-gps-btn"
            title="Auto-detect real GPS location"
            onClick={(e) => {
              e.stopPropagation();
              detectLocation();
            }}
          >
            🎯
          </button>
        </div>

        <form className="search-bar" id="search-form" onSubmit={handleSearchSubmit}>
          <select
            id="header-category-select"
            aria-label="Search category"
            onChange={handleCategorySelectChange}
            value={
              currentCategory === 'electronics'
                ? 'tech & electronics'
                : currentCategory === 'fashion'
                ? 'fashion & style'
                : currentCategory === 'home'
                ? 'home & living'
                : currentCategory === 'beauty'
                ? 'beauty & wellness'
                : currentCategory === 'pets'
                ? 'pet supplies'
                : 'all'
            }
          >
            <option value="all">All Categories</option>
            <option value="tech & electronics">Electronics</option>
            <option value="fashion & style">Fashion</option>
            <option value="home & living">Home & Living</option>
            <option value="beauty & wellness">Beauty</option>
            <option value="pet supplies">Pet Supplies</option>
          </select>
          <input
            type="search"
            id="search-input"
            placeholder="Search products, brands, and categories..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              onSearch(e.target.value.trim().toLowerCase());
            }}
          />
          <button type="submit" aria-label="Search">
            ⌕
          </button>
        </form>

        <div className="header-actions">
          {/* User Account Menu with Dropdown */}
          <div className="account-menu-wrapper" ref={dropdownRef}>
            <a
              href="javascript:void(0)"
              className="account"
              id="account-menu-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (currentUser) {
                  setIsDropdownOpen((prev) => !prev);
                } else {
                  openAuthModal('login');
                }
              }}
            >
              <small>{userGreeting}</small>
              <strong>Account & Lists ▾</strong>
            </a>

            {currentUser && isDropdownOpen && (
              <div className="account-dropdown active" id="account-dropdown-menu">
                <div className="dropdown-user-header">
                  <span className="dropdown-avatar">{currentUser.name.charAt(0)}</span>
                  <div>
                    <strong>{currentUser.name}</strong>
                    <small>{currentUser.email}</small>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <a
                  href="javascript:void(0)"
                  onClick={() => {
                    onNavigate('account', 'profile');
                    setIsDropdownOpen(false);
                  }}
                  className="dropdown-link"
                >
                  <span>👤</span> Your Profile
                </a>
                <a
                  href="javascript:void(0)"
                  onClick={() => {
                    onNavigate('account', 'orders');
                    setIsDropdownOpen(false);
                  }}
                  className="dropdown-link"
                >
                  <span>📦</span> Your Orders
                </a>
                <a
                  href="javascript:void(0)"
                  onClick={() => {
                    onNavigate('account', 'wishlist');
                    setIsDropdownOpen(false);
                  }}
                  className="dropdown-link"
                >
                  <span>❤️</span> Saved Wishlist
                </a>
                <a
                  href="javascript:void(0)"
                  onClick={() => {
                    onNavigate('account', 'addresses');
                    setIsDropdownOpen(false);
                  }}
                  className="dropdown-link"
                >
                  <span>🏠</span> Delivery Addresses
                </a>
                <div className="dropdown-divider"></div>
                <a
                  href="javascript:void(0)"
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                    showToast('👋 You have been logged out.', 'info');
                    if (currentView === 'account') onNavigate('store');
                  }}
                  className="dropdown-link text-danger"
                >
                  <span>🚪</span> Sign Out
                </a>
              </div>
            )}
          </div>

          <a
            href="javascript:void(0)"
            className="orders"
            onClick={() => {
              if (currentUser) {
                onNavigate('account', 'orders');
              } else {
                openAuthModal('login');
              }
            }}
          >
            <small>Returns</small>
            <strong>& Orders</strong>
          </a>

          <a
            href="javascript:void(0)"
            className="cart"
            id="cart-button"
            onClick={(e) => {
              e.preventDefault();
              openCart();
            }}
          >
            <span className="cart-count">{summary.totalCount}</span>
            <span className="cart-icon">🛒</span>
            <strong>Cart</strong>
          </a>
        </div>
      </header>

      {/* 3. Category Sub-Navigation */}
      {currentView === 'store' && (
        <nav className="category-nav">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href="javascript:void(0)"
              className={`${cat.id === 'all' ? 'menu-link' : ''} ${
                currentCategory === cat.id ? 'active-nav-link' : ''
              }`}
              onClick={() => {
                onSelectCategory(cat.id);
                const catalogEl = document.getElementById('product-catalog-section');
                catalogEl?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {cat.label}
            </a>
          ))}
          <span className="nav-promo">Summer savings are here ☀️</span>
        </nav>
      )}
    </div>
  );
};
