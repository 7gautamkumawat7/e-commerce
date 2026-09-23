import React, { useState, useRef, useEffect } from 'react';
import type { Category } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { useLocation } from '../context/LocationContext.js';
import { useToast } from '../context/ToastContext.js';
import {
  IconCart,
  IconSearch,
  IconMapPin,
  IconCrosshair,
  IconUser,
  IconPackage,
  IconHeart,
  IconHome,
  IconLogOut,
  IconTruck,
  IconChevronDown,
  IconSparkles
} from './Icons.js';

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
    : 'Hello, Sign in';

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
    { id: 'all', label: 'All Catalog' },
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
        <div className="top-announcement">
          <IconTruck size={14} className="top-truck-icon" />
          <span>
            Free express delivery on orders over ₹499 &bull; Use code{' '}
            <strong>SUMMER20</strong> for 20% off
          </span>
        </div>
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
            onClick={() => showToast('Customer support is available 24/7 at support@shopcart.com', 'info')}
          >
            Customer Service
          </a>
          <a
            href="javascript:void(0)"
            onClick={() => showToast('Merchant partner portal opening soon!', 'info')}
          >
            Sell on ShopCart
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
          <span className="brand-logo-symbol">
            <IconSparkles size={18} className="brand-sparkle" />
          </span>
          <span className="brand-mark">shop</span>
          <span className="brand-dot">cart</span>
          <small>Curated Commerce</small>
        </a>

        {/* Deliver to widget - Auto Detect & Modal trigger */}
        <div
          className={`location-pill ${isDetecting ? 'detecting' : ''}`}
          onClick={openLocationModal}
          title="Click to change or auto-detect delivery location"
          role="button"
          tabIndex={0}
        >
          <div className="location-icon-wrap">
            <IconMapPin size={17} className="location-pin" />
          </div>
          <div className="location-text-group">
            <small>Deliver to</small>
            <strong className="location-pill-text">
              {isDetecting ? 'Locating...' : locationText}
            </strong>
          </div>
          <button
            className="quick-gps-btn"
            title="Auto-detect real GPS location"
            onClick={(e) => {
              e.stopPropagation();
              detectLocation();
            }}
            aria-label="Detect GPS location"
          >
            <IconCrosshair size={14} />
          </button>
        </div>

        {/* Modern Search Bar */}
        <form className="search-bar" id="search-form" onSubmit={handleSearchSubmit}>
          <div className="search-select-wrapper">
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
              <option value="all">All Departments</option>
              <option value="tech & electronics">Electronics</option>
              <option value="fashion & style">Fashion</option>
              <option value="home & living">Home & Living</option>
              <option value="beauty & wellness">Beauty</option>
              <option value="pet supplies">Pet Supplies</option>
            </select>
            <IconChevronDown size={12} className="select-chevron" />
          </div>

          <input
            type="search"
            id="search-input"
            placeholder="Search premium electronics, apparel, homeware..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              onSearch(e.target.value.trim().toLowerCase());
            }}
          />

          <button type="submit" aria-label="Submit Search" className="search-submit-btn">
            <IconSearch size={18} />
          </button>
        </form>

        <div className="header-actions">
          {/* User Account Menu with Dropdown */}
          <div className="account-menu-wrapper" ref={dropdownRef}>
            <div
              className="account-trigger"
              id="account-menu-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (currentUser) {
                  setIsDropdownOpen((prev) => !prev);
                } else {
                  openAuthModal('login');
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="account-avatar-mini">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : <IconUser size={16} />}
              </div>
              <div className="account-labels">
                <small>{userGreeting}</small>
                <div className="account-title-row">
                  <strong>Account & Lists</strong>
                  <IconChevronDown size={13} className="account-chevron" />
                </div>
              </div>
            </div>

            {currentUser && isDropdownOpen && (
              <div className="account-dropdown active" id="account-dropdown-menu">
                <div className="dropdown-user-header">
                  <span className="dropdown-avatar">{currentUser.name.charAt(0).toUpperCase()}</span>
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
                  <IconUser size={16} />
                  <span>Your Profile</span>
                </a>
                <a
                  href="javascript:void(0)"
                  onClick={() => {
                    onNavigate('account', 'orders');
                    setIsDropdownOpen(false);
                  }}
                  className="dropdown-link"
                >
                  <IconPackage size={16} />
                  <span>Your Orders</span>
                </a>
                <a
                  href="javascript:void(0)"
                  onClick={() => {
                    onNavigate('account', 'wishlist');
                    setIsDropdownOpen(false);
                  }}
                  className="dropdown-link"
                >
                  <IconHeart size={16} />
                  <span>Saved Wishlist</span>
                </a>
                <a
                  href="javascript:void(0)"
                  onClick={() => {
                    onNavigate('account', 'addresses');
                    setIsDropdownOpen(false);
                  }}
                  className="dropdown-link"
                >
                  <IconHome size={16} />
                  <span>Delivery Addresses</span>
                </a>
                <div className="dropdown-divider"></div>
                <a
                  href="javascript:void(0)"
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                    showToast('You have been safely signed out.', 'info');
                    if (currentView === 'account') onNavigate('store');
                  }}
                  className="dropdown-link text-danger"
                >
                  <IconLogOut size={16} />
                  <span>Sign Out</span>
                </a>
              </div>
            )}
          </div>

          {/* Quick Orders Link */}
          <div
            className="orders-action"
            onClick={() => {
              if (currentUser) {
                onNavigate('account', 'orders');
              } else {
                openAuthModal('login');
              }
            }}
            role="button"
            tabIndex={0}
          >
            <small>Returns</small>
            <strong>& Orders</strong>
          </div>

          {/* Cart Button with Count Badge */}
          <button
            className="cart-action-btn"
            id="cart-button"
            onClick={(e) => {
              e.preventDefault();
              openCart();
            }}
            aria-label={`Shopping Cart with ${summary.totalCount} items`}
          >
            <div className="cart-icon-container">
              <IconCart size={22} className="cart-icon" />
              {summary.totalCount > 0 && (
                <span className="cart-count-badge">{summary.totalCount}</span>
              )}
            </div>
            <div className="cart-text-group">
              <small>Total</small>
              <strong>₹{summary.total.toLocaleString('en-IN')}</strong>
            </div>
          </button>
        </div>
      </header>

      {/* 3. Category Sub-Navigation */}
      {currentView === 'store' && (
        <nav className="category-nav" aria-label="Category Navigation">
          <div className="category-nav-links">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-nav-item ${
                  currentCategory === cat.id ? 'active-nav-link' : ''
                }`}
                onClick={() => {
                  onSelectCategory(cat.id);
                  const catalogEl = document.getElementById('product-catalog-section');
                  catalogEl?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <span className="nav-promo-pill">
            <IconSparkles size={13} className="text-amber" />
            <span>Summer Savings: Up to 45% Off Selected Items</span>
          </span>
        </nav>
      )}
    </div>
  );
};
