import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles.css';
import { App } from './App.js';
import { ToastProvider } from './context/ToastContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { WishlistProvider } from './context/WishlistContext.js';
import { CartProvider } from './context/CartContext.js';
import { LocationProvider } from './context/LocationContext.js';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ToastProvider>
        <AuthProvider>
          <LocationProvider>
            <WishlistProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </WishlistProvider>
          </LocationProvider>
        </AuthProvider>
      </ToastProvider>
    </React.StrictMode>
  );
}
