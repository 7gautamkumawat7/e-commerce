import React, { useState, useEffect, useCallback } from 'react';
import type { Category, ViewType, AccountTab, Product } from './types.js';
import { PRODUCTS } from './data/products.js';
import { productsApi } from './services/api.js';
import { useCart } from './context/CartContext.js';
import {
  HomePage,
  ShopPage,
  DealsPage,
  TopRatedPage,
  ProductDetailPage,
  AccountPage
} from './pages/index.js';
import {
  Navbar,
  Footer,
  CartDrawer,
  QuickViewModal,
  AuthModal,
  LocationModal
} from './components/index.js';

export const App: React.FC = () => {
  const { addToCart, openCart } = useCart();

  const [currentCategory, setCurrentCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [currentAccountTab, setCurrentAccountTab] = useState<AccountTab>('profile');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [productsList, setProductsList] = useState<readonly Product[]>(PRODUCTS);

  // Fetch products from authoritative backend API if online
  useEffect(() => {
    productsApi
      .getProducts()
      .then((res: any) => {
        if (res && res.products && res.products.length > 0) {
          const mapped: Product[] = res.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category as any,
            categoryName: p.category_name || (p.category.charAt(0).toUpperCase() + p.category.slice(1)),
            price: (p.price_cents || 0) / 100,
            wasPrice: p.was_price_cents ? p.was_price_cents / 100 : undefined,
            discount: p.discount_percentage ? `${p.discount_percentage}% OFF` : '',
            rating: Number(p.rating || 4.5),
            reviews: Number(p.reviews_count || 120),
            tag: p.tag || 'Trending',
            image: p.image,
            badgeClass: p.badge_class || 'badge-trending',
            description: p.description || '',
            features: p.features || []
          }));
          setProductsList(mapped);
        }
      })
      .catch(() => {
        // Fallback to static PRODUCTS
      });
  }, []);

  // Hash-based client-side routing
  const handleHashChange = useCallback(() => {
    const rawHash = window.location.hash.replace(/^#\/?/, '');
    const [pathPart, queryPart] = rawHash.split('?');

    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      const searchParam = params.get('search');
      if (searchParam) {
        setSearchQuery(searchParam);
      }
    }

    if (pathPart.startsWith('account')) {
      const parts = pathPart.split('/');
      setCurrentView('account');
      if (parts[1]) {
        setCurrentAccountTab(parts[1] as AccountTab);
      }
    } else if (pathPart.startsWith('product/')) {
      const productId = pathPart.replace('product/', '');
      const found =
        productsList.find((p) => p.id === productId) ||
        PRODUCTS.find((p) => p.id === productId);

      if (found) {
        setSelectedProduct(found);
        setCurrentView('product-detail');
      } else {
        setCurrentView('shop');
      }
    } else if (pathPart.startsWith('category/')) {
      const cat = pathPart.replace('category/', '') as Category;
      setCurrentCategory(cat);
      setCurrentView('shop');
    } else if (pathPart.startsWith('shop')) {
      setCurrentView('shop');
    } else if (pathPart.startsWith('deals')) {
      setCurrentView('deals');
    } else if (pathPart.startsWith('top-rated')) {
      setCurrentView('top-rated');
    } else {
      setCurrentView('home');
    }
  }, [productsList]);

  useEffect(() => {
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [handleHashChange]);

  const handleNavigate = (view: ViewType, tab: AccountTab = 'profile') => {
    setCurrentView(view);
    if (view === 'account') {
      setCurrentAccountTab(tab);
      window.location.hash = `/account/${tab}`;
    } else if (view === 'home') {
      window.location.hash = '/';
    } else if (view === 'shop' || view === 'store') {
      window.location.hash = currentCategory === 'all' ? '/shop' : `/category/${currentCategory}`;
    } else if (view === 'deals') {
      window.location.hash = '/deals';
    } else if (view === 'top-rated') {
      window.location.hash = '/top-rated';
    } else if (view === 'product-detail' && selectedProduct) {
      window.location.hash = `/product/${selectedProduct.id}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (category: Category) => {
    setCurrentCategory(category);
    setCurrentView('shop');
    window.location.hash = category === 'all' ? '/shop' : `/category/${category}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
    window.location.hash = `/product/${product.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuyNow = (product: Product, quantity: number) => {
    addToCart(product, quantity);
    openCart();
  };

  return (
    <div className="app-container">
      {/* Dynamic Navbar with TopStrip, MainHeader, and Multi-Section CategoryNav */}
      <Navbar
        currentCategory={currentCategory}
        onSelectCategory={handleSelectCategory}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
        currentView={currentView}
      />

      {/* Main Dynamic Multi-Page Router */}
      <main className="site-main-content">
        {/* 1. Home Landing Page */}
        {currentView === 'home' && (
          <HomePage
            products={productsList}
            onSelectCategory={handleSelectCategory}
            onSelectProduct={handleSelectProduct}
            onOpenQuickView={setQuickViewProduct}
          />
        )}

        {/* 2. Shop & Catalog Page with Left Filter Sidebar */}
        {(currentView === 'shop' || currentView === 'store') && (
          <ShopPage
            products={productsList}
            currentCategory={currentCategory}
            searchQuery={searchQuery}
            onSelectCategory={handleSelectCategory}
            onSelectProduct={handleSelectProduct}
            onOpenQuickView={setQuickViewProduct}
          />
        )}

        {/* 3. Flash Deals & Limited Discounts Page */}
        {currentView === 'deals' && (
          <DealsPage
            products={productsList}
            onSelectCategory={handleSelectCategory}
            onSelectProduct={handleSelectProduct}
            onOpenQuickView={setQuickViewProduct}
          />
        )}

        {/* 4. Top Rated & Customer Acclaimed Favorites Page */}
        {currentView === 'top-rated' && (
          <TopRatedPage
            products={productsList}
            onSelectCategory={handleSelectCategory}
            onSelectProduct={handleSelectProduct}
            onOpenQuickView={setQuickViewProduct}
          />
        )}

        {/* 5. Comprehensive Product Detail & Customer Reviews Page */}
        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            allProducts={productsList}
            onBack={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                handleNavigate('shop');
              }
            }}
            onSelectCategory={handleSelectCategory}
            onSelectProduct={handleSelectProduct}
            onOpenQuickView={setQuickViewProduct}
            onBuyNow={handleBuyNow}
          />
        )}

        {/* 6. User Account Dashboard */}
        {currentView === 'account' && (
          <AccountPage
            activeTab={currentAccountTab}
            onSelectTab={(tab) => {
              setCurrentAccountTab(tab);
              window.location.hash = `/account/${tab}`;
            }}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Modern Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Slide-Out Cart Drawer with Direct Razorpay Checkout */}
      <CartDrawer onNavigate={handleNavigate} />

      {/* Quick View Product Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Auth Modal (Sign In / Register) */}
      <AuthModal />

      {/* Location Auto-Detect & Delivery Selector Modal */}
      <LocationModal />
    </div>
  );
};
