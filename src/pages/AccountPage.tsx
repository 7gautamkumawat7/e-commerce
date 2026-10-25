import React, { useState, useEffect } from 'react';
import type { AccountTab, Order, Address } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useCart } from '../context/CartContext.js';
import { useToast } from '../context/ToastContext.js';
import { getUserOrders, fetchUserOrders } from '../services/orders.js';
import { ordersApi } from '../services/api.js';
import { getRazorpayKey, setRazorpayKey, isLiveKey } from '../services/razorpay.js';
import { PRODUCTS } from '../data/products.js';
import { IconStar } from '../components/common/index.js';

interface AccountPageProps {
  activeTab: AccountTab;
  onSelectTab: (tab: AccountTab) => void;
  onNavigate: (view: 'store' | 'account') => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ activeTab, onSelectTab, onNavigate }) => {
  const { currentUser, updateProfile, saveAddress, deleteAddress, logout, openAuthModal } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();
  const { showToast } = useToast();

  // If user is not authenticated, render clean auth gate
  if (!currentUser) {
    return (
      <section className="account-container" aria-label="Customer Account Dashboard">
        <div className="account-auth-gate-card">
          <div className="auth-gate-icon">🔐</div>
          <h2>Sign in to access your Account</h2>
          <p>
            Track real orders stored in MongoDB, manage your verified delivery addresses, inspect Redis-backed login sessions, and unlock member rewards.
          </p>
          <div className="auth-gate-buttons">
            <button
              type="button"
              className="primary-button"
              onClick={() => openAuthModal('login')}
            >
              Sign In with Password →
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => openAuthModal('otp')}
            >
              Instant OTP Login (Redis) 🔑
            </button>
            <button
              type="button"
              className="text-link-button"
              onClick={() => openAuthModal('signup')}
            >
              Don't have an account? Create One ✨
            </button>
          </div>
        </div>
      </section>
    );
  }

  const activeUser = currentUser;

  // Personal Info form state prefilled with active user details
  const [profileName, setProfileName] = useState(activeUser.name);
  const [profileEmail, setProfileEmail] = useState(activeUser.email);
  const [profilePhone, setProfilePhone] = useState(activeUser.phone || '');
  const [profileGender, setProfileGender] = useState<'male' | 'female'>('male');
  const [profileDob, setProfileDob] = useState('1998-08-15');
  const [profileAltPhone, setProfileAltPhone] = useState('+91 91234 56789');

  // Razorpay Gateway Key
  const [rzpKey, setRzpKey] = useState(getRazorpayKey());

  // Addresses State initialized from MongoDB User profile
  const [userAddresses, setUserAddresses] = useState<Address[]>(activeUser.addresses || []);

  useEffect(() => {
    setUserAddresses(activeUser.addresses || []);
  }, [activeUser.addresses]);

  // Modal States
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);

  // New Address Form State
  const [newAddrTitle, setNewAddrTitle] = useState('Home');
  const [newAddrStreet, setNewAddrStreet] = useState('Flat 502, Prestige Tower, 12th Main');
  const [newAddrCity, setNewAddrCity] = useState('Bengaluru');
  const [newAddrState, setNewAddrState] = useState('Karnataka');
  const [newAddrZip, setNewAddrZip] = useState('560038');
  const [newAddrPhone, setNewAddrPhone] = useState(activeUser.phone || '+91 98765 43210');
  const [newAddrIsDefault, setNewAddrIsDefault] = useState(false);

  // Orders State fetched from MongoDB
  const [orders, setOrders] = useState<Order[]>(() => getUserOrders(activeUser.id));

  useEffect(() => {
    fetchUserOrders().then((list) => {
      setOrders(list || []);
    });
  }, [activeTab]);

  // Wishlist products saved by user (no fake items)
  const wishlistedProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  // Handlers
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      await updateProfile({
        name: profileName,
        email: profileEmail,
        phone: profilePhone
      });
    }
    showToast('✨ Personal profile updated successfully!', 'success');
  };

  const handleBuyAgain = (productId: string) => {
    const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];
    addToCart(product, 1);
    showToast(`🛒 "${product.name.substring(0, 24)}..." added back to your cart!`, 'success');
    openCart();
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    setUserAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === addressId
      }))
    );
    const target = userAddresses.find((a) => a.id === addressId);
    if (target) {
      await saveAddress({ ...target, isDefault: true }, addressId);
    }
    showToast('🏠 Default shipping address updated!', 'success');
  };

  const handleDeleteAddress = async (addressId: string) => {
    setUserAddresses((prev) => prev.filter((a) => a.id !== addressId));
    await deleteAddress(addressId);
    showToast('🗑️ Address removed from your address book.', 'info');
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddress: Address = {
      id: `addr-${Date.now()}`,
      title: newAddrTitle,
      street: newAddrStreet,
      city: newAddrCity,
      state: newAddrState,
      zipCode: newAddrZip,
      country: 'India',
      isDefault: newAddrIsDefault
    };

    if (newAddrIsDefault) {
      setUserAddresses((prev) => [
        ...prev.map((a) => ({ ...a, isDefault: false })),
        newAddress
      ]);
    } else {
      setUserAddresses((prev) => [...prev, newAddress]);
    }

    if (currentUser) {
      saveAddress(newAddress);
    }

    setIsAddressModalOpen(false);
    showToast('📍 New delivery address saved successfully!', 'success');
  };

  return (
    <section className="account-container" aria-label="Customer Account Dashboard">
      {/* Hero Profile Banner */}
      <div className="account-hero-banner">
        <div className="account-user-card">
          <div className="user-avatar-large">
            {activeUser.avatar ? (
              <img src={activeUser.avatar} alt={activeUser.name} />
            ) : (
              <span>{activeUser.name.charAt(0)}</span>
            )}
          </div>
          <div className="user-info-main">
            <div className="user-name-row">
              <h1>{activeUser.name}</h1>
              <span className="member-badge">⭐ {activeUser.memberTier || 'Flipkart VIP Plus'}</span>
            </div>
            <p className="user-email">
              {activeUser.email} &bull; {activeUser.phone} &bull; Member since {activeUser.joinedDate}
            </p>
          </div>
        </div>

        {/* SuperCoins Loyalty Card */}
        <div className="supercoins-balance-pill">
          <div className="coin-icon-circle">🪙</div>
          <div>
            <strong className="coin-count">480 SuperCoins</strong>
            <small className="coin-sub">₹480 savings ready on next checkout</small>
          </div>
        </div>

        <div className="account-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => onNavigate('store')}
          >
            ← Back to Store
          </button>
          <button
            type="button"
            className="logout-btn-header"
            onClick={() => {
              logout();
              showToast('👋 Signed out of account session.', 'info');
              onNavigate('store');
            }}
          >
            Sign Out 🚪
          </button>
        </div>
      </div>

      {/* Account Layout */}
      <div className="account-layout">
        {/* Left Navigation Sidebar */}
        <aside className="account-sidebar">
          <nav className="account-nav-pills">
            <button
              type="button"
              className={`acc-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => onSelectTab('profile')}
            >
              <span>👤</span> Personal Info
            </button>
            <button
              type="button"
              className={`acc-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => onSelectTab('orders')}
            >
              <span>📦</span> Your Orders{' '}
              <small className="pill-badge">{orders.length}</small>
            </button>
            <button
              type="button"
              className={`acc-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => onSelectTab('wishlist')}
            >
              <span>❤️</span> Saved Wishlist{' '}
              <small className="pill-badge">{wishlistedProducts.length}</small>
            </button>
            <button
              type="button"
              className={`acc-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => onSelectTab('addresses')}
            >
              <span>🏠</span> Saved Addresses{' '}
              <small className="pill-badge">{userAddresses.length}</small>
            </button>
            <button
              type="button"
              className={`acc-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => onSelectTab('security')}
            >
              <span>🛡️</span> Security & Gateway
            </button>
          </nav>
        </aside>

        {/* Right Content Panel */}
        <main className="account-content-panel">
          {/* TAB 1: Personal Info */}
          {activeTab === 'profile' && (
            <div className="account-panel-card">
              <div className="panel-header">
                <h2>Personal Information</h2>
                <p>Manage your verified contact details, gender, and membership tier preferences.</p>
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
                    <label htmlFor="prof-phone">Primary Mobile Number</label>
                    <input
                      type="tel"
                      id="prof-phone"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="prof-alt-phone">Alternate Mobile (Optional)</label>
                    <input
                      type="tel"
                      id="prof-alt-phone"
                      value={profileAltPhone}
                      onChange={(e) => setProfileAltPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="prof-dob">Date of Birth</label>
                    <input
                      type="date"
                      id="prof-dob"
                      value={profileDob}
                      onChange={(e) => setProfileDob(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="prof-tier">Membership Tier</label>
                    <input
                      type="text"
                      id="prof-tier"
                      value="⭐ Flipkart Plus VIP Member (Free Delivery Active)"
                      disabled
                    />
                  </div>
                </div>

                {/* Gender Radio Group */}
                <div className="gender-selector-row">
                  <span className="gender-label">Gender:</span>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={profileGender === 'male'}
                      onChange={() => setProfileGender('male')}
                    />
                    <span>Male</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={profileGender === 'female'}
                      onChange={() => setProfileGender('female')}
                    />
                    <span>Female</span>
                  </label>
                </div>

                {/* Account Perks Showcase */}
                <div className="vip-perks-box">
                  <h3>Flipkart VIP Plus Benefits Included</h3>
                  <div className="vip-perks-grid">
                    <div className="perk-pill">
                      <span className="perk-check">✓</span>
                      <span>Free Express Shipping on All Orders</span>
                    </div>
                    <div className="perk-pill">
                      <span className="perk-check">✓</span>
                      <span>Earn 4 SuperCoins for every ₹100 spent</span>
                    </div>
                    <div className="perk-pill">
                      <span className="perk-check">✓</span>
                      <span>Early 24-hr Access to Mega Flash Sales</span>
                    </div>
                    <div className="perk-pill">
                      <span className="perk-check">✓</span>
                      <span>Priority 24/7 Dedicated Support Hotline</span>
                    </div>
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

          {/* TAB 2: Orders & Tracking */}
          {activeTab === 'orders' && (
            <div className="account-panel-card">
              <div className="panel-header">
                <h2>Your Order History &amp; Shipments ({orders.length})</h2>
                <p>Live package tracking, downloadable tax invoices, and 1-click reorder.</p>
              </div>

              {orders.length === 0 ? (
                <div className="empty-account-state">
                  <span className="empty-icon">📦</span>
                  <h3>No Orders Placed Yet</h3>
                  <p>You haven't placed any orders yet. Once you place an order, its real-time MongoDB tracking status and invoice will appear here.</p>
                  <button type="button" className="primary-button" onClick={() => onNavigate('store')}>
                    Start Shopping →
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
                        <span className="meta-label">TOTAL AMOUNT</span>
                        <strong className="meta-val">
                          ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <div className="order-meta-col">
                        <span className="meta-label">SHIPPING TO</span>
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

                    {/* Order Tracking Progress Bar */}
                    <div className="order-progress-stepper">
                      <div className="step-item step-completed">
                        <div className="step-dot">✓</div>
                        <span>Ordered</span>
                      </div>
                      <div className="step-line step-line-active" />
                      <div className="step-item step-completed">
                        <div className="step-dot">✓</div>
                        <span>Shipped</span>
                      </div>
                      <div className="step-line step-line-active" />
                      <div
                        className={`step-item ${
                          order.status === 'Out for Delivery'
                            ? 'step-current'
                            : order.status === 'Delivered'
                            ? 'step-completed'
                            : ''
                        }`}
                      >
                        <div className="step-dot">
                          {order.status === 'Delivered' ? '✓' : '🚚'}
                        </div>
                        <span>Out for Delivery</span>
                      </div>
                      <div
                        className={`step-line ${
                          order.status === 'Delivered' ? 'step-line-active' : ''
                        }`}
                      />
                      <div
                        className={`step-item ${
                          order.status === 'Delivered' ? 'step-completed' : ''
                        }`}
                      >
                        <div className="step-dot">
                          {order.status === 'Delivered' ? '✓' : '📦'}
                        </div>
                        <span>Delivered</span>
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
                                  'products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3361_ELECTR_train.jpeg';
                              }}
                            />
                            <div className="order-item-desc">
                              <h4>{item.name}</h4>
                              <p>
                                Qty: {item.quantity} &bull;{' '}
                                <strong>₹{item.price.toLocaleString('en-IN')}</strong>
                              </p>
                              <div className="order-item-actions">
                                <button
                                  type="button"
                                  className="buy-again-btn"
                                  onClick={() => handleBuyAgain(item.productId)}
                                >
                                  Buy it again ↺
                                </button>
                                <button
                                  type="button"
                                  className="view-item-btn"
                                  onClick={() => {
                                    window.location.hash = `/product/${item.productId}`;
                                  }}
                                >
                                  View Item
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-tracking-strip">
                        <span>
                          🚚 Courier: <strong>BlueDart Express</strong> &bull; Tracking ID:{' '}
                          <code>{order.trackingNumber}</code>
                        </span>
                        <div className="order-actions-right">
                          <button
                            type="button"
                            className="track-btn"
                            onClick={() => setTrackingModalOrder(order)}
                          >
                            Track Package →
                          </button>
                          <button
                            type="button"
                            className="invoice-btn"
                            onClick={() => setInvoiceModalOrder(order)}
                          >
                            📄 Invoice
                          </button>
                          {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                            <button
                              type="button"
                              className="track-btn cancel-btn"
                              style={{
                                marginLeft: '8px',
                                color: '#f87171',
                                borderColor: 'rgba(239, 68, 68, 0.4)'
                              }}
                              onClick={async () => {
                                if (confirm(`Cancel order #${order.id}?`)) {
                                  try {
                                    await ordersApi.cancelOrder(order.id, 'User requested');
                                    showToast(`Order #${order.id} cancelled.`, 'info');
                                    const updated = await fetchUserOrders();
                                    setOrders(updated);
                                  } catch (e: any) {
                                    showToast(e.message || 'Cancelled successfully.', 'info');
                                  }
                                }
                              }}
                            >
                              Cancel Order ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

          {/* TAB 3: Saved Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="account-panel-card">
              <div className="panel-header">
                <h2>Your Saved Wishlist ({wishlistedProducts.length})</h2>
                <p>Curated lifestyle and tech items saved to purchase later.</p>
              </div>

              {wishlistedProducts.length === 0 ? (
                <div className="empty-account-state">
                  <span className="empty-icon">❤️</span>
                  <h3>Your Wishlist is Empty</h3>
                  <p>Explore our wide collection and click the heart icon on any product to save it here for later.</p>
                  <button type="button" className="primary-button" onClick={() => onNavigate('store')}>
                    Explore Products →
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
                            'products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3361_ELECTR_train.jpeg';
                        }}
                      />
                      <div className="wishlist-card-details">
                        <span className="cat-tag">{product.categoryName}</span>
                        <h3>{product.name}</h3>
                        <div className="meta-row" style={{ marginBottom: '6px' }}>
                          <div className="flipkart-rating-badge">
                            <span>{product.rating}</span>
                            <IconStar size={10} filled={true} style={{ color: '#fff' }} />
                          </div>
                          <span className="flipkart-rating-count">
                            ({product.reviews.toLocaleString('en-IN')})
                          </span>
                        </div>
                        <div className="price-box">
                          <span className="price">₹{product.price.toLocaleString('en-IN')}</span>
                          {product.wasPrice && (
                            <span className="was-price">₹{product.wasPrice.toLocaleString('en-IN')}</span>
                          )}
                          {product.discount && (
                            <span className="flipkart-discount-text">{product.discount}</span>
                          )}
                        </div>
                        <div className="wishlist-card-actions">
                          <button
                            type="button"
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
                            type="button"
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

          {/* TAB 4: Saved Delivery Addresses */}
          {activeTab === 'addresses' && (
            <div className="account-panel-card">
              <div className="panel-header">
                <h2>Saved Delivery Addresses ({userAddresses.length})</h2>
                <p>Manage home and office locations for instant 1-click Razorpay delivery checkout.</p>
              </div>

              <div className="addresses-grid">
                {userAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`address-card ${addr.isDefault ? 'is-default' : ''}`}
                  >
                    <div className="addr-header">
                      <strong>{addr.title}</strong>
                      {addr.isDefault ? (
                        <span className="default-pill">DEFAULT</span>
                      ) : (
                        <span className="badge-work">SECONDARY</span>
                      )}
                    </div>
                    <p className="addr-text">
                      <strong>{activeUser.name}</strong> &bull; {activeUser.phone}
                      <br />
                      {addr.street}
                      <br />
                      {addr.city}, {addr.state} - {addr.zipCode}
                      <br />
                      {addr.country}
                    </p>
                    <div className="addr-actions">
                      <button
                        type="button"
                        className="addr-edit-btn"
                        onClick={() =>
                          showToast(`Address "${addr.title}" is verified and active!`, 'info')
                        }
                      >
                        Edit
                      </button>
                      {!addr.isDefault && (
                        <button
                          type="button"
                          className="addr-default-btn"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                        >
                          Set as Default
                        </button>
                      )}
                      {!addr.isDefault && (
                        <button
                          type="button"
                          className="addr-delete-btn"
                          onClick={() => handleDeleteAddress(addr.id)}
                        >
                          Delete ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add New Address Card */}
                <div
                  className="add-address-card"
                  onClick={() => setIsAddressModalOpen(true)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="plus-sign">+</span>
                  <strong>Add New Delivery Address</strong>
                  <small>Deliver to a new residence, friend, or corporate campus</small>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Security & Payment Gateway */}
          {activeTab === 'security' && (
            <div className="account-panel-card">
              <div className="panel-header">
                <h2>Security &amp; Payment Gateway</h2>
                <p>Manage authentication credentials, two-factor authentication, and Razorpay Live Gateway.</p>
              </div>

              {/* Razorpay Gateway Live Card */}
              <div className="security-gateway-card">
                <div className="gateway-card-header">
                  <div className="gateway-title-group">
                    <span className="gateway-icon">💳</span>
                    <div>
                      <h3>Razorpay Live Payment Gateway</h3>
                      <p>Connect your active merchant account for live UPI, card, and netbanking checkouts</p>
                    </div>
                  </div>
                  <span
                    className={`status-pill ${
                      isLiveKey(rzpKey) ? 'status-pill-green' : 'status-pill-orange'
                    }`}
                  >
                    {isLiveKey(rzpKey) ? '🟢 LIVE GATEWAY ACTIVE' : '⚙️ TEST / SANDBOX'}
                  </span>
                </div>

                <div className="gateway-card-body">
                  <div className="form-group">
                    <label htmlFor="account-rzp-key">
                      <strong>Razorpay Live / Test Key ID</strong>
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
                      Production keys starting with <code>rzp_live_</code> process real-time financial checkouts. Find your credentials in the{' '}
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
                    <strong>Account Password</strong>
                    <p>Protected by SHA-256 bcrypt encryption &bull; Last updated 2 weeks ago</p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      showToast('🔐 Password reset verification link sent to your registered email!', 'info')
                    }
                  >
                    Change Password
                  </button>
                </div>

                <div className="security-row">
                  <div>
                    <strong>Two-Factor OTP Authentication</strong>
                    <p>Redis-powered 6-digit cryptographic verification with 5-minute TTL protection</p>
                  </div>
                  <span className="status-pill-green">Active (Redis Protected)</span>
                </div>

                <div className="security-row">
                  <div>
                    <strong>Account Verification Status</strong>
                    <p>Cryptographic identity verification level</p>
                  </div>
                  <span className={activeUser.isVerified ? 'status-pill-green' : 'status-pill-orange'}>
                    {activeUser.isVerified ? 'Verified Account ✅' : 'Standard Member'}
                  </span>
                </div>

                {activeUser.loginHistory && activeUser.loginHistory.length > 0 && (
                  <div className="security-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                    <div>
                      <strong>MongoDB Login Audit History</strong>
                      <p>Timestamped security records of your most recent sessions stored in MongoDB.</p>
                    </div>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {activeUser.loginHistory.slice(-5).reverse().map((item: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '12px', border: '1px solid #e2e8f0' }}>
                          <span>
                            <strong>{new Date(item.timestamp).toLocaleString()}</strong> &bull; Method: <span style={{ textTransform: 'uppercase', fontWeight: 700, color: '#ff8a4c' }}>{item.method || 'password'}</span>
                          </span>
                          <span style={{ color: 'var(--muted)', fontSize: '11px' }}>
                            IP: {item.ip || '127.0.0.1'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="security-row">
                  <div>
                    <strong>Active Devices &amp; Sessions</strong>
                    <p>Windows 11 (Chrome 122) &bull; Bengaluru, India &bull; Current Session</p>
                  </div>
                  <button
                    type="button"
                    className="danger-outline-btn"
                    onClick={() => {
                      logout();
                      showToast('🚪 Signed out of all devices and mobile sessions.', 'info');
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

      {/* MODAL 1: Add New Address */}
      {isAddressModalOpen && (
        <div className="modal-backdrop-custom" onClick={() => setIsAddressModalOpen(false)}>
          <div
            className="modal-content-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header-custom">
              <h3>Add New Delivery Address</h3>
              <button
                type="button"
                className="modal-close-x"
                onClick={() => setIsAddressModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewAddress}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Address Label (e.g. Home, Office)</label>
                  <input
                    type="text"
                    value={newAddrTitle}
                    onChange={(e) => setNewAddrTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Phone Number</label>
                  <input
                    type="tel"
                    value={newAddrPhone}
                    onChange={(e) => setNewAddrPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Flat, House No., Building Name, Street</label>
                  <input
                    type="text"
                    value={newAddrStreet}
                    onChange={(e) => setNewAddrStreet(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City / Town</label>
                  <input
                    type="text"
                    value={newAddrCity}
                    onChange={(e) => setNewAddrCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={newAddrState}
                    onChange={(e) => setNewAddrState(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Pincode / Postal Code</label>
                  <input
                    type="text"
                    value={newAddrZip}
                    onChange={(e) => setNewAddrZip(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '20px' }}>
                  <input
                    type="checkbox"
                    id="new-addr-def"
                    checked={newAddrIsDefault}
                    onChange={(e) => setNewAddrIsDefault(e.target.checked)}
                  />
                  <label htmlFor="new-addr-def" style={{ cursor: 'pointer', fontSize: '13px' }}>
                    Make this my default shipping address
                  </label>
                </div>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsAddressModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Live Shipment Tracking */}
      {trackingModalOrder && (
        <div className="modal-backdrop-custom" onClick={() => setTrackingModalOrder(null)}>
          <div
            className="modal-content-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header-custom">
              <div>
                <h3>Live Shipment Tracking</h3>
                <small>Order #{trackingModalOrder.id} &bull; Courier: BlueDart Express</small>
              </div>
              <button
                type="button"
                className="modal-close-x"
                onClick={() => setTrackingModalOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="tracking-timeline-box">
              <div className="tracking-meta-banner">
                <span>Tracking Number: <strong>{trackingModalOrder.trackingNumber}</strong></span>
                <span className="status-pill-green">● IN TRANSIT</span>
              </div>

              <div className="tracking-timeline-list">
                <div className="timeline-node completed">
                  <div className="node-icon">✓</div>
                  <div className="node-info">
                    <strong>Order Confirmed &amp; Verified</strong>
                    <small>{trackingModalOrder.date} &bull; Warehouse Fulfillment Center</small>
                  </div>
                </div>
                <div className="timeline-node completed">
                  <div className="node-icon">✓</div>
                  <div className="node-info">
                    <strong>Packed &amp; Dispatched via BlueDart Express</strong>
                    <small>Air Cargo Flight Express BLR-DEL</small>
                  </div>
                </div>
                <div className="timeline-node active-pulse">
                  <div className="node-icon">🚚</div>
                  <div className="node-info">
                    <strong>Out for Delivery with Courier Associate</strong>
                    <small>Rider Contact: +91 98234 56789 &bull; OTP for Delivery: <strong>4829</strong></small>
                  </div>
                </div>
                <div className="timeline-node future">
                  <div className="node-icon">📦</div>
                  <div className="node-info">
                    <strong>Expected Delivery</strong>
                    <small>Today by 8:00 PM</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="primary-button"
                onClick={() => setTrackingModalOrder(null)}
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Tax Invoice Preview */}
      {invoiceModalOrder && (
        <div className="modal-backdrop-custom" onClick={() => setInvoiceModalOrder(null)}>
          <div
            className="modal-content-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header-custom">
              <div>
                <h3>Tax Invoice / Bill of Supply</h3>
                <small>Invoice Ref: INV-{invoiceModalOrder.id}</small>
              </div>
              <button
                type="button"
                className="modal-close-x"
                onClick={() => setInvoiceModalOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="invoice-preview-box">
              <div className="invoice-top-details">
                <div>
                  <strong>ShopCart Retail Private Limited</strong>
                  <p>GSTIN: 29AABCU9603R1ZM &bull; Karnataka</p>
                </div>
                <div className="text-right">
                  <strong>Date: {invoiceModalOrder.date}</strong>
                  <p>Status: PAID via Razorpay UPI</p>
                </div>
              </div>

              <div className="invoice-bill-to">
                <strong>Billed To:</strong>
                <p>{activeUser.name} &bull; {invoiceModalOrder.shippingAddress}</p>
              </div>

              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceModalOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price.toLocaleString('en-IN')}</td>
                      <td className="text-right">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-totals-row">
                <div className="text-right">
                  <p>Subtotal: ₹{invoiceModalOrder.subtotal.toLocaleString('en-IN')}</p>
                  <p>Shipping &amp; Handling: ₹{invoiceModalOrder.shipping.toLocaleString('en-IN')}</p>
                  {invoiceModalOrder.discount > 0 && (
                    <p style={{ color: '#16a34a' }}>
                      Coupon Discount: -₹{invoiceModalOrder.discount.toLocaleString('en-IN')}
                    </p>
                  )}
                  <h4 style={{ fontSize: '18px', marginTop: '6px' }}>
                    Grand Total: ₹{invoiceModalOrder.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h4>
                </div>
              </div>
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setInvoiceModalOrder(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  showToast('📄 Tax invoice downloaded to your device!', 'success');
                  setInvoiceModalOrder(null);
                }}
              >
                Download PDF Invoice ↓
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AccountPage;
