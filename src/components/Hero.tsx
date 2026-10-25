import React, { useState, useEffect } from 'react';
import type { Product } from '../types.js';
import {
  IconArrowRight,
  IconBolt,
  IconShieldCheck,
  IconTruck,
  IconRotateCcw,
  IconStar,
  IconSparkles
} from './Icons.js';
import { Badge, Button, Carousel } from './ui/index.js';

export interface HeroSlide {
  id: string;
  name: string;
  category: string;
  image: string;
  price: string;
  wasPrice: string;
  discount: string;
  rating: number;
  reviewsCount: string;
  badge: string;
  speedTag: string;
  route: string;
  bgImage: string;
  bgGradient: string;
  themeColor: string;
  glowOrb1: string;
  glowOrb2: string;
  headlineHighlight: string;
  headlineGradient: string;
  badgeText: string;
}

export const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: 'elec-1',
    name: 'Active Noise-Canceling Wireless Over-Ear Headphones',
    category: 'AUDIO & ELECTRONICS',
    image: 'products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3361_ELECTR_train.jpeg',
    price: '₹4,999',
    wasPrice: '₹7,499',
    discount: '-33% OFF',
    rating: 4.8,
    reviewsCount: '1,420+ Shoppers',
    badge: 'HOT DEAL',
    speedTag: 'Same-Day Dispatch',
    route: '/product/elec-1',
    bgImage: '/hero_bg.jpg',
    bgGradient: 'linear-gradient(to right, rgba(11, 15, 25, 0.82) 0%, rgba(15, 23, 42, 0.45) 45%, rgba(30, 27, 75, 0.12) 80%, rgba(11, 15, 25, 0.22) 100%)',
    themeColor: '#6366f1',
    glowOrb1: 'radial-gradient(circle, rgba(99, 102, 241, 0.45), transparent 70%)',
    glowOrb2: 'radial-gradient(circle, rgba(249, 115, 22, 0.35), transparent 70%)',
    headlineHighlight: 'exceptional living.',
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #c7d2fe 45%, #fdba74 100%)',
    badgeText: 'SUMMER 2026 EDIT • ACOUSTIC LUXURY'
  },
  {
    id: 'elec-2',
    name: 'Smart AMOLED Fitness & Health Tracker Watch',
    category: 'SMART TECH & WEARABLES',
    image: 'products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3368_ELECTR_train.jpeg',
    price: '₹5,999',
    wasPrice: '₹7,999',
    discount: '-25% OFF',
    rating: 4.7,
    reviewsCount: '890+ Shoppers',
    badge: 'BEST SELLER',
    speedTag: '14-Day Battery',
    route: '/product/elec-2',
    bgImage: '/hero_bg_wearables.jpg',
    bgGradient: 'linear-gradient(to right, rgba(4, 20, 26, 0.82) 0%, rgba(6, 36, 42, 0.45) 45%, rgba(6, 78, 59, 0.12) 80%, rgba(4, 20, 26, 0.22) 100%)',
    themeColor: '#10b981',
    glowOrb1: 'radial-gradient(circle, rgba(20, 184, 166, 0.45), transparent 70%)',
    glowOrb2: 'radial-gradient(circle, rgba(16, 185, 129, 0.35), transparent 70%)',
    headlineHighlight: 'intelligent wellness.',
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #a7f3d0 45%, #6ee7b7 100%)',
    badgeText: 'NEXT-GEN WEARABLES • AMOLED PRECISION'
  },
  {
    id: 'elec-3',
    name: 'Vintage Instant Print Camera with Built-in Flash',
    category: 'OPTICS & PHOTOGRAPHY',
    image: 'products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3376_ELECTR_train.jpeg',
    price: '₹6,499',
    wasPrice: '₹7,999',
    discount: '-18% OFF',
    rating: 4.9,
    reviewsCount: '620+ Shoppers',
    badge: 'TRENDING',
    speedTag: 'Zero-Ink Thermal',
    route: '/product/elec-3',
    bgImage: '/hero_bg_camera.jpg',
    bgGradient: 'linear-gradient(to right, rgba(26, 16, 7, 0.82) 0%, rgba(40, 24, 12, 0.45) 45%, rgba(120, 53, 15, 0.12) 80%, rgba(26, 16, 7, 0.22) 100%)',
    themeColor: '#f59e0b',
    glowOrb1: 'radial-gradient(circle, rgba(245, 158, 11, 0.45), transparent 70%)',
    glowOrb2: 'radial-gradient(circle, rgba(234, 88, 12, 0.35), transparent 70%)',
    headlineHighlight: 'timeless memories.',
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #fde68a 45%, #f97316 100%)',
    badgeText: 'OPTICAL EXCELLENCE • ZERO-INK RETRO'
  },
  {
    id: 'home-4',
    name: '15-Bar Italian Pump Stainless Steel Espresso Machine',
    category: 'HOME & KITCHEN',
    image: 'products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10001_HOME_K_train.jpeg',
    price: '₹8,999',
    wasPrice: '₹13,999',
    discount: '-36% OFF',
    rating: 4.8,
    reviewsCount: '760+ Shoppers',
    badge: 'PREMIUM CHOICE',
    speedTag: 'Cafe-Quality Crema',
    route: '/product/home-4',
    bgImage: '/hero_bg_kitchen.jpg',
    bgGradient: 'linear-gradient(to right, rgba(23, 14, 10, 0.82) 0%, rgba(36, 20, 14, 0.45) 45%, rgba(88, 28, 13, 0.12) 80%, rgba(23, 14, 10, 0.22) 100%)',
    themeColor: '#d97706',
    glowOrb1: 'radial-gradient(circle, rgba(217, 119, 6, 0.45), transparent 70%)',
    glowOrb2: 'radial-gradient(circle, rgba(245, 158, 11, 0.35), transparent 70%)',
    headlineHighlight: 'artisanal comfort.',
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #fed7aa 45%, #fb923c 100%)',
    badgeText: 'BARISTA MASTERCLASS • 15-BAR ESPRESSO'
  },
  {
    id: 'fash-1',
    name: 'Minimalist Stainless Steel Mesh Chronograph Watch',
    category: 'FASHION & TIMEPIECES',
    image: 'products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2290_CLOTHI_train.jpeg',
    price: '₹4,999',
    wasPrice: '₹8,499',
    discount: '-41% OFF',
    rating: 4.8,
    reviewsCount: '740+ Shoppers',
    badge: 'LIMITED EDITION',
    speedTag: 'Sapphire Crystal',
    route: '/product/fash-1',
    bgImage: '/hero_bg_fashion.jpg',
    bgGradient: 'linear-gradient(to right, rgba(28, 9, 18, 0.82) 0%, rgba(40, 12, 24, 0.45) 45%, rgba(136, 19, 55, 0.12) 80%, rgba(28, 9, 18, 0.22) 100%)',
    themeColor: '#f43f5e',
    glowOrb1: 'radial-gradient(circle, rgba(244, 63, 94, 0.45), transparent 70%)',
    glowOrb2: 'radial-gradient(circle, rgba(225, 29, 72, 0.35), transparent 70%)',
    headlineHighlight: 'couture elegance.',
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #fecdd3 45%, #fb7185 100%)',
    badgeText: 'PARISIAN EDIT • SAPPHIRE CHRONOGRAPH'
  },
  {
    id: 'beauty-1',
    name: 'Hyaluronic Acid Multi-Molecular Hydration Serum 50ml',
    category: 'BEAUTY & WELLNESS',
    image: 'products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1088_BEAUTY_train.jpeg',
    price: '₹1,299',
    wasPrice: '₹1,999',
    discount: '-35% OFF',
    rating: 4.9,
    reviewsCount: '1,850+ Shoppers',
    badge: 'ORGANIC ESSENTIAL',
    speedTag: 'Deep Cellular Delivery',
    route: '/product/beauty-1',
    bgImage: '/hero_bg_beauty.jpg',
    bgGradient: 'linear-gradient(to right, rgba(17, 10, 32, 0.82) 0%, rgba(26, 14, 46, 0.45) 45%, rgba(76, 29, 149, 0.12) 80%, rgba(17, 10, 32, 0.22) 100%)',
    themeColor: '#a855f7',
    glowOrb1: 'radial-gradient(circle, rgba(168, 85, 247, 0.45), transparent 70%)',
    glowOrb2: 'radial-gradient(circle, rgba(56, 189, 248, 0.35), transparent 70%)',
    headlineHighlight: 'pure radiance.',
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #e9d5ff 45%, #a855f7 100%)',
    badgeText: 'CLEAN BEAUTY • HYALURONIC HYDRATION'
  }
];

