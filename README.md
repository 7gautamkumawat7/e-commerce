# 🛍️ ShopCart - Modern Full-Featured E-Commerce Web Application

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Live%20%26%20In--App%20Gateway-02042B?logo=razorpay&logoColor=0C2340)](https://razorpay.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

**ShopCart** is an enterprise-grade, high-performance e-commerce single-page application built with **React 18**, **TypeScript**, **Vite**, and modern **CSS3**. Engineered with a modular component architecture, reactive state management via React Contexts, instant client-side hash routing, real-time GPS Geolocation auto-detection via open reverse-geocoding APIs, **Dual-Mode Razorpay Live & Instant Payment integration**, an interactive cart engine with coupon support, and a complete **User Account & Order Tracking portal**.

---

## 📑 Table of Contents

- [🚀 Key Features](#-key-features)
  - [📍 Smart GPS Geolocation & Delivery Selector](#-smart-gps-geolocation--delivery-selector)
  - [💳 Dual-Mode Razorpay Payment Gateway](#-dual-mode-razorpay-payment-gateway)
  - [🛒 Storefront & Product Catalog](#-storefront--product-catalog)
  - [🛍️ Slide-Out Cart & Checkout Engine](#️-slide-out-cart--checkout-engine)
  - [🔐 Authentication & User Management](#-authentication--user-management)
  - [👤 Account Portal & Order Tracking](#-account-portal--order-tracking)
  - [🎨 Design System & UI/UX](#-design-system--uiux)
- [🛠️ Technology Stack](#️-technology-stack)
- [📂 Project Structure](#-project-structure)
- [⚡ Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [1. Clone & Install](#1-clone--install)
  - [2. Environment Configuration](#2-environment-configuration)
  - [3. Start Development Server](#3-start-development-server)
  - [4. Build for Production](#4-build-for-production)
  - [5. TypeScript Verification](#5-typescript-verification)
- [💳 Razorpay Configuration & Modes](#-razorpay-configuration--modes)
- [🔑 Demo Credentials & Coupon Codes](#-demo-credentials--coupon-codes)
- [🌐 Client-Side Routing](#-client-side-routing)
- [📄 License](#-license)

---

## 🚀 Key Features

### 📍 Smart GPS Geolocation & Delivery Selector
- **Real-Time GPS Auto-Detection**: Click on the *"Deliver to"* badge in the Navbar or *"🎯 Auto-Detect Current Location"* in the modal to fetch device GPS coordinates.
- **Free Reverse Geocoding API**: Powered by `BigDataCloud Reverse Geocode Client API` (unlimited, zero API key required) with automatic fallback to `ipapi.co` IP geolocation.
- **Location Selector Modal**:
  - Live active location banner with animated green pulse indicator.
  - **Quick City Selection**: 1-click delivery presets for *Mumbai*, *Bengaluru*, *Delhi*, *New York*, *London*, *San Francisco*, *Sydney*, and *Tokyo*.
  - **Custom City & Pincode Entry**: Manually input any city or zip/postal code.
  - Instantly updates delivery information and shipping estimation across the entire store.

---

### 💳 Dual-Mode Razorpay Payment Gateway
- **Dual-Mode Payment Architecture**:
  - **Mode 1: Official Razorpay Live SDK**:
    - Connect your merchant **Razorpay Key ID** (`rzp_live_...` or `rzp_test_...`).
    - Automatically loads the official Razorpay Checkout SDK (`https://checkout.razorpay.com/v1/checkout.js`) with 256-bit SSL encryption.
    - Prefills customer details (name, email, phone) directly from the active user profile.
  - **Mode 2: Interactive In-App Payment Gateway (Instant Simulation & Fallback)**:
    - ⚡ **UPI & QR Code**: Scan an animated dynamic QR code or submit virtual payment addresses (`@okhdfcbank`, `@okaxis`, `@paytm`, `@ybl`).
    - 💳 **Credit & Debit Cards**: Interactive visual card graphic with live real-time preview (Cardholder Name, Card Number, Expiry, CVV).
    - 🏦 **NetBanking**: Direct selector for leading banks (*HDFC, ICICI, SBI, Axis, Kotak, PNB*).
    - ⚡ **1-Click Express Checkout**: Rapid authorization button that verifies and places the order instantly.
- **Dynamic Key Management**:
  - Configure statically via `.env` (`VITE_RAZORPAY_KEY_ID`).
  - Or configure dynamically at runtime under **Account Settings > Security & Payment Gateway** or inside the checkout modal without restarting the application.
- **Authentic Order Processing**:
  - Generates authentic payment IDs (`pay_live_...`), assigns tracking IDs (`TRK-...`), initializes the order in `Processing` state, clears the cart, shows animated floating toast notifications, and redirects the user to **Account > Orders & Tracking**.

---

### 🛒 Storefront & Product Catalog
- **Multi-Category Browsing**: Filter products across *Electronics*, *Fashion*, *Home & Kitchen*, *Beauty & Health*, and *Pet Supplies*.
- **Instant Search**: Real-time keyword filtering across product names, descriptions, categories, and tags.
- **Smart Sorting Engine**: Sort items by:
  - `Featured`
  - `Biggest Discount`
  - `Price: Low to High`
  - `Price: High to Low`
  - `Customer Rating`
- **Dynamic Badges**: Highlighted tags for *Bestseller*, *Top Deal*, *Trending*, and *New Arrival*.
- **Quick View Modal (👁️)**:
  - High-resolution product images.
  - Detailed product descriptions and feature bullet points.
  - Customer review counts and star rating metrics.
  - Quality guarantee and warranty badges.
  - Custom quantity increment/decrement controls with direct *Add to Cart*.
- **Interactive Wishlist (❤️)**: Save favorite items with instant visual heart toggle, persisted across sessions in LocalStorage.

---

### 🛍️ Slide-Out Cart & Checkout Engine
- **Global Drawer Access**: Accessible anytime via the navbar cart icon with item count badge.
- **Free Delivery Tracker**: Dynamic progress bar calculating progress toward the free delivery threshold.
- **Coupon & Promo Engine**: Apply promotional vouchers (e.g., `SUMMER20`, `SAVE20`) with instant validation and discount deduction.
- **Live Order Breakdown**: Real-time calculations for subtotal, shipping fees, applied discounts, and grand total.
- **Direct Checkout Trigger**: 1-click button to launch the Razorpay Payment Gateway.

---

### 🔐 Authentication & User Management
- **Context-Preserving Auth Modal**: Log in or register without losing the current shopping context or cart items.
- **Sign In**:
  - Email & password validation.
  - Password visibility toggle.
  - **⚡ 1-Click Demo Login** button pre-configured with `demo@shopcart.com`.
- **Sign Up**:
  - Full Name, Email, Password, and Confirm Password verification.
  - Automatically initializes a user profile with default shipping addresses.
- **User Header Dropdown**: Shows user avatar, name, and quick navigation links to *Profile*, *Orders*, *Wishlist*, *Addresses*, and *Sign Out*.

---

### 👤 Account Portal & Order Tracking
Full client-side account management available at `#/account`:
- **Profile Overview**: Displays user avatar, name, email, phone, membership badge (*Gold VIP*), and member since date.
- **Tab 1: Personal Information**: Edit profile details (Name, Email, Phone) with instant storage persistence.
- **Tab 2: Order History & Live Tracking**:
  - Comprehensive list of past and newly placed orders.
  - Status indicators: `Processing`, `Shipped`, `Out for Delivery`, `Delivered`, `Cancelled`.
  - Payment details (Razorpay Payment ID, payment method used).
  - Item thumbnails, quantities, price breakdown, and delivery destination.
  - **Buy It Again (↺)**: 1-click re-ordering to populate cart.
  - **Track Package**: Interactive modal displaying carrier tracking number and delivery milestones.
- **Tab 3: Saved Wishlist**: Manage saved favorite items with direct *Move to Cart* or *Remove* actions.
- **Tab 4: Saved Addresses**: Manage default and secondary shipping destinations; add or edit delivery addresses.
- **Tab 5: Security & Payment Gateway**: Manage account credentials, view active login sessions, and dynamically update the **Razorpay Live Merchant Key ID**.

---

### 🎨 Design System & UI/UX
- **Modern Color Palette**: Curated dark navy header, emerald brand accents, clean neutral backgrounds, and high-contrast typography.
- **Glassmorphism & Micro-Interactions**: Translucent modals, elevation shadows, hover transitions, and animated loaders.
- **Responsive Layout**: Fluid CSS Grid and Flexbox layouts optimized for mobile, tablet, and desktop viewports.
- **Floating Toast System**: Reactive notifications for cart additions, wishlist updates, promo code applications, and payment successes.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | [React 18.3](https://react.dev/) | Component-based UI library using Functional Components & Hooks |
| **Language** | [TypeScript 5.7](https://www.typescriptlang.org/) | Type safety, shared interfaces, and compile-time validation |
| **Build Tool & Bundler** | [Vite 6.2](https://vitejs.dev/) | Lightning-fast HMR and optimized production bundling |
| **Payment Gateway** | [Razorpay SDK](https://razorpay.com/) | Official Checkout SDK + In-App Interactive Gateway Simulator |
| **Geolocation API** | [BigDataCloud API](https://www.bigdatacloud.com/) + [IP-API](https://ipapi.co/) | Free reverse geocoding and fallback IP geolocation |
| **Styling** | Vanilla CSS3 | Custom Design Tokens, CSS Variables, Flexbox/Grid, Animations |
| **State Management** | React Context API | `AuthContext`, `CartContext`, `WishlistContext`, `LocationContext`, `ToastContext` |
| **Persistence** | Browser `localStorage` | Type-safe storage engine for users, cart, orders, wishlist, and keys |

---

## 📂 Project Structure

```
7-e-commerce-web/
├── index.html                    # Single Page Application HTML entry point
├── package.json                  # Project dependencies and npm scripts
├── tsconfig.json                 # TypeScript compiler configuration (React JSX)
├── vite.config.ts                # Vite dev server and React plugin setup
├── styles.css                    # Global design system, utility tokens, and component styles
├── .env                          # Local environment variables (Razorpay Key, Currency)
├── .env.example                  # Template for environment variables
├── ECOMMERCE_PRODUCT_IMAGES/     # High-resolution product image assets
└── src/
    ├── main.tsx                  # React 18 root entry point with Context Providers
    ├── App.tsx                   # Main application layout & hash router controller
    ├── types.ts                  # Central TypeScript definitions (Product, User, Order, etc.)
    ├── vite-env.d.ts             # Vite client and module type declarations
    ├── data/
    │   └── products.ts           # Product catalog dataset with categories, prices, specs
    ├── services/
    │   ├── auth.ts               # User authentication, registration & profile storage
    │   ├── cart.ts               # Cart persistence, quantity management & price calculations
    │   ├── location.ts           # GPS Geolocation & reverse-geocoding service
    │   ├── orders.ts             # Order lifecycle management, tracking ID generator & seeds
    │   ├── razorpay.ts           # Razorpay SDK loader, dynamic key manager & checkout runner
    │   ├── router.ts             # Hash-based client routing utilities
    │   ├── storage.ts            # Type-safe LocalStorage helper wrappers
    │   └── wishlist.ts           # Wishlist storage and toggle actions
    ├── context/
    │   ├── AuthContext.tsx       # Authentication session and user state provider
    │   ├── CartContext.tsx       # Reactive cart store with drawer toggle & checkout handlers
    │   ├── LocationContext.tsx   # Delivery destination and GPS detection state
    │   ├── ToastContext.tsx      # Global floating toast alert system
    │   └── WishlistContext.tsx   # Wishlist state provider
    └── components/
        ├── Navbar.tsx            # Top notification strip, main search header, and category nav
        ├── Hero.tsx              # Promotional hero banner with call-to-action
        ├── QuickLinks.tsx        # Feature highlight cards (Fast Delivery, Secure Payments, etc.)
        ├── CategoryGrid.tsx      # Visual category tiles with image previews
        ├── ProductCard.tsx       # Product card with price tags, badges, wishlist toggle & cart action
        ├── ProductCatalog.tsx    # Filter pills, sort dropdown, and responsive product grid
        ├── SplitBanner.tsx       # Lifestyle promotional banner
        ├── TopRatedSection.tsx   # Top customer rated products showcase
        ├── CartDrawer.tsx        # Slide-out cart drawer with free shipping bar & promo code engine
        ├── QuickViewModal.tsx    # Detailed product specifications modal
        ├── AuthModal.tsx         # Sign In & Sign Up modal with 1-Click Demo Login
        ├── LocationModal.tsx     # GPS detection and quick-city selector dialog
        ├── RazorpayModal.tsx     # Razorpay Checkout Modal (Live SDK, UPI/QR, Cards, NetBanking)
        ├── AccountPage.tsx       # Full Account Portal (Profile, Orders, Wishlist, Addresses, Security)
        └── Footer.tsx            # Multi-column footer with links, customer care & back-to-top
```

---

## ⚡ Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (version **18.0** or higher recommended)
- `npm` (bundled with Node.js) or `yarn` / `pnpm`

---

### 1. Clone & Install
Clone the repository and install the project dependencies:
```bash
# Navigate to the project root directory
npm install
```

---

### 2. Environment Configuration
Copy `.env.example` to create your local `.env` file:
```bash
# Windows PowerShell / CMD / Bash:
cp .env.example .env
```

Open `.env` in your editor and configure your preferences:
```env
# Razorpay Merchant Key ID (Leave as placeholder to use In-App simulated mode)
VITE_RAZORPAY_KEY_ID=rzp_live_sampleKey12345

# Default currency ('INR' for Indian Rupees or 'USD')
VITE_CURRENCY=INR
```

> **Note:** The app works out-of-the-box in **In-App Payment Simulation Mode** even without a real Razorpay key! You can test payments, place orders, and track deliveries immediately.

---

### 3. Start Development Server
Run the local Vite development server:
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

### 4. Build for Production
To build an optimized production bundle:
```bash
npm run build
```
The compiled output will be generated inside the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

---

### 5. TypeScript Verification
To validate all types across the codebase without emitting files:
```bash
npm run typecheck
```

---

## 💳 Razorpay Configuration & Modes

ShopCart provides a **Dual-Mode Payment Architecture** designed for both real transactions and demonstration:

### Mode 1: Real Razorpay Gateway (Live or Test Key)
1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Settings > API Keys** and generate a **Key ID** (`rzp_live_...` for live or `rzp_test_...` for test).
3. Set your key in `.env`:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_live_your_actual_key_here
   ```
4. *Or configure it dynamically in the app* under **Account > Security & Payment Gateway**.
5. When checking out, the app will initialize the official **Razorpay Checkout Modal** with all native payment options.

### Mode 2: Interactive In-App Simulated Gateway
- If no real key is configured, ShopCart seamlessly launches the **In-App Payment Gateway**.
- Choose between:
  - **UPI / QR Code**: Scan simulated QR code or enter a VPA (`user@upi`).
  - **Credit & Debit Cards**: Interactive visual card mockup with real-time field synchronization.
  - **NetBanking**: Select any top bank.
  - **1-Click Express Authorization**: Instantly approve transaction.
- Generates a valid payment ID (`pay_live_...`), updates order tracking, and clears your cart.

---

## 🔑 Demo Credentials & Coupon Codes

### Demo Account
Use the pre-configured credentials to test authenticated features, order history, and account settings:

| Field | Value |
|---|---|
| **Email** | `demo@shopcart.com` |
| **Password** | `password123` |
| **Shortcut** | Click **"⚡ 1-Click Demo Login"** in the Sign In modal |

---

### Available Promo Coupon Codes

| Coupon Code | Discount | Terms |
|---|---|---|
| `SUMMER20` | **20% OFF** | Applied to entire cart total |
| `SAVE20` | **20% OFF** | Storewide promotional savings |

---

## 🌐 Client-Side Routing

The application utilizes an efficient, dependency-free hash routing pattern:

| Route | Destination |
|---|---|
| `#/` | Main Storefront (Hero, Categories, Catalog, Split Banner, Top Rated) |
| `#/account` | User Account Portal (Default: Personal Profile) |
| `#/account/profile` | Personal Information & Contact Details editor |
| `#/account/orders` | Order History, Delivery Status & Package Tracking |
| `#/account/wishlist` | Saved Wishlist Items & Quick Add-to-Cart |
| `#/account/addresses` | Shipping Address Book & Default Address Manager |
| `#/account/security` | Security, Password & Razorpay Payment Gateway Key Manager |

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
