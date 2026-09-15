import React, { useState, useEffect } from 'react';
import type { Category, ViewType, AccountTab, Product } from './types.js';
import { PRODUCTS } from './data/products.js';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { QuickLinks } from './components/QuickLinks.tsx';
import { CategoryGrid } from './components/CategoryGrid.tsx';
import { ProductCatalog } from './components/ProductCatalog.tsx';
import { SplitBanner } from './components/SplitBanner.tsx';
import { TopRatedSection } from './components/TopRatedSection.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { QuickViewModal } from './components/QuickViewModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { AccountPage } from './components/AccountPage.tsx';
import { LocationModal } from './components/LocationModal.tsx';

export const App: React.FC = () => {
  const [currentCategory, setCurrentCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<ViewType>('store');
  const [currentAccountTab, setCurrentAccountTab] = useState<AccountTab>('profile');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Hash-based client-side routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash.startsWith('account')) {
        const parts = hash.split('/');
        setCurrentView('account');
        if (parts[1]) {
          setCurrentAccountTab(parts[1] as AccountTab);
        }
      } else {
        setCurrentView('store');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view: ViewType, tab: AccountTab = 'profile') => {
    setCurrentView(view);
    setCurrentAccountTab(tab);
    if (view === 'account') {
      window.location.hash = `/account/${tab}`;
    } else {
      window.location.hash = '/';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (category: Category) => {
    setCurrentCategory(category);
    if (currentView !== 'store') {
      handleNavigate('store');
    }
  };

  return (
    <div className="app-container">
      {/* Dynamic Navbar with TopStrip, MainHeader, and CategoryNav */}
      <Navbar
        currentCategory={currentCategory}
        onSelectCategory={handleSelectCategory}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
        currentView={currentView}
      />

      {/* Main Dynamic View */}
      {currentView === 'store' ? (
        <main>
          <Hero />
          <QuickLinks />
          <CategoryGrid onSelectCategory={handleSelectCategory} />
          <ProductCatalog
            products={PRODUCTS}
            currentCategory={currentCategory}
            searchQuery={searchQuery}
            onSelectCategory={handleSelectCategory}
            onOpenQuickView={setQuickViewProduct}
          />
          <SplitBanner onSelectCategory={handleSelectCategory} />
          <TopRatedSection onOpenQuickView={setQuickViewProduct} />
        </main>
      ) : (
        <AccountPage
          activeTab={currentAccountTab}
          onSelectTab={(tab) => {
            setCurrentAccountTab(tab);
            window.location.hash = `/account/${tab}`;
          }}
          onNavigate={handleNavigate}
        />
      )}

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Slide-Out Cart Drawer with Razorpay Checkout */}
      <CartDrawer onNavigate={handleNavigate} />

      {/* Quick View Product Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Auth Modal (Sign In / Create Account) */}
      <AuthModal />

      {/* Delivery Location Auto-Detect & Selector Modal */}
      <LocationModal />
    </div>
  );
};