export interface HeroProps {
  onSelectProduct?: (product: Product) => void;
  products?: readonly Product[];
  currentSlide?: number;
  onSlideChange?: (index: number) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onSelectProduct,
  products,
  currentSlide: controlledSlide,
  onSlideChange: controlledSlideChange
}) => {
  const [internalSlide, setInternalSlide] = useState(0);

  const isControlled = controlledSlide !== undefined;
  const currentSlide = isControlled ? controlledSlide : internalSlide;

  // Master 1.5s timer fallback if not controlled by parent
  useEffect(() => {
    if (isControlled) return;

    const timer = setInterval(() => {
      setInternalSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 1500);

    return () => clearInterval(timer);
  }, [isControlled]);

  const activeSlide = HERO_SLIDES[currentSlide];
  const nextSlide = HERO_SLIDES[(currentSlide + 1) % HERO_SLIDES.length];

function hexToRgb(hex: string): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 79;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 70;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 229;
  return `${r}, ${g}, ${b}`;
}

  // Synchronize the active theme color with the global CSS variable for Footer & Navbars
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-active', activeSlide.themeColor);
    document.documentElement.style.setProperty('--theme-active-rgb', hexToRgb(activeSlide.themeColor));
    return () => {
      document.documentElement.style.setProperty('--theme-active', '#4f46e5');
      document.documentElement.style.setProperty('--theme-active-rgb', '79, 70, 229');
    };
  }, [activeSlide.themeColor]);

  const handleSlideSelect = (index: number) => {
    if (isControlled && controlledSlideChange) {
      controlledSlideChange(index);
    } else {
      setInternalSlide(index);
    }
  };

  const handleNavigate = (route: string) => {
    window.location.hash = route;
  };

  const handleProductClick = (slide: HeroSlide) => {
    if (onSelectProduct && products) {
      const match = products.find((p) => p.id === slide.id);
      if (match) {
        onSelectProduct(match);
        return;
      }
    }
    handleNavigate(slide.route);
  };

  return (
    <section
      className="hero-modern"
      aria-label="Hero Introduction"
    >
      {/* 1.5s Dynamic Background Multi-layer Stack */}
      <div className="hero-bg-stack" aria-hidden="true">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.id}
              className={`hero-bg-slide ${isActive ? 'is-active' : ''}`}
              style={{
                backgroundImage: `${slide.bgGradient}, url('${slide.bgImage}')`
              }}
            />
          );
        })}
        <div className="hero-bg-vignette" />
      </div>

      {/* Dynamic ambient lighting that transitions with each background */}
      <div className="hero-ambient-glow" aria-hidden="true">
        <div
          className="glow-orb glow-orb-1"
          style={{ background: activeSlide.glowOrb1 }}
        />
        <div
          className="glow-orb glow-orb-2"
          style={{ background: activeSlide.glowOrb2 }}
        />
      </div>

      {/* 1.5s Background Rotation Progress Indicators */}
      <div className="hero-bg-indicators" aria-label="1.5-second background themes">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <button
              key={slide.id}
              type="button"
              className={`hero-bg-pill ${isActive ? 'active' : ''}`}
              onClick={() => handleSlideSelect(idx)}
              title={`Switch to ${slide.category} (${idx + 1}/${HERO_SLIDES.length})`}
              aria-label={`Slide ${idx + 1}: ${slide.category}`}
            >
              <span
                key={`${idx}-${currentSlide}`}
                className="hero-bg-pill-bar"
              />
            </button>
          );
        })}
        
      </div>

      <div className="hero-grid">
        {/* Left Column: Compelling Editorial Typography & CTAs with Shadcn UI */}
        <div className="hero-copy-column">
          <div className="flex items-center gap-2 mb-4">
            <Badge
              variant="outline"
              className="hero-badge py-1 px-3 border-white/20 bg-white/10 shadow-xs"
              style={{ borderColor: `${activeSlide.themeColor}70` }}
            >
              <span
                className="badge-glow-dot mr-1.5"
                style={{ background: activeSlide.themeColor, boxShadow: `0 0 10px ${activeSlide.themeColor}` }}
              />
              <IconSparkles size={14} className="badge-icon mr-1" style={{ color: activeSlide.themeColor }} />
              <span>{activeSlide.badgeText}</span>
            </Badge>

            <span className="hero-speed-badge" title="Front page background and showcase rotate synchronously every 1.5 seconds">
              <span
                className="hero-speed-badge-pulse"
                style={{ background: activeSlide.themeColor }}
              />
             
            </span>
          </div>

          <h1 className="hero-title">
            Make room for
            <br />
            <span
              className="gradient-text hero-dynamic-tagline"
              style={{ backgroundImage: activeSlide.headlineGradient }}
            >
              {activeSlide.headlineHighlight}
            </span>
          </h1>

          <p className="hero-subtitle">
            Meticulously engineered electronics, modern fashion, and artisanal home essentials.
            Designed for those who appreciate premium quality and effortless everyday delivery.
          </p>

          <div className="hero-cta-group">
            <Button
              size="lg"
              variant="glow"
              className="btn-primary-glow"
              onClick={() => handleNavigate('/shop')}
            >
              <span>Explore Catalog</span>
              <IconArrowRight size={18} className="btn-arrow ml-1" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="btn-secondary-glass"
              onClick={() => handleNavigate('/deals')}
            >
              <IconBolt size={18} className="text-amber-500 mr-1" />
              <span>Flash Deals</span>
            </Button>
          </div>

          {/* Social Proof & Guarantees */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <IconTruck size={18} className="trust-icon" />
              <div>
                <strong>Free Delivery</strong>
                <small>Orders over ₹499</small>
              </div>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <IconShieldCheck size={18} className="trust-icon" />
              <div>
                <strong>100% Genuine</strong>
                <small>Verified authentic</small>
              </div>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <IconRotateCcw size={18} className="trust-icon" />
              <div>
                <strong>30-Day Returns</strong>
                <small>Hassle-free exchange</small>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Shadcn 1.5-Second Auto-Rotating Product Showcase Carousel */}
        <div className="hero-visual-column">
          <Carousel
            autoPlay={false}
            totalSlides={HERO_SLIDES.length}
            currentSlide={currentSlide}
            onSlideChange={handleSlideSelect}
            className="w-full max-w-[340px]"
          >
            <div
              key={activeSlide.id}
              className="showcase-card-main hero-slide-item cursor-pointer"
              onClick={() => handleProductClick(activeSlide)}
              title="Click to view full product details"
            >
              <div className="showcase-badge-deal">
                <span>{activeSlide.discount}</span>
              </div>

              <div className="showcase-img-container">
                <img
                  src={activeSlide.image}
                  alt={activeSlide.name}
                  className="showcase-img"
                  loading="eager"
                />
              </div>

              <div className="showcase-card-details">
                <span className="showcase-cat">{activeSlide.category}</span>
                <h3 className="showcase-name line-clamp-1">{activeSlide.name}</h3>

                <div className="showcase-price-row">
                  <div className="price-tag">
                    <span className="price-current">{activeSlide.price}</span>
                    <span className="price-original">{activeSlide.wasPrice}</span>
                  </div>
                  <span className="stock-chip">⚡ In Stock</span>
                </div>
              </div>

              {/* Floating Glassmorphic Social Rating Chip */}
              <div className="floating-chip floating-chip-rating">
                <div className="stars-row">
                  {[...Array(5)].map((_, i) => (
                    <IconStar key={i} size={14} filled={true} />
                  ))}
                </div>
                <div className="rating-info">
                  <strong>{activeSlide.rating} / 5.0</strong>
                  <small>({activeSlide.reviewsCount})</small>
                </div>
              </div>

              {/* Floating Glassmorphic Delivery Speed Chip */}
              <div className="floating-chip floating-chip-delivery">
                <span className="speed-dot"></span>
                <div>
                  <strong>{activeSlide.speedTag}</strong>
                  <small>Live GPS Tracking</small>
                </div>
              </div>
            </div>
          </Carousel>

          {/* Secondary Accent Floating Card - Previews the next slide in 1.5s queue */}
          <div
            className="showcase-card-secondary"
            onClick={() => handleSlideSelect((currentSlide + 1) % HERO_SLIDES.length)}
            title="Next item in 1.5s rotation (click to switch immediately)"
          >
            <img
              src={nextSlide.image}
              alt={nextSlide.name}
              className="secondary-thumb"
            />
            <div className="secondary-info">
              <span className="secondary-tag">NEXT UP</span>
              <strong>{nextSlide.name}</strong>
              <span className="secondary-price">{nextSlide.price}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
