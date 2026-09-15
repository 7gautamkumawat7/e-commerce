import React, { useState } from 'react';
import type { AccountTab } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';
import { getUserOrders } from '../services/orders.js';
import { getRazorpayKey, setRazorpayKey, isLiveKey } from '../services/razorpay.js';
import { PRODUCTS } from '../data/products.js';

interface AccountPageProps {
  activeTab: AccountTab;
  onSelectTab: (tab: AccountTab) => void;
  onNavigate: (view: 'store' | 'account') => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ activeTab, onSelectTab, onNavigate }) => {
  const { currentUser, updateProfile, saveAddress, logout, openAuthModal } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();
  const { showToast } = useToast();

  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [rzpKey, setRzpKey] = useState(getRazorpayKey());

  if (!currentUser) {
    return (
      <section className="account-container">
        <div className="account-guest-card">
          <div className="guest-icon">🔒</div>
          <h2>Sign in to view your account</h2>
          <p>
            Access your orders, track shipments, manage your delivery addresses, and review saved
            wishlist items.
          </p>
          <div className="guest-actions">
            <button className="primary-button" onClick={() => openAuthModal('login')}>
              Sign In to Your Account
            </button>
            <button className="secondary-button" onClick={() => openAuthModal('signup')}>
              Create an Account
            </button>
          </div>
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('store');
            }}
            className="back-link"
          >
            ← Return to Store
          </a>
        </div>
      </section>
    );
  }

  const orders = getUserOrders(currentUser.id);
  const wishlistedProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    const success = updateProfile({
      name: profileName,
      email: profileEmail,
      phone: profilePhone
    });
    if (success) {
      showToast('✨ Profile details updated successfully!', 'success');
    } else {
      showToast('Failed to update profile.', 'error');
    }
  };

  const handleBuyAgain = (productId: string) => {
    const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];
    addToCart(product, 1);
    showToast('🛒 Item added back to your cart!');
    openCart();
  };

  const handleSetDefaultAddress = (addressId: string) => {
    const updated = currentUser.addresses.map((a) => ({
      ...a,
      isDefault: a.id === addressId
    }));
    updateProfile({ addresses: updated });
    showToast('🏠 Default shipping address updated!', 'success');
  };

  const handleAddNewAddress = () => {
    const street = prompt('Enter street address:', '450 Lexington Ave, Suite 12');
    if (!street) return;
    const city = prompt('Enter city:', 'New York') || 'New York';
    const state = prompt('Enter state (e.g. NY):', 'NY') || 'NY';
    const zip = prompt('Enter Zip Code:', '10017') || '10017';

    saveAddress({
      title: 'Secondary Address',
      street,
      city,
      state,
      zipCode: zip,
      country: 'United States',
      isDefault: false
    });

    showToast('📍 New address added to your address book!', 'success');
  };

  return (
    <section className="account-container">
      {/* Hero Profile Banner */}
      <div className="account-hero-banner">
        <div className="account-user-card">
          <div className="user-avatar-large">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} />
            ) : (
              <span>{currentUser.name.charAt(0)}</span>
            )}
          </div>
          <div className="user-info-main">
            <div className="user-name-row">
              <h1>{currentUser.name}</h1>
              <span className="member-badge">{currentUser.memberTier || 'Member'}</span>
            </div>
            <p className="user-email">
              {currentUser.email} • Joined {currentUser.joinedDate}
            </p>
          </div>
        </div>
        <div className="account-header-actions">
          <button className="secondary-button" onClick={() => onNavigate('store')}>
            ← Back to Shopping
          </button>
          <button
            className="logout-btn-header"
            onClick={() => {
              logout();
              showToast('👋 You have been logged out.', 'info');
              onNavigate('store');
            }}
          >
            Sign Out 🚪
          </button>
        </div>
      </div>

      {/* Account Layout */}
      <div className="account-layout">
        <aside className="account-sidebar">
          <nav className="account-nav-pills">
            <button
              className={`acc-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => onSelectTab('profile')}
            >
              <span>👤</span> Personal Info
            </button>
            <button
              className={`acc-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => onSelectTab('orders')}
            >
              <span>📦</span> Your Orders <small className="pill-badge">{orders.length}</small>
            </button>
            <button
              className={`acc-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => onSelectTab('wishlist')}
            >
              <span>❤️</span> Saved Wishlist{' '}
              <small className="pill-badge">{wishlistedProducts.length}</small>
            </button>
            <button
              className={`acc-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => onSelectTab('addresses')}
            >
              <span>🏠</span> Addresses{' '}
              <small className="pill-badge">{currentUser.addresses.length}</small>
            </button>
            <button
              className={`acc-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => onSelectTab('security')}
            >
              <span>🛡️</span> Security & Login
            </button>
          </nav>
        </aside>

        <main className="account-content-panel">
          {/* Tab 1: Personal Info */}
          {activeTab === 'profile' && (
            <div className="account-panel-card">
              <div className="panel-header">
                <h2>Personal Information</h2>
                <p>Manage your name, contact details, and account preferences.</p>
              </div>
              <form className="account-edit-form" onSubmit={handleProfileSave}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="prof-name">Full Name</label>
                    <input
                      type="text"
                      id="prof-name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="prof-email">Email Address</label>
                    <input
                      type="email"
                      id="prof-email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="prof-phone">Phone Number</label>
                    <input
                      type="tel"
                      id="prof-phone"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="prof-tier">Membership Tier</label>
                    <input
                      type="text"
                      id="prof-tier"
                      value={currentUser.memberTier || 'Member'}
                      disabled
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="primary-button">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Orders & Tracking */}
          {activeTab === 'orders' && (
            <div className="account-panel-card">
              <div className="panel-header">
                <h2>Order History & Shipments</h2>
                <p>Track current orders, download invoices, and reorder past favorites.</p>
              </div>

              {orders.length === 0 ? (
                <div className="empty-tab-state">
                  <span>📦</span>
                  <h3>No orders placed yet</h3>
                  <p>When you place an order, it will appear here with live tracking updates.</p>
                  <button className="primary-button" onClick={() => onNavigate('store')}>
                    Start Shopping Now
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-card-header">
                        <div className="order-meta-col">
                          <span className="meta-label">ORDER PLACED</span>
                          <strong className="meta-val">{order.date}</strong>
                        </div>
                        <div className="order-meta-col">
                          <span className="meta-label">TOTAL</span>
                          <strong className="meta-val">₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        </div>
                        <div className="order-meta-col">
                          <span className="meta-label">SHIP TO</span>
                          <strong className="meta-val" title={order.shippingAddress}>
                            {order.shippingAddress.split(',')[0]}...
                          </strong>
                        </div>
                        <div className="order-meta-col text-right">
                          <span className="meta-label">ORDER # {order.id}</span>
                          <span
                            className={`order-status-badge status-${order.status
                              .toLowerCase()
                              .replace(/\s+/g, '-')}`}
                          >
                            ● {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="order-card-body">
                        <div className="order-items-grid">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="order-item-tile">
                              <img
                                src={item.image}
                                alt={item.name}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src =
                                    'ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3361_ELECTR_train.jpeg';
                                }}
                              />
                              <div className="order-item-desc">
                                <h4>{item.name}</h4>
                                <p>
                                  Qty: {item.quantity} • <strong>₹{item.price.toLocaleString('en-IN')}</strong>
                                </p>
                                <button
                                  className="buy-again-btn"
                                  onClick={() => handleBuyAgain(item.productId)}
                                >
                                  Buy it again ↺
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="order-tracking-strip">
                          <span>
                            🚚 Tracking ID: <strong>{order.trackingNumber}</strong>
                          </span>
                          <button
                            className="track-btn"
                            onClick={() =>
                              showToast(
                                '📍 Package is currently on schedule for delivery!',
                                'info'
                              )
                            }
                          >
                            Track Package →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="account-panel-card">
              <div className="panel-header">
                <h2>Your Saved Wishlist ({wishlistedProducts.length})</h2>
                <p>Products you have saved to purchase later.</p>
              </div>

              {wishlistedProducts.length === 0 ? (
                <div className="empty-tab-state">
                  <span>🤍</span>
                  <h3>Your wishlist is empty</h3>
                  <p>Explore our store and click the heart icon on items you'd love to save.</p>
                  <button className="primary-button" onClick={() => onNavigate('store')}>
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="wishlist-grid">
                  {wishlistedProducts.map((product) => (
                    <div key={product.id} className="wishlist-card">
                      <img
                        src={product.image}
                        alt={product.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            'ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3361_ELECTR_train.jpeg';
                        }}
                      />
                      <div className="wishlist-card-details">
                        <span className="cat-tag">{product.categoryName}</span>
                        <h3>{product.name}</h3>
                        <div className="price-box">
                          <span className="price">₹{product.price.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="wishlist-card-actions">
                          <button
                            className="primary-button"
                            onClick={() => {
                              addToCart(product, 1);
                              showToast(`🛒 Added "${product.name.substring(0, 20)}..." to cart!`);
                              openCart();
                            }}
                          >
                            Add to Cart 🛒
                          </button>
                          <button
                            className="remove-wish-btn"
                            onClick={() => {
                              toggleWishlist(product.id);
                              showToast('🤍 Removed from Wishlist', 'info');
                            }}
                          >
                            Remove ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Addresses */}
          {activeTab === 'addresses' && (
            <div className="account-panel-card">
              <div className="panel-header">
                <h2>Saved Delivery Addresses</h2>
                <p>Manage default addresses for speedy 1-click checkout.</p>
              </div>

              <div className="addresses-grid">
                {currentUser.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`address-card ${addr.isDefault ? 'is-default' : ''}`}
                  >
                    <div className="addr-header">
                      <strong>{addr.title}</strong>
                      {addr.isDefault && <span className="default-pill">Default</span>}
                    </div>
                    <p className="addr-text">
                      {currentUser.name}
                      <br />
                      {addr.street}
                      <br />
                      {addr.city}, {addr.state} {addr.zipCode}
                      <br />
                      {addr.country}
                    </p>
                    <div className="addr-actions">
                      <button
                        className="addr-edit-btn"
                        onClick={() =>
                          showToast('Address is currently active for all deliveries.', 'info')
                        }
                      >
                        Edit
                      </button>
                      {!addr.isDefault && (
                        <button
                          className="addr-default-btn"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                        >
                          Set as Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="add-address-card" onClick={handleAddNewAddress}>
                  <span>+</span>
                  <strong>Add New Address</strong>
                  <small>Ship to a new home or office location</small>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Security & Payment Gateway */}
          {activeTab === 'security' && (
            <div className="account-panel-card">
              <div className="panel-header">
                <h2>Security & Payment Gateway</h2>
                <p>Manage authentication security and Live Razorpay Payment Gateway integration.</p>
              </div>

              {/* Razorpay Live Gateway Configuration */}
              <div className="security-gateway-card">
                <div className="gateway-card-header">
                  <div className="gateway-title-group">
                    <span className="gateway-icon">💳</span>
                    <div>
                      <h3>Razorpay Live Payment Gateway</h3>
                      <p>Connect your active merchant account for live customer checkouts</p>
                    </div>
                  </div>
                  <span className={`status-pill ${isLiveKey(rzpKey) ? 'status-pill-green' : 'status-pill-orange'}`}>
                    {isLiveKey(rzpKey) ? '🟢 LIVE MODE ACTIVE' : '⚙️ DEFAULT / TEST'}
                  </span>
                </div>

                <div className="gateway-card-body">
                  <div className="form-group">
                    <label htmlFor="account-rzp-key">
                      <strong>Razorpay Live Key ID</strong>
                    </label>
                    <div className="key-input-row">
                      <input
                        type="text"
                        id="account-rzp-key"
                        placeholder="rzp_live_xxxxxxxxxxxxxxxx"
                        value={rzpKey}
                        onChange={(e) => setRzpKey(e.target.value)}
                      />
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => {
                          if (!rzpKey.trim()) {
                            showToast('Please enter a valid key ID.', 'error');
                            return;
                          }
                          setRazorpayKey(rzpKey.trim());
                          showToast('✅ Razorpay Live Key updated successfully!', 'success');
                        }}
                      >
                        Save Key
                      </button>
                    </div>
                    <small className="gateway-hint">
                      Keys starting with <code>rzp_live_</code> process real financial transactions via Razorpay.
                      Find your key in the{' '}
                      <a
                        href="https://dashboard.razorpay.com/#/app/keys"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#ff8a4c', textDecoration: 'underline', fontWeight: 600 }}
                      >
                        Razorpay Merchant Dashboard →
                      </a>
                    </small>
                  </div>
                </div>
              </div>

              <div className="security-items-list" style={{ marginTop: '24px' }}>
                <div className="security-row">
                  <div>
                    <strong>Password</strong>
                    <p>Last changed 3 months ago</p>
                  </div>
                  <button
                    className="secondary-button"
                    onClick={() =>
                      showToast('🔐 Password change link sent to your email!', 'info')
                    }
                  >
                    Change Password
                  </button>
                </div>
                <div className="security-row">
                  <div>
                    <strong>Two-Factor Authentication (2FA)</strong>
                    <p>Add an extra layer of security to your ShopCart account</p>
                  </div>
                  <span className="status-pill-green">Active (SMS)</span>
                </div>
                <div className="security-row">
                  <div>
                    <strong>Active Sessions</strong>
                    <p>Logged in on Windows (Chrome) • Current Session</p>
                  </div>
                  <button
                    className="danger-outline-btn"
                    onClick={() => {
                      logout();
                      showToast('🚪 Signed out of all devices.', 'info');
                      onNavigate('store');
                    }}
                  >
                    Sign Out of All Devices
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </section>
  );
};
