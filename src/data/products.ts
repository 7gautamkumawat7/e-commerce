import type { Product } from '../types.js';

export const PRODUCTS: readonly Product[] = [
  // --- ELECTRONICS ---
  {
    id: 'elec-1',
    name: 'Active Noise-Canceling Wireless Over-Ear Headphones',
    category: 'electronics',
    categoryName: 'Electronics',
    price: 4999,
    wasPrice: 7499,
    discount: '-33%',
    rating: 4.8,
    reviews: 1420,
    tag: 'Bestseller',
    image: 'ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3361_ELECTR_train.jpeg',
    badgeClass: 'badge-hot',
    description: 'Immerse yourself in pure studio-grade sound with hybrid active noise cancellation, ultra-soft memory foam earcups, and up to 40 hours of continuous wireless playback.',
    features: [
      'Hybrid Active Noise Cancellation (up to 35dB)',
      '40-Hour Battery with Quick Charge (5 min = 2 hrs)',
      'Bluetooth 5.3 Multi-Point Connection',
      'Built-in CVC 8.0 Quad Mics for crystal clear calls'
    ]
  },
  {
    id: 'elec-2',
    name: 'Smart AMOLED Fitness & Health Tracker Watch',
    category: 'electronics',
    categoryName: 'Electronics',
    price: 5999,
    wasPrice: 7999,
    discount: '-25%',
    rating: 4.6,
    reviews: 890,
    tag: 'Top Deal',
    image: 'ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3368_ELECTR_train.jpeg',
    badgeClass: 'badge-deal',
    description: 'Track your heart rate, blood oxygen (SpO2), stress levels, and 100+ workout modes on a vibrant always-on AMOLED display with 14-day battery life.',
    features: [
      '1.43" HD AMOLED Always-On Display',
      'Continuous SpO2 & Heart Rate Monitoring',
      '5ATM Water Resistance up to 50 meters',
      '14-Day Ultra Long Battery Life'
    ]
  },
  {
    id: 'elec-3',
    name: 'Vintage Instant Print Camera with Built-in Flash',
    category: 'electronics',
    categoryName: 'Electronics',
    price: 6499,
    wasPrice: 7999,
    discount: '-18%',
    rating: 4.9,
    reviews: 620,
    tag: 'Trending',
    image: 'ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3376_ELECTR_train.jpeg',
    badgeClass: 'badge-new',
    description: 'Capture tangible memories instantly! Features zero-ink thermal printing, vintage color filters, selfie mirror, and high-capacity rechargeable battery.',
    features: [
      'Instant ink-free thermal print technology',
      'Selfie mirror with dual auto-flash system',
      'MicroSD support for saving digital copies',
      'Retro aesthetic with protective neck strap included'
    ]
  },
  {
    id: 'elec-4',
    name: 'Ultra-Compact Ergonomic Wireless Bluetooth Earbuds',
    category: 'electronics',
    categoryName: 'Electronics',
    price: 2499,
    wasPrice: 3599,
    discount: '-30%',
    rating: 4.5,
    reviews: 1105,
    tag: 'Limited',
    image: 'ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3382_ELECTR_train.jpeg',
    badgeClass: 'badge-hot',
    description: 'Featherlight earbuds with punchy bass, IPX7 waterproof rating for heavy workouts, and a compact wireless charging case.',
    features: [
      'Deep Bass 12mm Graphene Dynamic Drivers',
      'IPX7 Sweat & Rainproof Protection',
      'Touch Controls & Low Latency Gaming Mode',
      '32 Hours Total Playtime with USB-C Case'
    ]
  },

  // --- CLOTHING & ACCESSORIES ---
  {
    id: 'fash-1',
    name: 'Minimalist Stainless Steel Mesh Chronograph Watch',
    category: 'fashion',
    categoryName: 'Fashion & Style',
    price: 4999,
    wasPrice: 8499,
    discount: '-41%',
    rating: 4.7,
    reviews: 740,
    tag: 'Save 41%',
    image: 'ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2290_CLOTHI_train.jpeg',
    badgeClass: 'badge-deal',
    description: 'Crafted with surgical-grade 316L stainless steel, scratch-resistant sapphire-coated glass, and precise Japanese quartz movement.',
    features: [
      'Japanese Quartz 3-Hand Movement with Date',
      'Scratch-resistant Sapphire Crystal Glass',
      'Quick-release Milanese Mesh Strap',
      '30-Meter Water Resistance'
    ]
  },
  {
    id: 'fash-2',
    name: 'Heavyweight Unisex Streetwear Combed Cotton Hoodie',
    category: 'fashion',
    categoryName: 'Fashion & Style',
    price: 2899,
    wasPrice: 4199,
    discount: '-30%',
    rating: 4.4,
    reviews: 512,
    tag: 'Popular',
    image: 'ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2301_CLOTHI_train.jpeg',
    badgeClass: 'badge-hot',
    description: '450 GSM ultra-dense french terry cotton hoodie featuring double-stitched seams, drop shoulders, and a structured oversized silhouette.',
    features: [
      '100% Combed Heavyweight Ringspun Cotton',
      'Double-needle durable reinforced stitching',
      'Pre-shrunk fabric to prevent shrinking',
      'Kangaroo pocket with hidden phone sleeve'
    ]
  },
  {
    id: 'fash-3',
    name: 'Polarized Retro Hexagonal Metal Sunglasses',
    category: 'fashion',
    categoryName: 'Fashion & Style',
    price: 1899,
    wasPrice: 2999,
    discount: '-37%',
    rating: 4.8,
    reviews: 980,
    tag: 'Bestseller',
    image: 'ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2309_CLOTHI_train.jpeg',
    badgeClass: 'badge-deal',
    description: 'Timeless hexagonal frames equipped with HD polarized UV400 lenses that eliminate glare while providing true-to-life color clarity.',
    features: [
      'UV400 Category 3 Glare-Blocking Polarization',
      'Corrosion-resistant lightweight metal alloy',
      'Soft adjustable silicone nose pads',
      'Includes hard case and micro-fiber cloth'
    ]
  },
  {
    id: 'fash-4',
    name: '18K Gold Plated Handcrafted Layered Pendant Set',
    category: 'fashion',
    categoryName: 'Fashion & Style',
    price: 2299,
    wasPrice: 3499,
    discount: '-33%',
    rating: 4.9,
    reviews: 430,
    tag: 'Trending',
    image: 'ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2317_CLOTHI_train.jpeg',
    badgeClass: 'badge-new',
    description: 'Elevate your everyday aesthetic with this radiant hypoallergenic 18k gold-plated multi-layer necklace set with waterproof anti-tarnish coating.',
    features: [
      'Genuine 18K Yellow Gold Electroplating',
      'Nickel-free, Lead-free, Hypoallergenic',
      'Protective Anti-Tarnish Lifetime Shield',
      'Adjustable 2-inch extender chain'
    ]
  },

  // --- BEAUTY & HEALTH ---
  {
    id: 'beauty-1',
    name: 'Hyaluronic Acid Multi-Molecular Hydration Serum 50ml',
    category: 'beauty',
    categoryName: 'Beauty & Wellness',
    price: 1299,
    wasPrice: 1999,
    discount: '-35%',
    rating: 4.9,
    reviews: 1850,
    tag: 'Award Winner',
    image: 'ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1088_BEAUTY_train.jpeg',
    badgeClass: 'badge-hot',
    description: 'Formulated with 5 molecular weights of hyaluronic acid and provitamin B5 to penetrate deep dermal layers for instant plumpness and lasting barrier repair.',
    features: [
      '5-Layer Deep Moisture Cellular Delivery',
      'Infused with soothing Provitamin B5 & Ceramides',
      'Fragrance-free, Oil-free, Non-comedogenic',
      '100% Vegan & Leaping Bunny Certified'
    ]
  },
  {
    id: 'beauty-2',
    name: 'Sonic Rechargeable Toothbrush with 8 Replacement Heads',
    category: 'beauty',
    categoryName: 'Beauty & Wellness',
    price: 2499,
    wasPrice: 3899,
    discount: '-36%',
    rating: 4.8,
    reviews: 870,
    tag: 'Top Rated',
    image: 'ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1095_BEAUTY_train.jpeg',
    badgeClass: 'badge-deal',
    description: 'Delivers 40,000 micro-vibrations per minute to remove 10x more plaque than manual brushing. Includes 8 Dupont brush heads and hard travel case.',
    features: [
      '40,000 VPM Maglev Ultrasonic Motor',
      '5 Brushing Modes (Clean, White, Polish, Gum, Sensitive)',
      'Smart 2-Minute Timer with 30s Quad-Pacer',
      '60 Days of Use on a Single 4-Hour Charge'
    ]
  },
  {
    id: 'beauty-3',
    name: 'Ultrasonic Ceramic Essential Oil Aroma Diffuser 500ml',
    category: 'beauty',
    categoryName: 'Beauty & Wellness',
    price: 1699,
    wasPrice: 2699,
    discount: '-37%',
    rating: 4.7,
    reviews: 640,
    tag: 'Eco Friendly',
    image: 'ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1098_BEAUTY_train.jpeg',
    badgeClass: 'badge-deal',
    description: 'Whisper-quiet cold ultrasonic mist diffusion with ambient soothing 7-color LED lights and auto-shutoff when water level is depleted.',
    features: [
      '500ml Large Capacity (up to 16 hours continuous mist)',
      'BPA-Free Eco Material & Whisper Quiet <20dB',
      '7 Ambient Color Breathing Light Modes',
      'Auto Waterless Shut-Off Safety System'
    ]
  },

  // --- HOME & KITCHEN ---
  {
    id: 'home-1',
    name: 'Nordic Handcrafted Matte Ceramic Coffee Mug Set (4-Pack)',
    category: 'home',
    categoryName: 'Home & Living',
    price: 1399,
    wasPrice: 2299,
    discount: '-40%',
    rating: 4.4,
    reviews: 950,
    tag: 'Deal of the Day',
    image: 'ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10000_HOME_K_train.jpeg',
    badgeClass: 'badge-deal',
    description: 'Charming artisanal stoneware ceramic mugs with textured speckled glaze and ergonomic comfort-grip handles. Microwave and dishwasher safe.',
    features: [
      'Lead-free, Non-toxic High-Fired Stoneware',
      '14 oz Generous Volume for Coffee, Tea & Soups',
      'Microwave, Oven & Dishwasher Safe',
      'Set of 4 complementary earthy matte tones'
    ]
  },
  {
    id: 'home-2',
    name: 'Pre-Seasoned Cast Iron Skillet with Silicone Handle Grip',
    category: 'home',
    categoryName: 'Home & Living',
    price: 2199,
    wasPrice: 3399,
    discount: '-35%',
    rating: 4.8,
    reviews: 1320,
    tag: 'Chef Choice',
    image: 'ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10007_HOME_K_train.jpeg',
    badgeClass: 'badge-hot',
    description: 'Heavy-duty 10.25-inch cast iron skillet seasoned with 100% natural organic flaxseed oil for unmatched heat distribution and effortless searing.',
    features: [
      'Pre-seasoned with 100% natural vegetable oil',
      'Compatible with Induction, Gas, Electric & Campfire',
      'Superior heat retention & even edge-to-edge cooking',
      'Includes heat-resistant silicone handle sleeve'
    ]
  },
  {
    id: 'home-3',
    name: 'Multi-Tier Sustainable Bamboo Desktop Storage Organizer',
    category: 'home',
    categoryName: 'Home & Living',
    price: 1499,
    wasPrice: 2299,
    discount: '-33%',
    rating: 4.5,
    reviews: 410,
    tag: 'Best Seller',
    image: 'ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10014_HOME_K_train.jpeg',
    badgeClass: 'badge-new',
    description: 'Keep your workspace tidy with this elegant 100% natural solid bamboo organizer featuring dual pullout drawers and adjustable book slots.',
    features: [
      '100% Premium Natural Sustainable Bamboo',
      'Smooth water-repellent protective clear finish',
      '2 pull-out drawers + 4 modular dividers',
      'Compact footprint maximizes desktop utility'
    ]
  },

  // --- PET SUPPLIES ---
  {
    id: 'pet-1',
    name: 'Orthopedic Joint-Relief Memory Foam Pet Bed',
    category: 'pets',
    categoryName: 'Pet Supplies',
    price: 2999,
    wasPrice: 4499,
    discount: '-33%',
    rating: 4.8,
    reviews: 790,
    tag: 'Vet Approved',
    image: 'ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10018_HOME_K_train.jpeg',
    badgeClass: 'badge-hot',
    description: 'Engineered with high-density egg-crate memory foam to soothe aging joints, paired with a machine-washable plush waterproof faux-fur cover.',
    features: [
      'High-density Orthopedic Memory Support Foam',
      'Waterproof internal lining protects against accidents',
      'Removable machine-washable ultra-soft plush cover',
      'Non-skid silicone studded bottom grip'
    ]
  },
  {
    id: 'pet-2',
    name: 'Interactive Smart Automatic Laser Cat Toy',
    category: 'pets',
    categoryName: 'Pet Supplies',
    price: 1399,
    wasPrice: 2199,
    discount: '-34%',
    rating: 4.6,
    reviews: 530,
    tag: 'Trending',
    image: 'ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10020_HOME_K_train.jpeg',
    badgeClass: 'badge-deal',
    description: 'Keep your indoor cats active and entertained with 360-degree irregular trajectory laser patterns and an automatic 15-minute sleep cycle.',
    features: [
      '3 Speed Modes: Slow, Fast, and Random Wander',
      'Automatic 15-min timer prevents pet exhaustion',
      'USB-C Rechargeable battery or plug-in continuous',
      'Silent motor ensures disturbance-free playtime'
    ]
  }
];
