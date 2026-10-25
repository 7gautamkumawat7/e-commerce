import bcrypt from 'bcryptjs';
import { query, transaction, initDb, closeDb } from './connection.js';
import { logger } from '../utils/logger.js';

export const SEED_PRODUCTS = [
  {
    "id": "elec-1",
    "name": "Active Noise-Canceling Wireless Over-Ear Headphones",
    "slug": "active-noise-canceling-wireless-over-ear-headphones",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 499900,
    "was_price_cents": 749900,
    "discount_label": "-33%",
    "rating": 4.8,
    "reviews_count": 1420,
    "tag": "Bestseller",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3361_ELECTR_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Immerse yourself in pure studio-grade sound with hybrid active noise cancellation, ultra-soft memory foam earcups, and up to 40 hours of continuous wireless playback.",
    "features": [
      "Hybrid Active Noise Cancellation (up to 35dB)",
      "40-Hour Battery with Quick Charge (5 min = 2 hrs)",
      "Bluetooth 5.3 Multi-Point Connection",
      "Built-in CVC 8.0 Quad Mics for crystal clear calls"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-2",
    "name": "Smart AMOLED Fitness & Health Tracker Watch",
    "slug": "smart-amoled-fitness-health-tracker-watch",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 599900,
    "was_price_cents": 799900,
    "discount_label": "-25%",
    "rating": 4.6,
    "reviews_count": 890,
    "tag": "Top Deal",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3368_ELECTR_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Track your heart rate, blood oxygen (SpO2), stress levels, and 100+ workout modes on a vibrant always-on AMOLED display with 14-day battery life.",
    "features": [
      "1.43\" HD AMOLED Always-On Display",
      "Continuous SpO2 & Heart Rate Monitoring",
      "5ATM Water Resistance up to 50 meters",
      "14-Day Ultra Long Battery Life"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-3",
    "name": "Vintage Instant Print Camera with Built-in Flash",
    "slug": "vintage-instant-print-camera-with-built-in-flash",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 649900,
    "was_price_cents": 799900,
    "discount_label": "-18%",
    "rating": 4.9,
    "reviews_count": 620,
    "tag": "Trending",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3376_ELECTR_train.jpeg",
    "badge_class": "badge-new",
    "description": "Capture tangible memories instantly! Features zero-ink thermal printing, vintage color filters, selfie mirror, and high-capacity rechargeable battery.",
    "features": [
      "Instant ink-free thermal print technology",
      "Selfie mirror with dual auto-flash system",
      "MicroSD support for saving digital copies",
      "Retro aesthetic with protective neck strap included"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-4",
    "name": "Ultra-Compact Ergonomic Wireless Bluetooth Earbuds",
    "slug": "ultra-compact-ergonomic-wireless-bluetooth-earbuds",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 249900,
    "was_price_cents": 359900,
    "discount_label": "-30%",
    "rating": 4.5,
    "reviews_count": 1105,
    "tag": "Limited",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3382_ELECTR_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Featherlight earbuds with punchy bass, IPX7 waterproof rating for heavy workouts, and a compact wireless charging case.",
    "features": [
      "Deep Bass 12mm Graphene Dynamic Drivers",
      "IPX7 Sweat & Rainproof Protection",
      "Touch Controls & Low Latency Gaming Mode",
      "32 Hours Total Playtime with USB-C Case"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-5",
    "name": "4K Ultra-HD Foldable GPS Drone with EIS Gimbal",
    "slug": "4k-ultra-hd-foldable-gps-drone-with-eis-gimbal",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 1499900,
    "was_price_cents": 2199900,
    "discount_label": "-31%",
    "rating": 4.7,
    "reviews_count": 430,
    "tag": "Editor Choice",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3365_ELECTR_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Cinematic 4K camera with electronic image stabilization, brushless motors, intelligent return-to-home GPS, and 30-minute flight endurance.",
    "features": [
      "4K 30fps HDR Video & 12MP Stills",
      "Dual Satellite GPS with Auto-Return",
      "Optical Flow Sensor for Steady Indoor Hover",
      "Up to 3km Video Transmission Range"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-6",
    "name": "Waterproof Portable Bluetooth 5.3 Outdoor Speaker",
    "slug": "waterproof-portable-bluetooth-5-3-outdoor-speaker",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 329900,
    "was_price_cents": 499900,
    "discount_label": "-34%",
    "rating": 4.8,
    "reviews_count": 875,
    "tag": "Bestseller",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3366_ELECTR_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Rugged IP67 dustproof and waterproof speaker delivering 360-degree room-filling acoustic sound with passive bass radiators and 24-hour battery.",
    "features": [
      "20W High-Fidelity Audio with Dual Radiators",
      "IP67 Submersible Waterproof & Shockproof Shell",
      "PartyBoost Pairing: Link multiple units",
      "24-Hour Nonstop Battery Life"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-7",
    "name": "Mechanical RGB Gaming Keyboard with Blue Switches",
    "slug": "mechanical-rgb-gaming-keyboard-with-blue-switches",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 399900,
    "was_price_cents": 599900,
    "discount_label": "-33%",
    "rating": 4.6,
    "reviews_count": 960,
    "tag": "Top Deal",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3367_ELECTR_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Tactile satisfying clicky mechanical switches with customizable per-key RGB backlighting, aircraft-grade aluminum top frame, and detachable wrist rest.",
    "features": [
      "Hot-Swappable Blue Mechanical Switches",
      "16.8M Color RGB Backlighting with 18 FX Modes",
      "Anodized Brushed Aluminum Top Plate",
      "Detachable Magnetic Comfort Ergonomic Wrist Rest"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-8",
    "name": "Ergonomic Wireless Vertical Optical Mouse",
    "slug": "ergonomic-wireless-vertical-optical-mouse",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 149900,
    "was_price_cents": 229900,
    "discount_label": "-35%",
    "rating": 4.5,
    "reviews_count": 520,
    "tag": "Save 35%",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3369_ELECTR_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Reduces wrist fatigue and repetitive strain injuries with natural handshake vertical angle, whisper-quiet clicks, and adjustable 2400 DPI precision sensor.",
    "features": [
      "57-Degree Natural Handshake Ergonomic Angle",
      "Triple DPI Adjustment (1000/1600/2400 DPI)",
      "Dual 2.4GHz Wireless + Bluetooth 5.0 Mode",
      "Rechargeable 500mAh Lithium-ion Cell"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-9",
    "name": "20000mAh 65W PD Fast Charging Power Bank",
    "slug": "20000mah-65w-pd-fast-charging-power-bank",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 279900,
    "was_price_cents": 429900,
    "discount_label": "-35%",
    "rating": 4.8,
    "reviews_count": 1340,
    "tag": "Hot Pick",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3370_ELECTR_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Heavy-duty high capacity power bank capable of charging laptops, tablets, and phones simultaneously with Power Delivery 3.0 and Quick Charge 4.0.",
    "features": [
      "65W High-Output USB-C PD Laptop Charging",
      "Smart LED Digital Battery % Display",
      "Triple Output: 2x USB-C + 1x USB-A Ports",
      "Multi-Layer Surge, Temperature & Short-Circuit Protection"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-10",
    "name": "Smart Full HD Home Security Camera with Night Vision",
    "slug": "smart-full-hd-home-security-camera-with-night-vision",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 219900,
    "was_price_cents": 349900,
    "discount_label": "-37%",
    "rating": 4.6,
    "reviews_count": 780,
    "tag": "Popular",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3371_ELECTR_train.jpeg",
    "badge_class": "badge-new",
    "description": "Keep your loved ones safe with 360-degree motorized pan-tilt coverage, AI motion detection, two-way audio talkback, and infrared night vision.",
    "features": [
      "1080P Full HD with 360° Panoramic Pan/Tilt",
      "AI Human Motion Detection & Real-Time Alerts",
      "Two-Way Crisp Voice Intercom",
      "Secure Cloud & 128GB MicroSD Storage Support"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-11",
    "name": "High-Speed 7-in-1 USB-C Hub with 4K HDMI & PD",
    "slug": "high-speed-7-in-1-usb-c-hub-with-4k-hdmi-pd",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 189900,
    "was_price_cents": 299900,
    "discount_label": "-37%",
    "rating": 4.7,
    "reviews_count": 650,
    "tag": "Trending",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3372_ELECTR_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Expand your laptop connectivity with 4K@60Hz HDMI video out, 100W PD pass-through power, SD/TF card reader, and 3x USB 3.0 ultra-fast data ports.",
    "features": [
      "4K Ultra-HD HDMI Video Output",
      "100W Fast Pass-Through Charging Support",
      "5Gbps SuperSpeed USB 3.0 Ports",
      "Sleek Space Grey Aluminum Alloy Finish"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-12",
    "name": "Foldable 3-in-1 Magnetic Wireless Charging Station",
    "slug": "foldable-3-in-1-magnetic-wireless-charging-station",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 299900,
    "was_price_cents": 449900,
    "discount_label": "-33%",
    "rating": 4.8,
    "reviews_count": 890,
    "tag": "Hot Pick",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3373_ELECTR_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Streamline your nightstand or desk. Fast-charges your smartphone, smartwatch, and wireless earbuds simultaneously on one compact folding dock.",
    "features": [
      "MagSafe Compatible 15W Fast Magnetic Induction",
      "Dedicated Apple/Samsung Watch Charging Pad",
      "Folds flat into pocket-sized travel profile",
      "Over-voltage and Foreign Object Detection safety"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-13",
    "name": "Deep Bass Gaming Headset with Detachable Mic",
    "slug": "deep-bass-gaming-headset-with-detachable-mic",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 269900,
    "was_price_cents": 399900,
    "discount_label": "-32%",
    "rating": 4.5,
    "reviews_count": 1020,
    "tag": "Deal of Day",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3374_ELECTR_train.jpeg",
    "badge_class": "badge-deal",
    "description": "50mm neodymium audio drivers deliver precise directional footsteps and gunfire. Features breathable cooling gel ear cushions and noise-canceling mic.",
    "features": [
      "50mm Custom Tuned Directional Audio Drivers",
      "Cooling-Gel Infused Memory Foam Earpads",
      "Broadcast-Quality Detachable Noise-Canceling Mic",
      "Universal 3.5mm & USB Audio Compatibility"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-14",
    "name": "1080P Full HD Streaming Webcam with Privacy Shutter",
    "slug": "1080p-full-hd-streaming-webcam-with-privacy-shutter",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 229900,
    "was_price_cents": 349900,
    "discount_label": "-34%",
    "rating": 4.6,
    "reviews_count": 470,
    "tag": "Trending",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3375_ELECTR_train.jpeg",
    "badge_class": "badge-new",
    "description": "Look your best on video calls and live streams with auto light correction, dual stereo noise-canceling mics, and a magnetic physical privacy cover.",
    "features": [
      "1080P 60FPS Glass Lens with Autofocus",
      "Smart Automatic Low-Light Correction",
      "Built-in Dual Stereo Noise-Canceling Microphones",
      "Integrated Physical Security Privacy Shutter"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-15",
    "name": "Portable Mini Projector with 5G WiFi & Bluetooth",
    "slug": "portable-mini-projector-with-5g-wifi-bluetooth",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 899900,
    "was_price_cents": 1349900,
    "discount_label": "-33%",
    "rating": 4.7,
    "reviews_count": 310,
    "tag": "Limited Stock",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3377_ELECTR_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Transform your bedroom into a private cinema. Projects up to 150 inches with vibrant color reproduction, dual built-in HiFi speakers, and screen mirroring.",
    "features": [
      "Native 1080P Support with 7500 Lumens Brightness",
      "5G + 2.4G Dual-Band Wireless Screen Mirroring",
      "Keystone Correction & 50%-100% Zoom Function",
      "Equipped with HDMI, USB, Audio Jack Ports"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-16",
    "name": "Wi-Fi 6 Dual-Band Gigabit Mesh Router",
    "slug": "wi-fi-6-dual-band-gigabit-mesh-router",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 449900,
    "was_price_cents": 699900,
    "discount_label": "-36%",
    "rating": 4.8,
    "reviews_count": 590,
    "tag": "Save 36%",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3378_ELECTR_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Eliminate dead zones with next-gen Wi-Fi 6 speeds up to 1800 Mbps, 4 high-gain omnidirectional antennas, and seamless whole-home mesh roaming.",
    "features": [
      "Next-Gen Wi-Fi 6 Speeds up to 1.8 Gbps",
      "OFDMA & MU-MIMO for 60+ Concurrent Devices",
      "WPA3 Advanced Network Security Protocol",
      "Easy App Setup and Parental Bandwidth Controls"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-17",
    "name": "Smart Voice Assistant Speaker with Rich Bass",
    "slug": "smart-voice-assistant-speaker-with-rich-bass",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 349900,
    "was_price_cents": 499900,
    "discount_label": "-30%",
    "rating": 4.6,
    "reviews_count": 1250,
    "tag": "Bestseller",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3379_ELECTR_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Control your smart appliances, listen to podcasts, and stream high-res music with room-filling acoustics and intuitive far-field voice recognition.",
    "features": [
      "Far-Field Quad Microphone Voice Recognition",
      "Rich 360-degree Bass & Clear Vocal Tuned Audio",
      "Hands-Free Smart Home Appliance Automation",
      "Privacy Button: Electronically Disconnect Microphones"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-18",
    "name": "10.1-inch IPS Full HD Android Tablet",
    "slug": "10-1-inch-ips-full-hd-android-tablet",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 1199900,
    "was_price_cents": 1699900,
    "discount_label": "-29%",
    "rating": 4.5,
    "reviews_count": 380,
    "tag": "Top Pick",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3380_ELECTR_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Sleek metal unibody tablet with octa-core processor, vibrant 1920x1200 IPS display, dual speakers, and 7000mAh battery for learning and entertainment.",
    "features": [
      "10.1\" Eye-Protection IPS FHD Display",
      "Octa-Core 2.0GHz Processor with 64GB Storage",
      "7000mAh Battery: 10 Hours Continuous Video Playback",
      "Dual Cameras (8MP Rear + 5MP Front) for Video Calls"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-19",
    "name": "Handheld 3-Axis Smartphone Gimbal Stabilizer",
    "slug": "handheld-3-axis-smartphone-gimbal-stabilizer",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 699900,
    "was_price_cents": 999900,
    "discount_label": "-30%",
    "rating": 4.7,
    "reviews_count": 420,
    "tag": "Trending",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3381_ELECTR_train.jpeg",
    "badge_class": "badge-new",
    "description": "Shoot buttery smooth cinematic video with active face tracking, gesture controls, inception mode, and integrated tripod stand.",
    "features": [
      "3-Axis Motorized Stabilization System",
      "Smart AI Face & Object Auto-Tracking",
      "Inception Mode & Dynamic Timelapse Controls",
      "Foldable Compact Design with 12hr Battery Runtime"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-20",
    "name": "Premium Wireless Lavalier Microphone for Vlogging",
    "slug": "premium-wireless-lavalier-microphone-for-vlogging",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 299900,
    "was_price_cents": 459900,
    "discount_label": "-35%",
    "rating": 4.8,
    "reviews_count": 610,
    "tag": "Pro Audio",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3383_ELECTR_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Crystal-clear 20-meter wireless transmission for creators. Plug-and-play transmitter with real-time DSP noise reduction and magnetic clip.",
    "features": [
      "Plug & Play Automatic Pairing (iOS/Android/Type-C)",
      "Intelligent DSP Active Background Noise Cancellation",
      "20-Meter Ultra-Low Latency Wireless Range",
      "Includes Dual Transmitters & Portable Charging Case"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-21",
    "name": "Ultra-Thin Aluminum Laptop Cooling Pad with Dual Fans",
    "slug": "ultra-thin-aluminum-laptop-cooling-pad-with-dual-fans",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 159900,
    "was_price_cents": 249900,
    "discount_label": "-36%",
    "rating": 4.4,
    "reviews_count": 830,
    "tag": "Save 36%",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3384_ELECTR_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Keep your gaming or workstation laptop running cool with dual 140mm silent fans, 6-level ergonomic height adjustment, and dual USB pass-through ports.",
    "features": [
      "Dual 140mm Whisper-Quiet High-RPM Cooling Fans",
      "6 Adjustable Ergonomic Viewing Height Angles",
      "Aircraft-Grade Heat-Dissipating Aluminum Mesh",
      "Dual USB Port Pass-Through with Speed Control Wheel"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-22",
    "name": "Smart Bluetooth Anti-Lost Item Tracker (Pack of 2)",
    "slug": "smart-bluetooth-anti-lost-item-tracker-pack-of-2",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 169900,
    "was_price_cents": 249900,
    "discount_label": "-32%",
    "rating": 4.5,
    "reviews_count": 670,
    "tag": "Hot Deal",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3362_ELECTR_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Attach to keys, wallets, or luggage to track items using your phone app with 90dB buzzer chime, crowd-GPS locating, and 1-year replaceable battery.",
    "features": [
      "Loud 90dB Audio Buzzer Finder Alert",
      "Real-Time Map Location via Apple Find My / Android App",
      "Left-Behind Instant Smartphone Push Notifications",
      "Water-Resistant IP67 Rating with CR2032 Battery"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-23",
    "name": "Soundbar with Built-in Subwoofer & Optical Input",
    "slug": "soundbar-with-built-in-subwoofer-optical-input",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 549900,
    "was_price_cents": 899900,
    "discount_label": "-39%",
    "rating": 4.7,
    "reviews_count": 940,
    "tag": "Top Rated",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3363_ELECTR_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Upgrade your TV audio instantly. 60W power with DSP equalizers for movies, music, and dialogues, plus HDMI ARC, Optical, and Bluetooth 5.0.",
    "features": [
      "60W Output with Integrated Dual Bass Reflex Tubes",
      "3 Preset DSP Audio Modes (Movie, Music, News)",
      "Multiple Inputs: HDMI ARC, Optical, AUX & Bluetooth",
      "Includes Wireless Remote Control & Wall Mount Kit"
    ],
    "initial_stock": 50
  },
  {
    "id": "elec-24",
    "name": "65W GaN Compact Triple-Port Fast Wall Charger",
    "slug": "65w-gan-compact-triple-port-fast-wall-charger",
    "category": "electronics",
    "category_name": "Electronics",
    "price_cents": 179900,
    "was_price_cents": 279900,
    "discount_label": "-36%",
    "rating": 4.9,
    "reviews_count": 1560,
    "tag": "Bestseller",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3364_ELECTR_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Gallium Nitride (GaN) technology packs 65W charging into an ultra-compact body. Powers MacBook Pro, iPad, and iPhone simultaneously without overheating.",
    "features": [
      "Next-Gen GaN III Semiconductor Technology",
      "Powers Laptops, Tablets, and Smartphones Simultaneously",
      "45% Smaller than standard OEM 65W brick chargers",
      "Foldable Pins with Global 100-240V Voltage Support"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-1",
    "name": "Minimalist Stainless Steel Mesh Chronograph Watch",
    "slug": "minimalist-stainless-steel-mesh-chronograph-watch",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 499900,
    "was_price_cents": 849900,
    "discount_label": "-41%",
    "rating": 4.7,
    "reviews_count": 740,
    "tag": "Save 41%",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2290_CLOTHI_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Crafted with surgical-grade 316L stainless steel, scratch-resistant sapphire-coated glass, and precise Japanese quartz movement.",
    "features": [
      "Japanese Quartz 3-Hand Movement with Date",
      "Scratch-resistant Sapphire Crystal Glass",
      "Quick-release Milanese Mesh Strap",
      "30-Meter Water Resistance"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-2",
    "name": "Heavyweight Unisex Streetwear Combed Cotton Hoodie",
    "slug": "heavyweight-unisex-streetwear-combed-cotton-hoodie",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 289900,
    "was_price_cents": 419900,
    "discount_label": "-30%",
    "rating": 4.4,
    "reviews_count": 512,
    "tag": "Popular",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2301_CLOTHI_train.jpeg",
    "badge_class": "badge-hot",
    "description": "450 GSM ultra-dense french terry cotton hoodie featuring double-stitched seams, drop shoulders, and a structured oversized silhouette.",
    "features": [
      "100% Combed Heavyweight Ringspun Cotton",
      "Double-needle durable reinforced stitching",
      "Pre-shrunk fabric to prevent shrinking",
      "Kangaroo pocket with hidden phone sleeve"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-3",
    "name": "Polarized Retro Hexagonal Metal Sunglasses",
    "slug": "polarized-retro-hexagonal-metal-sunglasses",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 189900,
    "was_price_cents": 299900,
    "discount_label": "-37%",
    "rating": 4.8,
    "reviews_count": 980,
    "tag": "Bestseller",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2309_CLOTHI_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Timeless hexagonal frames equipped with HD polarized UV400 lenses that eliminate glare while providing true-to-life color clarity.",
    "features": [
      "UV400 Category 3 Glare-Blocking Polarization",
      "Corrosion-resistant lightweight metal alloy",
      "Soft adjustable silicone nose pads",
      "Includes hard case and micro-fiber cloth"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-4",
    "name": "18K Gold Plated Handcrafted Layered Pendant Set",
    "slug": "18k-gold-plated-handcrafted-layered-pendant-set",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 229900,
    "was_price_cents": 349900,
    "discount_label": "-33%",
    "rating": 4.9,
    "reviews_count": 430,
    "tag": "Trending",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2310_CLOTHI_train.jpeg",
    "badge_class": "badge-new",
    "description": "Elevate your everyday aesthetic with this radiant hypoallergenic 18k gold-plated multi-layer necklace set with waterproof anti-tarnish coating.",
    "features": [
      "Genuine 18K Yellow Gold Electroplating",
      "Nickel-free, Lead-free, Hypoallergenic",
      "Protective Anti-Tarnish Lifetime Shield",
      "Adjustable 2-inch extender chain"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-5",
    "name": "Genuine Top-Grain Leather Bi-Fold RFID Wallet",
    "slug": "genuine-top-grain-leather-bi-fold-rfid-wallet",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 149900,
    "was_price_cents": 249900,
    "discount_label": "-40%",
    "rating": 4.8,
    "reviews_count": 1120,
    "tag": "Save 40%",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2291_CLOTHI_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Handcrafted from supple full-grain leather that patinas beautifully with time. Integrated with RFID-blocking mesh to protect cards from electronic theft.",
    "features": [
      "Certified RFID Blocking Mesh Layer",
      "8 Card Slots + 2 Hidden Currency Pockets",
      "Clear Thumb-Slide ID Window",
      "Slim 0.4-inch Pocket Friendly Profile"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-6",
    "name": "Classic Waterproof Military Field Canvas Watch",
    "slug": "classic-waterproof-military-field-canvas-watch",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 329900,
    "was_price_cents": 499900,
    "discount_label": "-34%",
    "rating": 4.6,
    "reviews_count": 620,
    "tag": "Top Pick",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2292_CLOTHI_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Rugged military design with high-contrast luminescent dial markers, durable olive nylon webbing strap, and 50-meter water resistance.",
    "features": [
      "Glow-in-the-Dark Luminescent Hands & Numerals",
      "Scratch-Proof Mineral Hardlex Glass",
      "Heavy-Duty Ballistic Nylon NATO Strap",
      "50m Water Resistant for Swimming & Showers"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-7",
    "name": "Pure Mulberry Silk Reversible Printed Scarf",
    "slug": "pure-mulberry-silk-reversible-printed-scarf",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 199900,
    "was_price_cents": 329900,
    "discount_label": "-39%",
    "rating": 4.9,
    "reviews_count": 340,
    "tag": "Luxury",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2293_CLOTHI_train.jpeg",
    "badge_class": "badge-new",
    "description": "Woven with 100% grade 6A mulberry silk featuring artisanal botanical illustrations, hand-rolled edges, and a featherlight breathable drape.",
    "features": [
      "100% Pure 19-Momme Grade 6A Mulberry Silk",
      "Hand-Rolled & Stitched Finished Edges",
      "Vibrant Natural Vegetable Dye Printing",
      "Breathable, Hypoallergenic Skin-Soft Touch"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-8",
    "name": "Urban Commuter Water-Resistant Laptop Backpack",
    "slug": "urban-commuter-water-resistant-laptop-backpack",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 279900,
    "was_price_cents": 449900,
    "discount_label": "-37%",
    "rating": 4.7,
    "reviews_count": 890,
    "tag": "Bestseller",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2294_CLOTHI_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Modern streamlined aesthetic with padded 15.6-inch laptop compartment, hidden anti-theft back pocket, and waterproof coated Cordura fabric.",
    "features": [
      "Dedicated Shockproof 15.6\" Laptop & Tablet Sleeves",
      "Waterproof Coated Tear-Resistant Cordura Fabric",
      "Luggage Trolley Pass-Through Strap",
      "Breathable Padded Honeycomb Airflow Back System"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-9",
    "name": "Premium Linen Breathable Casual Button-Down Shirt",
    "slug": "premium-linen-breathable-casual-button-down-shirt",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 189900,
    "was_price_cents": 289900,
    "discount_label": "-34%",
    "rating": 4.5,
    "reviews_count": 580,
    "tag": "Summer Pick",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2295_CLOTHI_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Crafted from pure European flax linen that softens with every wash. Natural moisture-wicking weave keeps you cool and elegant in warm weather.",
    "features": [
      "100% Pure European Flax Woven Linen",
      "Relaxed Tailored Fit with Curved Hem",
      "Mother-of-Pearl Finished Durable Buttons",
      "Natural Moisture-Wicking & Heat-Regulating"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-10",
    "name": "Handcrafted Full-Grain Leather Dress Belt with Brass Buckle",
    "slug": "handcrafted-full-grain-leather-dress-belt-with-brass-buckle",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 129900,
    "was_price_cents": 199900,
    "discount_label": "-35%",
    "rating": 4.8,
    "reviews_count": 710,
    "tag": "Classic",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2296_CLOTHI_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Single-piece 3.5mm thick full-grain vegetable-tanned leather belt finished with burnished beveled edges and solid antique brushed brass hardware.",
    "features": [
      "100% Solid Single-Piece Full-Grain Leather",
      "Solid Forged Antique Brushed Brass Buckle",
      "Double Beveled Burnished Edge Finishing",
      "Customizable Screw-Back Size Trimming"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-11",
    "name": "Vintage Aviator Polarized Sunglasses with Case",
    "slug": "vintage-aviator-polarized-sunglasses-with-case",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 169900,
    "was_price_cents": 269900,
    "discount_label": "-37%",
    "rating": 4.7,
    "reviews_count": 850,
    "tag": "Hot Pick",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2297_CLOTHI_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Iconic teardrop aviator silhouette engineered with lightweight titanium-alloy brow bar and polarized lenses for ultimate road clarity.",
    "features": [
      "Category 3 UV400 HD Polarized Glare Filter",
      "Featherweight Titanium-Alloy Metal Construction",
      "Spring-Loaded Temples for Universal Face Fit",
      "Includes Leatherette Protective Case & Wiping Cloth"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-12",
    "name": "Knit Merino Wool Lightweight Thermal Sweater",
    "slug": "knit-merino-wool-lightweight-thermal-sweater",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 349900,
    "was_price_cents": 529900,
    "discount_label": "-34%",
    "rating": 4.8,
    "reviews_count": 410,
    "tag": "Winter Warmth",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2298_CLOTHI_train.jpeg",
    "badge_class": "badge-new",
    "description": "Ultra-fine 19.5-micron Australian merino wool provides supreme thermal regulation without itchiness. Ribbed cuffs and hem retain tailored shape.",
    "features": [
      "100% Ultra-Fine Australian Merino Wool",
      "Natural Odor-Resistant & Temperature Regulating",
      "Ribbed Collar, Hem, and Cuffs for Shape Retention",
      "Soft Next-to-Skin Handfeel: Zero Itchiness"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-13",
    "name": "Sterling Silver Zirconia Halo Solitaire Stud Earrings",
    "slug": "sterling-silver-zirconia-halo-solitaire-stud-earrings",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 179900,
    "was_price_cents": 299900,
    "discount_label": "-40%",
    "rating": 4.9,
    "reviews_count": 640,
    "tag": "Save 40%",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2299_CLOTHI_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Brilliant 5A grade cubic zirconia solitaire surrounded by a delicate micro-pavé halo, set in 925 sterling silver with rhodium anti-tarnish plating.",
    "features": [
      "925 Solid Sterling Silver with Rhodium Coating",
      "5A Hearts & Arrows Cut Lab Cubic Zirconia",
      "Hypoallergenic Double-Notched Secure Posts",
      "Arrives in Velvet Jewelry Presentation Box"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-14",
    "name": "Casual Canvas Lace-Up Everyday Low-Top Sneakers",
    "slug": "casual-canvas-lace-up-everyday-low-top-sneakers",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 249900,
    "was_price_cents": 389900,
    "discount_label": "-36%",
    "rating": 4.6,
    "reviews_count": 920,
    "tag": "Streetwear",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2300_CLOTHI_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Classic skate-inspired low-tops built with 12oz breathable canvas, vulcanized natural rubber waffle outsoles, and removable memory foam insoles.",
    "features": [
      "12oz Heavyweight Breathable Washed Canvas",
      "Vulcanized High-Grip Natural Rubber Outsole",
      "Memory Foam Ortho Cushion Comfort Insole",
      "Reinforced Metal Eyelets with Extra Flat Laces"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-15",
    "name": "Water-Repellent Lightweight Packable Windbreaker Jacket",
    "slug": "water-repellent-lightweight-packable-windbreaker-jacket",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 299900,
    "was_price_cents": 459900,
    "discount_label": "-35%",
    "rating": 4.5,
    "reviews_count": 480,
    "tag": "All-Weather",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2302_CLOTHI_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Packs into its own internal pocket. Features DWR coating for light drizzle, adjustable bungee hood, zippered hand pockets, and breathable back vent.",
    "features": [
      "Durable Water Repellent (DWR) Ripstop Shell",
      "Packs into Internal Chest Zippered Pocket",
      "Back Yoke Ventilation for Enhanced Breathability",
      "Elasticized Cuffs and Bungee Cinch Drawstring Hem"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-16",
    "name": "Rose Gold Plated Cuff Bracelet with Pavé Crystals",
    "slug": "rose-gold-plated-cuff-bracelet-with-pav-crystals",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 159900,
    "was_price_cents": 249900,
    "discount_label": "-36%",
    "rating": 4.8,
    "reviews_count": 530,
    "tag": "Trending",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2303_CLOTHI_train.jpeg",
    "badge_class": "badge-new",
    "description": "Radiant rose gold plating adorned with handset Austrian pavé crystals. Flexible hinge mechanism ensures comfortable fit on all wrist sizes.",
    "features": [
      "18K Rose Gold Triple Ion-Plated Finish",
      "Handset Austrian Shimmering Pavé Crystals",
      "Concealed Seamless Push-Lock Spring Clasp",
      "Hypoallergenic, Lead-Free & Nickel-Free"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-17",
    "name": "Structured Canvas & Vegan Leather Weekender Duffle Bag",
    "slug": "structured-canvas-vegan-leather-weekender-duffle-bag",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 379900,
    "was_price_cents": 599900,
    "discount_label": "-37%",
    "rating": 4.7,
    "reviews_count": 390,
    "tag": "Travel Pick",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2304_CLOTHI_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Spacious 45L duffle with separate ventilated shoe compartment, padded detachable shoulder strap, and brass rivets for stylish weekend getaways.",
    "features": [
      "45L Capacity Meets Airline Carry-On Standards",
      "Dedicated Side Ventilated Shoe & Laundry Tunnel",
      "Waterproof Lined Wet Pocket for Toiletries",
      "Padded Detachable Ergonomic Shoulder Strap"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-18",
    "name": "Tailored Slim-Fit Stretch Chino Trousers",
    "slug": "tailored-slim-fit-stretch-chino-trousers",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 199900,
    "was_price_cents": 319900,
    "discount_label": "-37%",
    "rating": 4.6,
    "reviews_count": 670,
    "tag": "Office Essential",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2305_CLOTHI_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Versatile chinos blending 98% soft twill cotton with 2% elastane for complete freedom of movement from boardroom meetings to casual evenings.",
    "features": [
      "98% Fine Twill Cotton + 2% Spandex Stretch",
      "Comfort-Stretch Waistband with Internal Stay-Tuck Grip",
      "Wrinkle-Resistant Easy Iron Finishing",
      "Deep Slanted Front Pockets & Buttoned Back Welts"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-19",
    "name": "Hand-Woven Fedora Sun Hat with Leather Trim",
    "slug": "hand-woven-fedora-sun-hat-with-leather-trim",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 119900,
    "was_price_cents": 189900,
    "discount_label": "-37%",
    "rating": 4.4,
    "reviews_count": 310,
    "tag": "Resort Wear",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2306_CLOTHI_train.jpeg",
    "badge_class": "badge-new",
    "description": "100% natural paper straw handwoven with UPF 50+ sun protection. Accented with a sleek vegan leather band and moisture-wicking inner sweatband.",
    "features": [
      "UPF 50+ Certified Broad-Spectrum Sun Shielding",
      "Hand-Woven Natural Breathable Straw Fiber",
      "Adjustable Internal Drawstring for Perfect Fit",
      "Foldable Design Retains Shape After Packing"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-20",
    "name": "Automatic Self-Winding Skeleton Leather Dial Watch",
    "slug": "automatic-self-winding-skeleton-leather-dial-watch",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 699900,
    "was_price_cents": 1099900,
    "discount_label": "-36%",
    "rating": 4.8,
    "reviews_count": 480,
    "tag": "Collector Choice",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2307_CLOTHI_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Watch the intricate mechanical gears tick through open-heart dual exhibition crystals. No battery needed—powers automatically by the natural motion of your wrist.",
    "features": [
      "21-Jewel Automatic Mechanical Self-Winding Movement",
      "Exhibition Sapphire Glass Caseback",
      "Genuine Italian Alligator Embossed Leather Strap",
      "50m Water Resistant Stainless Steel Casing"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-21",
    "name": "Bohemian Beaded Multi-Layer Anklet & Bracelet Set",
    "slug": "bohemian-beaded-multi-layer-anklet-bracelet-set",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 89900,
    "was_price_cents": 149900,
    "discount_label": "-40%",
    "rating": 4.7,
    "reviews_count": 290,
    "tag": "Trending",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2308_CLOTHI_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Handcrafted artisan beach jewelry set with turquoise beads, cowrie shells, and waterproof braided wax cords. Wear stacked together or individually.",
    "features": [
      "Artisanal Natural Turquoise & Glass Beads",
      "100% Waterproof Wax-Coated Durable Cord",
      "Adjustable Slip-Knot Sliding Closure",
      "Versatile: Can Be Worn as Anklets or Bracelets"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-22",
    "name": "Premium Washed Denim Trucker Jacket",
    "slug": "premium-washed-denim-trucker-jacket",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 329900,
    "was_price_cents": 499900,
    "discount_label": "-34%",
    "rating": 4.6,
    "reviews_count": 730,
    "tag": "Wardrobe Staple",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2311_CLOTHI_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Vintage stone-washed 13.5oz denim jacket with classic copper shank buttons, dual flap chest pockets, and adjustable waist side tabs.",
    "features": [
      "13.5oz 100% Heavyweight Rigid Cotton Denim",
      "Authentic Vintage Stone-Washed Treatment",
      "Sturdy Metal Shank Buttons & Double Needle Seams",
      "Two Chest Flap Pockets + Two Internal Concealed Pockets"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-23",
    "name": "Crossbody Sling Bag with Anti-Theft Lock",
    "slug": "crossbody-sling-bag-with-anti-theft-lock",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 179900,
    "was_price_cents": 279900,
    "discount_label": "-36%",
    "rating": 4.7,
    "reviews_count": 580,
    "tag": "Commuter Pick",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2312_CLOTHI_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Compact chest sling equipped with TSA-approved 3-digit combination lock, external USB charging port, and high-density waterproof Oxford fabric.",
    "features": [
      "Integrated TSA 3-Digit Combination Security Lock",
      "External USB Charging Pass-Through Port",
      "Waterproof & Scratch-Resistant High-Density Oxford Cloth",
      "Reversible Padded Shoulder Strap for Left/Right Wear"
    ],
    "initial_stock": 50
  },
  {
    "id": "fash-24",
    "name": "Luxury Italian Cashmere Blend Winter Muffler",
    "slug": "luxury-italian-cashmere-blend-winter-muffler",
    "category": "fashion",
    "category_name": "Fashion & Style",
    "price_cents": 219900,
    "was_price_cents": 349900,
    "discount_label": "-37%",
    "rating": 4.9,
    "reviews_count": 410,
    "tag": "Gift Idea",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/CLOTHING_ACCESSORIES_JEWELLERY/2313_CLOTHI_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Decadently soft brushed cashmere and merino wool blend with traditional fringed ends. Keeps chill out while complementing formal and casual overcoats.",
    "features": [
      "70% Fine Merino Wool + 30% Mongolian Cashmere",
      "Hand-Twisted Fringed Edges",
      "Generous 180cm x 30cm Dimensions for Versatile Knotting",
      "Featherlight Weight with Superior Thermal Insulation"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-1",
    "name": "Hyaluronic Acid Multi-Molecular Hydration Serum 50ml",
    "slug": "hyaluronic-acid-multi-molecular-hydration-serum-50ml",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 129900,
    "was_price_cents": 199900,
    "discount_label": "-35%",
    "rating": 4.9,
    "reviews_count": 1850,
    "tag": "Award Winner",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1088_BEAUTY_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Formulated with 5 molecular weights of hyaluronic acid and provitamin B5 to penetrate deep dermal layers for instant plumpness and lasting barrier repair.",
    "features": [
      "5-Layer Deep Moisture Cellular Delivery",
      "Infused with soothing Provitamin B5 & Ceramides",
      "Fragrance-free, Oil-free, Non-comedogenic",
      "100% Vegan & Leaping Bunny Certified"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-2",
    "name": "Sonic Rechargeable Toothbrush with 8 Replacement Heads",
    "slug": "sonic-rechargeable-toothbrush-with-8-replacement-heads",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 249900,
    "was_price_cents": 389900,
    "discount_label": "-36%",
    "rating": 4.8,
    "reviews_count": 870,
    "tag": "Top Rated",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1095_BEAUTY_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Delivers 40,000 micro-vibrations per minute to remove 10x more plaque than manual brushing. Includes 8 Dupont brush heads and hard travel case.",
    "features": [
      "40,000 VPM Maglev Ultrasonic Motor",
      "5 Brushing Modes (Clean, White, Polish, Gum, Sensitive)",
      "Smart 2-Minute Timer with 30s Quad-Pacer",
      "60 Days of Use on a Single 4-Hour Charge"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-3",
    "name": "Ultrasonic Ceramic Essential Oil Aroma Diffuser 500ml",
    "slug": "ultrasonic-ceramic-essential-oil-aroma-diffuser-500ml",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 169900,
    "was_price_cents": 269900,
    "discount_label": "-37%",
    "rating": 4.7,
    "reviews_count": 640,
    "tag": "Eco Friendly",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1098_BEAUTY_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Whisper-quiet cold ultrasonic mist diffusion with ambient soothing 7-color LED lights and auto-shutoff when water level is depleted.",
    "features": [
      "500ml Large Capacity (up to 16 hours continuous mist)",
      "BPA-Free Eco Material & Whisper Quiet <20dB",
      "7 Ambient Color Breathing Light Modes",
      "Auto Waterless Shut-Off Safety System"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-4",
    "name": "20% Vitamin C + E Ferulic Acid Glow Brightening Serum 30ml",
    "slug": "20-vitamin-c-e-ferulic-acid-glow-brightening-serum-30ml",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 149900,
    "was_price_cents": 229900,
    "discount_label": "-35%",
    "rating": 4.8,
    "reviews_count": 1420,
    "tag": "Bestseller",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1089_BEAUTY_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Potent antioxidant powerhouse serum that fades dark spots, evens stubborn skin tone, and shields against free radicals for glowing complexion.",
    "features": [
      "Pure L-Ascorbic Acid 20% Stabilized with Vitamin E",
      "Ferulic Acid Boosts Photoprotective Efficacy",
      "Noticeably Fades Hyperpigmentation and Acne Marks",
      "Packaged in UV-Blocking Amber Glass Dropper"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-5",
    "name": "Retinol 0.5% Night Renewal Treatment with Squalane",
    "slug": "retinol-0-5-night-renewal-treatment-with-squalane",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 169900,
    "was_price_cents": 259900,
    "discount_label": "-35%",
    "rating": 4.7,
    "reviews_count": 930,
    "tag": "Derm Approved",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1090_BEAUTY_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Encapsulated gentle retinol formula suspended in organic plant squalane to accelerate cell turnover and smooth fine lines without irritation.",
    "features": [
      "0.5% Encapsulated Pure Retinol for Zero Irritation",
      "Infused with 100% Plant-Derived Squalane Base",
      "Visibly Diminishes Fine Lines and Pores",
      "Cruelty-Free, Paraben-Free, Fragrance-Free"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-6",
    "name": "Deep Cleansing Silicone Sonic Facial Brush Device",
    "slug": "deep-cleansing-silicone-sonic-facial-brush-device",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 189900,
    "was_price_cents": 299900,
    "discount_label": "-37%",
    "rating": 4.8,
    "reviews_count": 1140,
    "tag": "Trending",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1091_BEAUTY_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Hygienic medical-grade silicone bristles with 8000 acoustic pulsations per minute eliminate 99.5% of dirt, oil, and makeup residue.",
    "features": [
      "Ultra-Hygienic Bacteria-Resistant Food Silicone",
      "8 Adjustable Sonic Pulsation Intensity Levels",
      "IPX7 100% Waterproof for Shower Use",
      "Inductive USB Fast-Charging with 180-Day Standby"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-7",
    "name": "SPF 50+ PA++++ Ultra-Light Invisible Sunscreen Gel 80ml",
    "slug": "spf-50-pa-ultra-light-invisible-sunscreen-gel-80ml",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 89900,
    "was_price_cents": 139900,
    "discount_label": "-36%",
    "rating": 4.9,
    "reviews_count": 2100,
    "tag": "Viral Favorite",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1092_BEAUTY_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Zero white cast, non-greasy watery sun gel providing broad spectrum UVA/UVB protection with soothing centella asiatica and green tea.",
    "features": [
      "Highest Rated PA++++ Broad Spectrum Shield",
      "Zero White Cast: Absorbs in under 10 seconds",
      "Formulated with Soothing Centella & Green Tea",
      "Sweat and Water-Resistant for up to 80 minutes"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-8",
    "name": "100% Pure Organic Cold-Pressed Moroccan Argan Hair Oil",
    "slug": "100-pure-organic-cold-pressed-moroccan-argan-hair-oil",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 119900,
    "was_price_cents": 179900,
    "discount_label": "-33%",
    "rating": 4.8,
    "reviews_count": 820,
    "tag": "Natural",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1093_BEAUTY_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Rich in essential fatty acids and vitamin E to tame frizz, restore split ends, and add mirror-like shine without weighing down strands.",
    "features": [
      "100% Cold-Pressed Extra Virgin Argan Kernel Oil",
      "Tames Unruly Frizz & Heat Protects up to 230°C",
      "Lightweight Fast-Absorbing Non-Greasy Finish",
      "USDA Organic & ECOCERT Certified"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-9",
    "name": "Natural Rose Quartz Roller & Gua Sha Sculpting Set",
    "slug": "natural-rose-quartz-roller-gua-sha-sculpting-set",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 99900,
    "was_price_cents": 159900,
    "discount_label": "-37%",
    "rating": 4.7,
    "reviews_count": 750,
    "tag": "Spa at Home",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1094_BEAUTY_train.jpeg",
    "badge_class": "badge-new",
    "description": "Handcrafted from 100% authentic Brazilian rose quartz stone. De-puffs facial contours, drains lymphatic fluid, and improves skincare absorption.",
    "features": [
      "100% Genuine Certified Brazilian Rose Quartz Stone",
      "Reinforced Integrated Squeak-Free Brass Bracket",
      "Gua Sha Scraper Contours Jawline and Cheekbones",
      "Comes in Silk Storage Pouch with Illustrated Guide"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-10",
    "name": "Professional Ionic Hair Dryer with Magnetic Nozzles",
    "slug": "professional-ionic-hair-dryer-with-magnetic-nozzles",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 399900,
    "was_price_cents": 599900,
    "discount_label": "-33%",
    "rating": 4.8,
    "reviews_count": 680,
    "tag": "Salon Grade",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1096_BEAUTY_train.jpeg",
    "badge_class": "badge-hot",
    "description": "110,000 RPM brushless motor dries hair in half the time. Generates 200 million negative ions to lock in moisture and banish static frizz.",
    "features": [
      "110,000 RPM Ultra-Fast Brushless Digital Motor",
      "200 Million Negative Ions for High Shine Polish",
      "Smart Thermal Sensor Prevents Heat Damage",
      "360° Magnetic Rotatable Styling Concentrator & Diffuser"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-11",
    "name": "Ceramide Barrier Repair Hydrating Face Moisturizer 100g",
    "slug": "ceramide-barrier-repair-hydrating-face-moisturizer-100g",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 109900,
    "was_price_cents": 169900,
    "discount_label": "-35%",
    "rating": 4.9,
    "reviews_count": 1310,
    "tag": "Derm Favorite",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1097_BEAUTY_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Triple-ceramide complex reinforced with cholesterol and fatty acids mimics natural skin lipid barrier to lock in 48-hour moisture.",
    "features": [
      "Essential Ceramides 1, 3, 6-II + Natural Lipids",
      "Time-Release MVE Emulsion Technology",
      "Non-Comedogenic: Safe for Sensitive & Acne-Prone Skin",
      "Free from Artificial Fragrance, Dyes, and Parabens"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-12",
    "name": "Organic Green Tea & Salicylic Acid Clarifying Clay Mask",
    "slug": "organic-green-tea-salicylic-acid-clarifying-clay-mask",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 89900,
    "was_price_cents": 139900,
    "discount_label": "-36%",
    "rating": 4.6,
    "reviews_count": 590,
    "tag": "Clear Skin",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1099_BEAUTY_train.jpeg",
    "badge_class": "badge-deal",
    "description": "French Kaolin clay combined with 2% BHA salicylic acid draws out blackheads, unclogs congestion, and controls excess T-zone oiliness.",
    "features": [
      "French White Kaolin Clay + 2% Salicylic Acid",
      "Infused with Antioxidant Organic Matcha Green Tea",
      "Tightens Enlarged Pores without Drying Out Skin",
      "Includes Soft Silicone Mask Applicator Brush"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-13",
    "name": "Waterproof Matte Liquid Lipstick Longwear Collection (Pack of 4)",
    "slug": "waterproof-matte-liquid-lipstick-longwear-collection-pack-of-4",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 139900,
    "was_price_cents": 219900,
    "discount_label": "-36%",
    "rating": 4.7,
    "reviews_count": 880,
    "tag": "Top Deal",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1100_BEAUTY_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Velvety smudge-proof matte lip pigments infused with nourishing jojoba oil and vitamin E for comfortable 16-hour transfer-resistant wear.",
    "features": [
      "16-Hour Transfer-Proof & Waterproof Formula",
      "Comfortable Non-Drying Matte Finish with Jojoba Oil",
      "4 Flattering Everyday Nude & Berry Shades",
      "Precision Teardrop Wand for Flawless Application"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-14",
    "name": "Biotin & Collagen Thickening Scalp Treatment Shampoo 300ml",
    "slug": "biotin-collagen-thickening-scalp-treatment-shampoo-300ml",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 99900,
    "was_price_cents": 149900,
    "discount_label": "-33%",
    "rating": 4.6,
    "reviews_count": 710,
    "tag": "Hair Growth",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1101_BEAUTY_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Fortified with pure biotin, hydrolyzed collagen, and rosemary extract to stimulate follicles, reduce hair fall, and add fuller volume.",
    "features": [
      "Infused with Biotin, Hydrolyzed Collagen & Saw Palmetto",
      "Rosemary & Peppermint Essential Oils Invigorate Scalp",
      "100% Sulfate-Free, Paraben-Free, Color-Safe",
      "Visibly Plumps Fine and Thinning Strands"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-15",
    "name": "Cordless Rechargeable Water Dental Flosser",
    "slug": "cordless-rechargeable-water-dental-flosser",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 219900,
    "was_price_cents": 349900,
    "discount_label": "-37%",
    "rating": 4.8,
    "reviews_count": 940,
    "tag": "Dentist Pick",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1102_BEAUTY_train.jpeg",
    "badge_class": "badge-hot",
    "description": "300ml water tank with 1800 water jet pulses per minute removes food debris and 99.9% of plaque between teeth and along gumlines.",
    "features": [
      "1800 High-Pressure Water Pulses per Minute",
      "4 Clean Modes: Normal, Soft, Pulse, and DIY Custom",
      "300ml Detachable Easy-Fill Water Reservoir",
      "USB Rechargeable with 30-Day Long Battery Life"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-16",
    "name": "Dead Sea Mud & Himalayan Pink Salt Exfoliating Scrub 250g",
    "slug": "dead-sea-mud-himalayan-pink-salt-exfoliating-scrub-250g",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 79900,
    "was_price_cents": 129900,
    "discount_label": "-38%",
    "rating": 4.7,
    "reviews_count": 510,
    "tag": "Body Care",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1103_BEAUTY_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Mineral-rich Dead Sea mud infused with fine Himalayan pink crystals and sweet almond oil gently buffs away rough dead skin cells.",
    "features": [
      "Authentic Dead Sea Mineral Mud + Himalayan Salt Crystals",
      "Enriched with Cold-Pressed Sweet Almond & Jojoba Oils",
      "Improves Skin Elasticity & Fights Strawberry Legs",
      "100% Natural, Chemical-Free, Biodegradable Formula"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-17",
    "name": "Niacinamide 10% + Zinc 1% Pore Minimizing Serum 60ml",
    "slug": "niacinamide-10-zinc-1-pore-minimizing-serum-60ml",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 119900,
    "was_price_cents": 179900,
    "discount_label": "-33%",
    "rating": 4.8,
    "reviews_count": 1620,
    "tag": "Bestseller",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1104_BEAUTY_train.jpeg",
    "badge_class": "badge-hot",
    "description": "High-strength vitamin and mineral blemish formula that balances sebum activity, tightens enlarged pores, and calms redness.",
    "features": [
      "10% Pure Pharmaceutical-Grade Niacinamide",
      "1% Zinc PCA Controls Excess Sebum Production",
      "Fades Red Post-Acne Marks and Smoothes Texture",
      "Lightweight Water-Based Fast Absorption"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-18",
    "name": "Peptide Complex Advanced Under-Eye Dark Circle Cream",
    "slug": "peptide-complex-advanced-under-eye-dark-circle-cream",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 129900,
    "was_price_cents": 199900,
    "discount_label": "-35%",
    "rating": 4.6,
    "reviews_count": 640,
    "tag": "Anti-Aging",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1105_BEAUTY_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Matrixyl 3000 peptides and caffeine awaken tired under-eyes, reduce puffiness in 15 minutes, and diminish dark shadow circles.",
    "features": [
      "Matrixyl 3000 + Argireline Peptide Complex",
      "5% Green Coffee Bean Caffeine De-Puffs Bags",
      "Cooling Metal Ceramic Rollerball Applicator",
      "Ophthalmologist-Tested for Contact Lens Wearers"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-19",
    "name": "Aromatherapy Lavender & Chamomile Deep Sleep Pillow Mist 100ml",
    "slug": "aromatherapy-lavender-chamomile-deep-sleep-pillow-mist-100ml",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 69900,
    "was_price_cents": 109900,
    "discount_label": "-36%",
    "rating": 4.8,
    "reviews_count": 430,
    "tag": "Relaxation",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1106_BEAUTY_train.jpeg",
    "badge_class": "badge-new",
    "description": "French lavender, Roman chamomile, and vetiver essential oils promote serene relaxation and rapid sleep onset when misted on pillows.",
    "features": [
      "100% Pure Therapeutic-Grade French Lavender Oil",
      "Naturally Reduces Cortisol & Promotes REM Sleep",
      "Non-Staining Gentle Botanical Water Mist",
      "Alcohol-Free, Vegan, Safe for Sensitive Skin"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-20",
    "name": "Titanium Plate Keratin Care Hair Straightener with Digital Display",
    "slug": "titanium-plate-keratin-care-hair-straightener-with-digital-display",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 279900,
    "was_price_cents": 429900,
    "discount_label": "-35%",
    "rating": 4.7,
    "reviews_count": 890,
    "tag": "Styling",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1107_BEAUTY_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Floating mirror-titanium plates infused with argan oil heat up in 15 seconds. Glide smoothly without snagging for glossy glass hair finish.",
    "features": [
      "1.25\" Floating Mirror Titanium Ultra-Smooth Plates",
      "Rapid 15-Second MCH Ceramic Heating up to 230°C",
      "Digital LCD Screen with 10 Precise Temperature Settings",
      "360° Swivel Tangle-Free 2.5m Salon Length Cord"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-21",
    "name": "100% Pure Organic Shea & Cocoa Ultra-Rich Body Butter 200g",
    "slug": "100-pure-organic-shea-cocoa-ultra-rich-body-butter-200g",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 89900,
    "was_price_cents": 139900,
    "discount_label": "-36%",
    "rating": 4.9,
    "reviews_count": 780,
    "tag": "Ultra Hydration",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1108_BEAUTY_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Whipped raw African shea and cocoa butters melt upon contact with skin to deeply heal dry elbows, knees, heels, and stretch marks.",
    "features": [
      "Raw Unrefined Grade-A African Shea Butter",
      "Cold-Pressed Cocoa Butter & Vitamin E Oil",
      "Subtle Natural Warm Vanilla Aroma",
      "Deep 72-Hour Intensive Skin Barrier Protection"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-22",
    "name": "Waterproof Microfiber Makeup Brush Professional Set (12-Piece)",
    "slug": "waterproof-microfiber-makeup-brush-professional-set-12-piece",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 149900,
    "was_price_cents": 239900,
    "discount_label": "-37%",
    "rating": 4.7,
    "reviews_count": 920,
    "tag": "Pro Artist",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1109_BEAUTY_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Cruelty-free dense velvety vegan bristles engineered for seamless powder, cream, and liquid blending. Comes in a travel clutch case.",
    "features": [
      "100% Ultra-Soft Shed-Resistant Synthetic Fibers",
      "Weighted Ergonomic Birch Wood Handles with Aluminum Ferrules",
      "Includes Full Face, Eye Shadow, Contour, and Lip Brushes",
      "Waterproof Roll-Up Vegan Leather Travel Holder"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-23",
    "name": "Gentle Oat Milk & Honey Hydrating Gel Cleanser 150ml",
    "slug": "gentle-oat-milk-honey-hydrating-gel-cleanser-150ml",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 79900,
    "was_price_cents": 119900,
    "discount_label": "-33%",
    "rating": 4.8,
    "reviews_count": 1050,
    "tag": "Gentle Daily",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1110_BEAUTY_train.jpeg",
    "badge_class": "badge-new",
    "description": "pH-balanced 5.5 non-stripping jelly cleanser formulated with colloidal oatmeal and manuka honey to wash away impurities while soothing redness.",
    "features": [
      "Skin-Optimal pH 5.5 Delicate Acid Mantle Balance",
      "Colloidal Oatmeal Calms Irritation & Itchiness",
      "Manuka Honey Acts as a Natural Antibacterial Humectant",
      "100% Sulfate-Free Foaming Formula"
    ],
    "initial_stock": 50
  },
  {
    "id": "beauty-24",
    "name": "7-in-1 LED Light Therapy Skin Rejuvenation Face Wand",
    "slug": "7-in-1-led-light-therapy-skin-rejuvenation-face-wand",
    "category": "beauty",
    "category_name": "Beauty & Wellness",
    "price_cents": 349900,
    "was_price_cents": 549900,
    "discount_label": "-36%",
    "rating": 4.7,
    "reviews_count": 410,
    "tag": "Tech Beauty",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1111_BEAUTY_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Combines red light collagen stimulation, blue light acne therapy, microcurrent toning, and therapeutic warmth in a pocket-sized wand.",
    "features": [
      "Red (630nm) & Blue (465nm) Targeted Wavelengths",
      "EMS Microcurrent Facial Muscle Toning Stimulation",
      "38°C Soothing Therapeutic Warmth Increases Circulation",
      "330° Rotating Wand Head for Contouring Cheeks and Neck"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-1",
    "name": "Nordic Handcrafted Matte Ceramic Coffee Mug Set (4-Pack)",
    "slug": "nordic-handcrafted-matte-ceramic-coffee-mug-set-4-pack",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 139900,
    "was_price_cents": 229900,
    "discount_label": "-40%",
    "rating": 4.4,
    "reviews_count": 950,
    "tag": "Deal of the Day",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10000_HOME_K_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Charming artisanal stoneware ceramic mugs with textured speckled glaze and ergonomic comfort-grip handles. Microwave and dishwasher safe.",
    "features": [
      "Lead-free, Non-toxic High-Fired Stoneware",
      "14 oz Generous Volume for Coffee, Tea & Soups",
      "Microwave, Oven & Dishwasher Safe",
      "Set of 4 complementary earthy matte tones"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-2",
    "name": "Pre-Seasoned Cast Iron Skillet with Silicone Handle Grip",
    "slug": "pre-seasoned-cast-iron-skillet-with-silicone-handle-grip",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 219900,
    "was_price_cents": 339900,
    "discount_label": "-35%",
    "rating": 4.8,
    "reviews_count": 1320,
    "tag": "Chef Choice",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10007_HOME_K_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Heavy-duty 10.25-inch cast iron skillet seasoned with 100% natural organic flaxseed oil for unmatched heat distribution and effortless searing.",
    "features": [
      "Pre-seasoned with 100% natural vegetable oil",
      "Compatible with Induction, Gas, Electric & Campfire",
      "Superior heat retention & even edge-to-edge cooking",
      "Includes heat-resistant silicone handle sleeve"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-3",
    "name": "Multi-Tier Sustainable Bamboo Desktop Storage Organizer",
    "slug": "multi-tier-sustainable-bamboo-desktop-storage-organizer",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 149900,
    "was_price_cents": 229900,
    "discount_label": "-33%",
    "rating": 4.5,
    "reviews_count": 410,
    "tag": "Best Seller",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10014_HOME_K_train.jpeg",
    "badge_class": "badge-new",
    "description": "Keep your workspace tidy with this elegant 100% natural solid bamboo organizer featuring dual pullout drawers and adjustable book slots.",
    "features": [
      "100% Premium Natural Sustainable Bamboo",
      "Smooth water-repellent protective clear finish",
      "2 pull-out drawers + 4 modular dividers",
      "Compact footprint maximizes desktop utility"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-4",
    "name": "15-Bar Italian Pump Stainless Steel Espresso Coffee Machine",
    "slug": "15-bar-italian-pump-stainless-steel-espresso-coffee-machine",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 899900,
    "was_price_cents": 1399900,
    "discount_label": "-36%",
    "rating": 4.8,
    "reviews_count": 760,
    "tag": "Top Pick",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10001_HOME_K_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Brew cafe-standard espresso, cappuccinos, and lattes at home with 15-bar Italian pressure pump and high-pressure stainless steam frothing wand.",
    "features": [
      "15-Bar High-Pressure Professional Italian Pump",
      "ThermoBlock Fast Heating: Ready in 45 Seconds",
      "Adjustable Steam Milk Frothing Wand for Latte Art",
      "Removable 1.5L Transparent Water Tank"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-5",
    "name": "4.5L Touchscreen Digital Air Fryer with 8 Presets",
    "slug": "4-5l-touchscreen-digital-air-fryer-with-8-presets",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 479900,
    "was_price_cents": 749900,
    "discount_label": "-36%",
    "rating": 4.7,
    "reviews_count": 1150,
    "tag": "Kitchen Essential",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10002_HOME_K_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Crispy fried food with 85% less oil! Rapid 360-degree hot air convection technology, non-stick dishwasher-safe basket, and one-touch digital screen.",
    "features": [
      "Rapid 360° Air Convection with 1500W Power",
      "8 One-Touch Presets (Fries, Chicken, Fish, Baking)",
      "Non-Stick BPA-Free Dishwasher-Safe Fryer Basket",
      "Smart Auto Shut-Off and Overheat Protection"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-6",
    "name": "Professional 6-Piece High-Carbon Japanese Chef Knife Set",
    "slug": "professional-6-piece-high-carbon-japanese-chef-knife-set",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 349900,
    "was_price_cents": 549900,
    "discount_label": "-36%",
    "rating": 4.9,
    "reviews_count": 680,
    "tag": "Chef Grade",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10003_HOME_K_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Forged from high-carbon German stainless steel with laser-tested razor-sharp 15-degree edge and ergonomic triple-riveted pakkawood handles.",
    "features": [
      "High-Carbon X50Cr15MoV Stainless Steel Blades",
      "Hand-Honed 15-Degree Razor Edge on Both Sides",
      "Full-Tang Construction with Triple Riveted Handles",
      "Includes Magnetic Acacia Wooden Countertop Display Stand"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-7",
    "name": "Non-Stick Granite Cookware Set with Glass Lids (5-Piece)",
    "slug": "non-stick-granite-cookware-set-with-glass-lids-5-piece",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 399900,
    "was_price_cents": 629900,
    "discount_label": "-36%",
    "rating": 4.6,
    "reviews_count": 890,
    "tag": "Bestseller",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10004_HOME_K_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Eco-friendly natural granite non-stick coating allows effortless omelet flipping and oil-free cooking. Compatible with all stovetops including induction.",
    "features": [
      "100% PFOA, Lead, and Cadmium Free Granite Surface",
      "Thick Magnetized Base for Induction & Gas Cooktops",
      "Heat-Resistant Soft-Touch Woodgrain Stay-Cool Handles",
      "Tempered Glass Lids with Steam Release Vents"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-8",
    "name": "400 GSM 100% Egyptian Cotton Ultra-Soft King Bed Sheets",
    "slug": "400-gsm-100-egyptian-cotton-ultra-soft-king-bed-sheets",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 269900,
    "was_price_cents": 419900,
    "discount_label": "-36%",
    "rating": 4.8,
    "reviews_count": 1020,
    "tag": "Luxury Bedding",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10005_HOME_K_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Woven with long-staple Egyptian cotton in a silky sateen weave. Gets softer with every wash while remaining pill-resistant and breathable.",
    "features": [
      "100% Long-Staple Egyptian Combed Cotton",
      "400 Thread Count Silky Smooth Sateen Weave",
      "Deep 16-inch Elasticized Pockets Fit Any Mattress",
      "Includes 1 Flat Sheet, 1 Fitted Sheet, and 2 Pillowcases"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-9",
    "name": "Modern Minimalist Silent Quartz 12-inch Wooden Wall Clock",
    "slug": "modern-minimalist-silent-quartz-12-inch-wooden-wall-clock",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 119900,
    "was_price_cents": 189900,
    "discount_label": "-37%",
    "rating": 4.7,
    "reviews_count": 540,
    "tag": "Home Decor",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10006_HOME_K_train.jpeg",
    "badge_class": "badge-new",
    "description": "Natural solid pine wood dial with laser-etched hour markers and non-ticking sweeping quartz movement for silent, peaceful bedroom ambiance.",
    "features": [
      "Zero-Noise Continuous Sweep Quartz Mechanism",
      "100% Solid Natural Light Pine Wood Dial",
      "Clear Anti-Reflective Glass Front Cover",
      "Easy Hang Keyhole Slot: Operates on 1 AA Battery"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-10",
    "name": "Electric Gooseneck Precision Temperature Pour-Over Kettle 1.0L",
    "slug": "electric-gooseneck-precision-temperature-pour-over-kettle-1-0l",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 329900,
    "was_price_cents": 499900,
    "discount_label": "-34%",
    "rating": 4.8,
    "reviews_count": 430,
    "tag": "Barista Choice",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10008_HOME_K_train.jpeg",
    "badge_class": "badge-deal",
    "description": "S-curved gooseneck spout provides 90-degree laminar water flow for pour-over coffee perfection. Digital dial allows setting temperature to exact degree.",
    "features": [
      "Precision Gooseneck Spout for Steady Water Flow",
      "Digital Dial Temperature Control (40°C - 100°C)",
      "1-Hour Temperature Hold Keep-Warm Mode",
      "100% Food-Grade 304 Stainless Steel Interior"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-11",
    "name": "Smart Robot Vacuum & Mop with LiDAR Mapping & App Control",
    "slug": "smart-robot-vacuum-mop-with-lidar-mapping-app-control",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 1699900,
    "was_price_cents": 2499900,
    "discount_label": "-32%",
    "rating": 4.7,
    "reviews_count": 390,
    "tag": "Smart Home",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10009_HOME_K_train.jpeg",
    "badge_class": "badge-hot",
    "description": "3000Pa suction power with smart 360-degree LiDAR navigation. Vacuums dust, mops hard floors with auto-water metering, and self-docks to charge.",
    "features": [
      "3000Pa Extreme Cyclone Suction Motor",
      "Laser LiDAR Smart Multi-Floor Mapping & No-Go Zones",
      "2-in-1 Simultaneous Sweeping and Wet Mopping",
      "150-Minute Battery Runtime with Auto-Recharge"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-12",
    "name": "Ergonomic Breathable Mesh High-Back Executive Office Chair",
    "slug": "ergonomic-breathable-mesh-high-back-executive-office-chair",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 749900,
    "was_price_cents": 1199900,
    "discount_label": "-37%",
    "rating": 4.6,
    "reviews_count": 810,
    "tag": "WFH Choice",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10010_HOME_K_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Dynamic 3D lumbar support naturally hugs your spine. Equipped with 3D adjustable armrests, breathable high-tensile mesh, and 135-degree recline.",
    "features": [
      "Adaptive Dynamic 3D Lumbar Spine Support",
      "Heavy-Duty Class 4 Explosion-Proof Gas Cylinder",
      "Multi-Angle Recline Lock (90° - 135°)",
      "Breathable High-Elastic Mesh Back Prevents Sweating"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-13",
    "name": "Borosilicate Glass Airtight Food Storage Containers (Set of 6)",
    "slug": "borosilicate-glass-airtight-food-storage-containers-set-of-6",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 189900,
    "was_price_cents": 289900,
    "discount_label": "-34%",
    "rating": 4.8,
    "reviews_count": 920,
    "tag": "Meal Prep",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10011_HOME_K_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Oven-safe thermal shock resistant glass containers with leakproof snap-locking silicone lids. Ideal for freezer meal prep, baking, and microwaving.",
    "features": [
      "Thermal Shock Proof Borosilicate Glass up to 400°C",
      "100% Airtight & Leak-Proof 4-Hinge Silicone Lids",
      "Oven, Microwave, Dishwasher, and Freezer Safe",
      "Nestable Stackable Modular Space-Saving Design"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-14",
    "name": "Ambient Dimmable Touch Bedside Lamp with USB Charging",
    "slug": "ambient-dimmable-touch-bedside-lamp-with-usb-charging",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 169900,
    "was_price_cents": 259900,
    "discount_label": "-35%",
    "rating": 4.7,
    "reviews_count": 670,
    "tag": "Cozy Living",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10012_HOME_K_train.jpeg",
    "badge_class": "badge-new",
    "description": "Modern minimalist flax fabric shade sitting on solid wood base with smooth 3-way touch brightness sensor and integrated USB-A + Type-C charging ports.",
    "features": [
      "3-Level Touch Stepless Dimming (Low, Medium, Bright)",
      "Dual USB Charging Ports: Power phone even when lamp is off",
      "Flicker-Free Warm 2700K LED Edison Bulb Included",
      "Solid Natural Oak Wood Base with Textured Fabric Shade"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-15",
    "name": "Premium Memory Foam Cervical Support Contour Pillow",
    "slug": "premium-memory-foam-cervical-support-contour-pillow",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 199900,
    "was_price_cents": 319900,
    "discount_label": "-37%",
    "rating": 4.8,
    "reviews_count": 1240,
    "tag": "Pain Relief",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10013_HOME_K_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Ergonomically contoured butterfly shape cradles the neck and shoulders to alleviate morning stiffness for back, stomach, and side sleepers.",
    "features": [
      "Ergonomic Butterfly Contour Maintains Natural Cervical Curve",
      "Slow-Rebound Odorless High-Density Memory Foam",
      "Breathable Ice-Silk Cooling Washable Outer Cover",
      "Dual Height Design (4.3\" and 3.5\") Fits All Sleep Preferences"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-16",
    "name": "Heavy-Duty Stainless Steel Herb & Kitchen Shears",
    "slug": "heavy-duty-stainless-steel-herb-kitchen-shears",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 69900,
    "was_price_cents": 109900,
    "discount_label": "-36%",
    "rating": 4.7,
    "reviews_count": 590,
    "tag": "Utility",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10015_HOME_K_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Multi-purpose culinary scissors with micro-serrated high carbon blades, built-in bottle opener, nutcracker, and comfortable non-slip handles.",
    "features": [
      "Micro-Serrated 3mm Thick Rust-Proof Blades",
      "Cuts Poultry Bones, Fish Scales, and Tough Cartilage",
      "Built-in Nutcracker & Crown Cap Bottle Opener",
      "Dishwasher Safe with Magnetic Protective Blade Sheath"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-17",
    "name": "Natural Fiber Braided Non-Slip Geometric Area Rug 4x6 Ft",
    "slug": "natural-fiber-braided-non-slip-geometric-area-rug-4x6-ft",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 299900,
    "was_price_cents": 469900,
    "discount_label": "-36%",
    "rating": 4.6,
    "reviews_count": 340,
    "tag": "Artisan",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10016_HOME_K_train.jpeg",
    "badge_class": "badge-new",
    "description": "Hand-woven from sustainable organic jute and cotton yarn with a subtle diamond pattern. Adds warm tactile earthy elegance to living rooms.",
    "features": [
      "Hand-Loomed Sustainable Organic Jute & Recycled Cotton",
      "Reversible Heavyweight Lay-Flat Textured Weave",
      "Eco-Friendly, Biodegradable & Non-Toxic Dyes",
      "Durable High-Traffic Resistant Floor Covering"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-18",
    "name": "Countertop 3-Tier Black Metal Wire Fruit & Vegetable Basket",
    "slug": "countertop-3-tier-black-metal-wire-fruit-vegetable-basket",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 129900,
    "was_price_cents": 199900,
    "discount_label": "-35%",
    "rating": 4.8,
    "reviews_count": 460,
    "tag": "Organization",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10017_HOME_K_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Keep produce fresh longer with breathable wire airflow design, wooden carry handles, and detachable modular stacking baskets.",
    "features": [
      "Rust-Proof Matte Black Powder-Coated Steel Wire",
      "Open Grid Airflow Design Prevents Produce Rotting",
      "Detachable Baskets: Use Stacked or Individually",
      "Solid Beechwood Ergonomic Carrying Handles"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-19",
    "name": "Automatic Stainless Steel Sensor Trash Can 30L",
    "slug": "automatic-stainless-steel-sensor-trash-can-30l",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 349900,
    "was_price_cents": 549900,
    "discount_label": "-36%",
    "rating": 4.6,
    "reviews_count": 380,
    "tag": "Smart Kitchen",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10019_HOME_K_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Touchless infrared motion lid opens silently in 0.3 seconds. Fingerprint-resistant stainless steel body with deodorizing charcoal filter compartment.",
    "features": [
      "Infrared Motion Sensor Opens Lid Touch-Free in 0.3s",
      "Fingerprint-Resistant Brushed Stainless Steel Outer",
      "Built-in Carbon Odor Filter Absorbs Unpleasant Smells",
      "Soft-Close Damper Mechanism for Silent Operation"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-20",
    "name": "Turkish Cotton Plush Absorbent Bath Towel Set (4-Pack)",
    "slug": "turkish-cotton-plush-absorbent-bath-towel-set-4-pack",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 179900,
    "was_price_cents": 279900,
    "discount_label": "-36%",
    "rating": 4.8,
    "reviews_count": 870,
    "tag": "Hotel Luxury",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10021_HOME_K_train.jpeg",
    "badge_class": "badge-deal",
    "description": "600 GSM premium Aegean combed Turkish cotton towels known for fast-drying loops, cloud-like softness, and reinforced double-stitched hems.",
    "features": [
      "600 GSM 100% Aegean Long-Staple Turkish Cotton",
      "Exceptional Absorbency with Fast Air-Dry Capability",
      "Double-Stitched Reinforced Hems Prevent Fraying",
      "OEKO-TEX Standard 100 Certified Chemical-Free"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-21",
    "name": "Insulated Double-Wall Stainless Steel French Press 1000ml",
    "slug": "insulated-double-wall-stainless-steel-french-press-1000ml",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 199900,
    "was_price_cents": 299900,
    "discount_label": "-33%",
    "rating": 4.9,
    "reviews_count": 610,
    "tag": "Coffee Lovers",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10022_HOME_K_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Heavy-duty 18/10 stainless steel construction keeps coffee piping hot for 2 hours while remaining cool to the touch outside. Double-screen filter eliminates sediment.",
    "features": [
      "Vacuum Double-Wall Insulation Keeps Brew Hot for 2+ Hours",
      "Unbreakable 18/10 Surgical Grade Stainless Steel",
      "Dual-Screen Ultra-Fine Plunger Prevents Grits in Cup",
      "Dishwasher Safe and Rust-Proof Guaranteed"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-22",
    "name": "Smart Wi-Fi Air Purifier with True HEPA Filter",
    "slug": "smart-wi-fi-air-purifier-with-true-hepa-filter",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 649900,
    "was_price_cents": 999900,
    "discount_label": "-35%",
    "rating": 4.7,
    "reviews_count": 520,
    "tag": "Clean Air",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10023_HOME_K_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Captures 99.97% of airborne particles, smoke, dust, pollen, and pet dander down to 0.3 microns with real-time PM2.5 air quality indicator.",
    "features": [
      "3-Stage Filtration: Pre-filter + True HEPA H13 + Carbon",
      "Real-Time Laser PM2.5 Particle Sensor & Color LED Indicator",
      "Covers up to 350 Sq Ft Rooms in 15 Minutes",
      "Ultra-Quiet Sleep Mode (22dB) with Display Off"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-23",
    "name": "Wooden Expandable Bathtub Caddy Tray with Book & Glass Holder",
    "slug": "wooden-expandable-bathtub-caddy-tray-with-book-glass-holder",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 189900,
    "was_price_cents": 289900,
    "discount_label": "-34%",
    "rating": 4.7,
    "reviews_count": 290,
    "tag": "Self Care",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10008_HOME_K_train.jpeg",
    "badge_class": "badge-new",
    "description": "Transform your bath into a spa retreat with water-resistant solid bamboo caddy that extends from 27 to 41 inches with waterproof wine and tablet slots.",
    "features": [
      "100% Eco Bamboo with Water-Resistant Polyurethane Seal",
      "Expandable Slip-Proof Arms Fit Standard & Oversized Tubs",
      "Fold-Up Stainless Steel Book/Tablet Reading Rack",
      "Includes Wine Glass Slot, Phone Pad, and Candle Holder"
    ],
    "initial_stock": 50
  },
  {
    "id": "home-24",
    "name": "Stoneware Dinnerware Plates & Bowls Set (16-Piece)",
    "slug": "stoneware-dinnerware-plates-bowls-set-16-piece",
    "category": "home",
    "category_name": "Home & Living",
    "price_cents": 499900,
    "was_price_cents": 799900,
    "discount_label": "-37%",
    "rating": 4.8,
    "reviews_count": 450,
    "tag": "Dining Style",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/HOME_KITCHEN_TOOLS/10014_HOME_K_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Service for 4 includes dinner plates, salad plates, soup bowls, and mugs in rich reactive glazed ceramic with matte organic rim detailing.",
    "features": [
      "16-Piece Service for 4 with Handcrafted Reactive Glaze",
      "Chip-Resistant High-Fired Durable Stoneware",
      "Microwave, Dishwasher, and Freezer Safe",
      "Stackable Design Saves Kitchen Cabinet Space"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-1",
    "name": "Orthopedic Joint-Relief Memory Foam Pet Bed",
    "slug": "orthopedic-joint-relief-memory-foam-pet-bed",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 299900,
    "was_price_cents": 449900,
    "discount_label": "-33%",
    "rating": 4.8,
    "reviews_count": 790,
    "tag": "Vet Approved",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11498_PET_SU_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Engineered with high-density egg-crate memory foam to soothe aging joints, paired with a machine-washable plush waterproof faux-fur cover.",
    "features": [
      "High-density Orthopedic Memory Support Foam",
      "Waterproof internal lining protects against accidents",
      "Removable machine-washable ultra-soft plush cover",
      "Non-skid silicone studded bottom grip"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-2",
    "name": "Interactive Smart Automatic Laser Cat Toy",
    "slug": "interactive-smart-automatic-laser-cat-toy",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 139900,
    "was_price_cents": 219900,
    "discount_label": "-34%",
    "rating": 4.6,
    "reviews_count": 530,
    "tag": "Trending",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11499_PET_SU_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Keep your indoor cats active and entertained with 360-degree irregular trajectory laser patterns and an automatic 15-minute sleep cycle.",
    "features": [
      "3 Speed Modes: Slow, Fast, and Random Wander",
      "Automatic 15-min timer prevents pet exhaustion",
      "USB-C Rechargeable battery or plug-in continuous",
      "Silent motor ensures disturbance-free playtime"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-3",
    "name": "Automatic Programmable Pet Feeder with Voice Recorder 4L",
    "slug": "automatic-programmable-pet-feeder-with-voice-recorder-4l",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 399900,
    "was_price_cents": 599900,
    "discount_label": "-33%",
    "rating": 4.8,
    "reviews_count": 640,
    "tag": "Smart Pet Care",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11500_PET_SU_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Schedule up to 6 meals daily with portion control and record a 10-second personalized call message so your pet never misses a meal.",
    "features": [
      "4L Translucent Hopper Stores up to 2.5kg Dry Kibble",
      "10-Second Personalized Voice Meal Call Recording",
      "Dual Power: Wall Adapter + 3 D-Cell Battery Backup",
      "Anti-Clog Incline Chute & Desiccant Bag Freshness Seal"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-4",
    "name": "Ultra-Quiet Stainless Steel Pet Water Fountain 2.5L",
    "slug": "ultra-quiet-stainless-steel-pet-water-fountain-2-5l",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 189900,
    "was_price_cents": 289900,
    "discount_label": "-34%",
    "rating": 4.7,
    "reviews_count": 920,
    "tag": "Health Essential",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11501_PET_SU_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Encourage hydration with continuous bubbling oxygenated water stream filtered through activated carbon and ion-exchange resin.",
    "features": [
      "Food-Grade 304 Stainless Steel Prevents Feline Acne",
      "Triple-Action Multi-Stage Filtration Cartridge",
      "Ultra-Quiet <20dB Submersible Water Pump",
      "Dishwasher-Safe Construction with LED Water Level Window"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-5",
    "name": "Heavy-Duty 360° Tangle-Free Retractable Dog Leash 5M",
    "slug": "heavy-duty-360-tangle-free-retractable-dog-leash-5m",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 119900,
    "was_price_cents": 179900,
    "discount_label": "-33%",
    "rating": 4.6,
    "reviews_count": 1140,
    "tag": "Bestseller",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11502_PET_SU_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Durable nylon tape leash extends up to 16 feet with one-button quick brake lock and ergonomic anti-slip rubberized comfort grip.",
    "features": [
      "16 Ft High-Strength Nylon Ribbon Tape for Dogs up to 50kg",
      "Instant One-Hand Quick-Brake & Lock Mechanism",
      "360° Swivel Rust-Proof Heavy Chromium-Plated Hook",
      "Ergonomic Non-Slip Silicone Palm Handle Grip"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-6",
    "name": "No-Pull Breathable Reflective Dog Harness with Handle",
    "slug": "no-pull-breathable-reflective-dog-harness-with-handle",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 129900,
    "was_price_cents": 199900,
    "discount_label": "-35%",
    "rating": 4.9,
    "reviews_count": 1380,
    "tag": "Trainer Pick",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11503_PET_SU_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Dual leash attachment clips distribute pulling pressure evenly across chest and shoulders without choking. Reflective seams ensure nighttime safety.",
    "features": [
      "Front D-Ring for No-Pull Training + Back Leash Ring",
      "Breathable Padded Air Mesh Lining Protects Coat",
      "Sturdy Top Traffic Control Grip Handle",
      "3M Scotchlite Reflective Strips for Low-Light Visibility"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-7",
    "name": "Multi-Level Sisal Scratching Post Cat Tree with Condo",
    "slug": "multi-level-sisal-scratching-post-cat-tree-with-condo",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 449900,
    "was_price_cents": 699900,
    "discount_label": "-36%",
    "rating": 4.8,
    "reviews_count": 420,
    "tag": "Cat Favorite",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11504_PET_SU_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Climbing activity tower with natural sisal rope scratching posts, cozy plush sleeping cave, dangling mouse toy, and elevated observation perch.",
    "features": [
      "100% Natural Durable Sisal Scratching Columns",
      "Plush Faux-Fur Padded Hideaway Sleeping Condo",
      "Heavy Engineered Baseboard Prevents Tipping",
      "Easy 15-Minute Assembly with Included Allen Key"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-8",
    "name": "Self-Cleaning Slicker Grooming Brush for Dogs & Cats",
    "slug": "self-cleaning-slicker-grooming-brush-for-dogs-cats",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 79900,
    "was_price_cents": 129900,
    "discount_label": "-38%",
    "rating": 4.7,
    "reviews_count": 890,
    "tag": "Easy Clean",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11505_PET_SU_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Fine bent wire bristles penetrate deep into undercoat without scratching skin. Click the button to retract bristles and instantly wipe away fur.",
    "features": [
      "One-Click Retraction Button Releases Trapped Fur in 1 Second",
      "Fine Stainless Steel Pins with Protective Rounded Massage Tips",
      "Reduces Shedding by up to 90% with Regular Brushing",
      "Ergonomic Textured Anti-Slip Thumb-Rest Handle"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-9",
    "name": "Durable Natural Rubber Chewing & Treat Dispensing Ball",
    "slug": "durable-natural-rubber-chewing-treat-dispensing-ball",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 59900,
    "was_price_cents": 99900,
    "discount_label": "-40%",
    "rating": 4.6,
    "reviews_count": 1050,
    "tag": "Tough Chew",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11506_PET_SU_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Made from puncture-resistant natural rubber that cleans teeth and massages gums while dispensing kibble or peanut butter during play.",
    "features": [
      "100% Non-Toxic Food-Grade Durable Natural Rubber",
      "Interior Maze Core Slowly Dispenses Treats & Kibble",
      "Textured Exterior Ridges Scrape Away Tartar and Plaque",
      "Bouncy Unpredictable Trajectory Keeps Dogs Mentally Stimulated"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-10",
    "name": "Waterproof Non-Slip Silicone Pet Food Mat with Raised Edge",
    "slug": "waterproof-non-slip-silicone-pet-food-mat-with-raised-edge",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 69900,
    "was_price_cents": 109900,
    "discount_label": "-36%",
    "rating": 4.8,
    "reviews_count": 610,
    "tag": "Clean Floor",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11507_PET_SU_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Food-grade silicone placemat with 0.5-inch raised outer lip contains messy food spills and water splashes to keep hardwood and tiles clean.",
    "features": [
      "100% FDA-Grade Non-Toxic BPA-Free Silicone",
      "0.5-Inch Raised Spill Barrier Edge Holds Liquid Spills",
      "Non-Skid Bottom Clings to Hardwood and Ceramic Floors",
      "Dishwasher Safe or Easily Rinsed Under Tap"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-11",
    "name": "Elevated Bamboo Double Stainless Steel Feeding Bowls",
    "slug": "elevated-bamboo-double-stainless-steel-feeding-bowls",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 169900,
    "was_price_cents": 259900,
    "discount_label": "-35%",
    "rating": 4.7,
    "reviews_count": 520,
    "tag": "Posture Support",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11508_PET_SU_train.jpeg",
    "badge_class": "badge-new",
    "description": "Elevated eating posture reduces neck strain and promotes better digestion for dogs and cats. Built with water-resistant solid natural bamboo.",
    "features": [
      "Natural Water-Repellent Solid Bamboo Stand",
      "Includes 2 Removable 800ml Rust-Proof Stainless Bowls",
      "Silicone Anti-Rattle Insets Keep Bowls Quiet While Eating",
      "15-Degree Tilted Ergonomic Incline Aids Swallowing"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-12",
    "name": "Airline Approved Breathable Pet Carrier Backpack with Bubble",
    "slug": "airline-approved-breathable-pet-carrier-backpack-with-bubble",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 279900,
    "was_price_cents": 429900,
    "discount_label": "-35%",
    "rating": 4.8,
    "reviews_count": 730,
    "tag": "Travel Gear",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11509_PET_SU_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Clear panoramic view window with 9 ventilation holes and dual mesh sides. Padded shoulder straps and chest buckle distribute weight evenly.",
    "features": [
      "Clear Space-Capsule Bubble Window for Curious Pets",
      "9 Large Ventilation Eyelets + Breathable Side Mesh Panels",
      "Interior Security Leash Clip Prevents Escape",
      "Airline Approved Size Fits Comfortably Under Airplane Seats"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-13",
    "name": "Calming Anti-Anxiety Plush Donut Cuddle Dog Bed",
    "slug": "calming-anti-anxiety-plush-donut-cuddle-dog-bed",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 219900,
    "was_price_cents": 339900,
    "discount_label": "-35%",
    "rating": 4.9,
    "reviews_count": 1280,
    "tag": "Deep Sleep",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11510_PET_SU_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Fluffy shaggy faux-fur donut nest mimics a mother’s warm coat to ease pet anxiety. Raised rim provides head and neck support for sound sleep.",
    "features": [
      "Ultra-Soft 4cm Shag Faux Fur Creates Safe Nesting Sensation",
      "Generously Stuffed with Virgin Polypropylene Cotton Filling",
      "Entire Bed is 100% Machine Washable & Tumble Dry Safe",
      "Waterproof & Dustproof Non-Slip Base Protects Floors"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-14",
    "name": "Rechargeable Painless Low-Noise Pet Nail Grinder",
    "slug": "rechargeable-painless-low-noise-pet-nail-grinder",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 149900,
    "was_price_cents": 229900,
    "discount_label": "-35%",
    "rating": 4.6,
    "reviews_count": 480,
    "tag": "Grooming",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11511_PET_SU_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Advanced diamond drum bit trims pet claws smoothly and painlessly. Ultra-quiet motor (<40dB) keeps pets calm without vibration anxiety.",
    "features": [
      "Diamond Bit Grinder Safely Rounds Sharp Claws",
      "Whisper-Quiet <40dB Motor Keeps Anxious Pets Calm",
      "2 Rotation Speeds with 3 Size Ports for Small/Large Pets",
      "USB Rechargeable with up to 7 Hours Continuous Operation"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-15",
    "name": "Ultra-Absorbent Quick-Dry Microfiber Pet Towel with Hand Pockets",
    "slug": "ultra-absorbent-quick-dry-microfiber-pet-towel-with-hand-pockets",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 69900,
    "was_price_cents": 109900,
    "discount_label": "-36%",
    "rating": 4.8,
    "reviews_count": 410,
    "tag": "Bath Time",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11512_PET_SU_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Absorbs 8x its weight in water to dry wet muddy dogs in minutes. Dual hand pockets on both ends give you firm control while rubbing belly and paws.",
    "features": [
      "Chenille Microfiber Noodles Absorb 8x Weight in Water",
      "Dual End Hand Pockets for Easy Drying Grip",
      "Gentle on Sensitive Skin & Dries 4x Faster than Cotton",
      "Machine Washable with Embroidered Cute Paw Print"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-16",
    "name": "Waterproof Heavy-Duty Dog Car Seat Cover with Mesh Window",
    "slug": "waterproof-heavy-duty-dog-car-seat-cover-with-mesh-window",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 249900,
    "was_price_cents": 379900,
    "discount_label": "-34%",
    "rating": 4.7,
    "reviews_count": 690,
    "tag": "Road Trips",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11513_PET_SU_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Protects backseat leather and upholstery from muddy paws, fur, and scratches. Visual mesh window provides two-way view and AC airflow.",
    "features": [
      "600D Heavy Oxford Fabric with Waterproof TPU Membrane",
      "Visual Breathable Mesh Window Lets Pet See Front Passengers",
      "Side Flaps with Zippers Protect Car Doors from Scratches",
      "Quick Snap Buckles Install in under 60 Seconds"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-17",
    "name": "Catnip Infused Crinkle Feather Wand Toy Set (6-Pack)",
    "slug": "catnip-infused-crinkle-feather-wand-toy-set-6-pack",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 54900,
    "was_price_cents": 89900,
    "discount_label": "-39%",
    "rating": 4.6,
    "reviews_count": 580,
    "tag": "Play Time",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11514_PET_SU_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Stimulate your cat’s natural hunting instinct with flexible carbon fiber teaser wand, replaceable bird feathers, bells, and organic catnip.",
    "features": [
      "Flexible 38\" Carbon Fiber Telescopic Teaser Wand",
      "6 Interchangeable Natural Feathers and Plush Worm Attachments",
      "Infused with 100% Organic Grown North American Catnip",
      "Strengthens Bond Through Active Daily Interactive Play"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-18",
    "name": "Natural Hypoallergenic Oatmeal & Aloe Pet Shampoo 500ml",
    "slug": "natural-hypoallergenic-oatmeal-aloe-pet-shampoo-500ml",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 79900,
    "was_price_cents": 129900,
    "discount_label": "-38%",
    "rating": 4.8,
    "reviews_count": 760,
    "tag": "Gentle Care",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11515_PET_SU_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Veterinarian formulated with colloidal oatmeal, organic aloe vera, and almond oil to soothe dry, itchy, allergic skin while deodorizing coat.",
    "features": [
      "Colloidal Oatmeal & Aloe Vera Relieve Itchy Irritated Skin",
      "Tearless & Soap-Free: Does Not Wash Away Topical Flea Treatments",
      "Warm Vanilla Coconut Natural Long-Lasting Fragrance",
      "pH Balanced Specially for Canine & Feline Dermal Layers"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-19",
    "name": "Professional Cordless Low-Noise Pet Grooming Clippers",
    "slug": "professional-cordless-low-noise-pet-grooming-clippers",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 229900,
    "was_price_cents": 349900,
    "discount_label": "-34%",
    "rating": 4.7,
    "reviews_count": 530,
    "tag": "At-Home Spa",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11516_PET_SU_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Titanium acute-angle blade combined with movable ceramic cutter glides through thick curly coats without snagging. Whisper-quiet <50dB motor.",
    "features": [
      "Sharp Titanium & Ceramic Cutter Blades Prevent Hair Snagging",
      "Ultra-Low Vibration & Sound Under 50dB Won’t Spook Pets",
      "4 Attachment Guide Combs (3mm, 6mm, 9mm, 12mm)",
      "USB Rechargeable with 120 Minutes Continuous Runtime"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-20",
    "name": "Snuffle Mat Interactive Nosework Feeding Foraging Pad",
    "slug": "snuffle-mat-interactive-nosework-feeding-foraging-pad",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 119900,
    "was_price_cents": 189900,
    "discount_label": "-37%",
    "rating": 4.8,
    "reviews_count": 460,
    "tag": "Brain Game",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11517_PET_SU_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Hides kibble inside colorful fleece petals to simulate natural outdoor foraging. 10 minutes of snuffling equals 1 hour of running for stress relief.",
    "features": [
      "Dense Upgraded Polar Fleece Fabric Resists Tearing",
      "Slows Down Rapid Eaters to Prevent Bloating and Vomiting",
      "Non-Slip Suction Base Keeps Mat Stationary on Smooth Floors",
      "Machine Washable for Effortless Hygiene Maintenance"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-21",
    "name": "Odor-Eliminating Stainless Steel Extra-Large Cat Litter Box",
    "slug": "odor-eliminating-stainless-steel-extra-large-cat-litter-box",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 329900,
    "was_price_cents": 499900,
    "discount_label": "-34%",
    "rating": 4.8,
    "reviews_count": 340,
    "tag": "Clean Home",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11518_PET_SU_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Unlike plastic boxes that absorb urine odors and scratch easily, non-stick stainless steel never rusts, never retains odors, and scoops clean effortlessly.",
    "features": [
      "Non-Porous 304 Stainless Steel Never Retains Smells",
      "Non-Stick Bottom: Wet Litter Slides Out Without Scraping",
      "High-Sided Removable Splash Guard Prevents Litter Scatter",
      "Spacious 23.5\" x 16\" Dimensions Fit Cats of All Sizes"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-22",
    "name": "LED Rechargeable Glow-in-the-Dark Safety Dog Collar",
    "slug": "led-rechargeable-glow-in-the-dark-safety-dog-collar",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 79900,
    "was_price_cents": 129900,
    "discount_label": "-38%",
    "rating": 4.7,
    "reviews_count": 610,
    "tag": "Night Walk",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11519_PET_SU_train.jpeg",
    "badge_class": "badge-deal",
    "description": "Ultra-bright optical LED glow visible from over 500 meters away for evening walks. Features steady, slow blink, and rapid flash modes.",
    "features": [
      "360° Illumination Visible up to 500 Meters for Traffic Safety",
      "3 Light Modes: Steady Glow, Rapid Strobe, and Slow Pulse",
      "Weatherproof IPX5 Casing Endures Rain Showers and Puddles",
      "USB Rechargeable: 8 Hours Illumination on a 1-Hour Charge"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-23",
    "name": "Automatic Ball Launcher Dog Fetch Toy",
    "slug": "automatic-ball-launcher-dog-fetch-toy",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 499900,
    "was_price_cents": 749900,
    "discount_label": "-33%",
    "rating": 4.6,
    "reviews_count": 270,
    "tag": "Interactive Fun",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11520_PET_SU_train.jpeg",
    "badge_class": "badge-new",
    "description": "Dogs can drop the ball into the wide funnel themselves. Launches mini tennis balls 10, 20, or 30 feet for endless energetic backyard entertainment.",
    "features": [
      "3 Launch Distance Settings (10ft, 20ft, 30ft)",
      "Includes 3 Pet-Safe 2-inch Non-Abrasive Mini Tennis Balls",
      "Wide Drop-In Funnel Teaches Dogs Autonomous Fetch Play",
      "Dual Power: Wall Adapter for Indoors or 6 C Batteries for Park"
    ],
    "initial_stock": 50
  },
  {
    "id": "pet-24",
    "name": "Calming Chews Hemp & Chamomile Stress Relief for Dogs (90ct)",
    "slug": "calming-chews-hemp-chamomile-stress-relief-for-dogs-90ct",
    "category": "pets",
    "category_name": "Pet Supplies",
    "price_cents": 149900,
    "was_price_cents": 229900,
    "discount_label": "-35%",
    "rating": 4.8,
    "reviews_count": 890,
    "tag": "Vet Formulated",
    "image": "products/ECOMMERCE_PRODUCT_IMAGES/train/PET_SUPPLIES/11521_PET_SU_train.jpeg",
    "badge_class": "badge-hot",
    "description": "Duck-flavored soft chews infused with organic hemp seed, chamomile, and L-Theanine to relieve anxiety from thunderstorms, fireworks, and vet visits.",
    "features": [
      "Formulated with Organic Hemp Seed, L-Theanine & Chamomile",
      "Eases Separation Anxiety, Thunderstorm Panic & Car Motion Sickness",
      "Delicious Real Duck Flavor Dogs Love Like a Treat",
      "Grain-Free, Corn-Free, Soy-Free: Zero Sedative Drowsiness"
    ],
    "initial_stock": 50
  }
];

export async function seedDatabase(): Promise<void> {
  await initDb();
  logger.info('Seeding database with demo users, catalog products, inventory, and coupons...');

  await transaction(async (tx) => {
    // 1. Seed Demo User
    const passwordHash = await bcrypt.hash('password123', 10);
    await tx.query(
      `INSERT INTO users (id, name, email, password_hash, phone, avatar, member_tier)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         member_tier = EXCLUDED.member_tier`,
      [
        'usr_demo_101',
        'Alex Johnson',
        'demo@shopcart.com',
        passwordHash,
        '+91 98765 43210',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        'Gold VIP'
      ]
    );

    // 2. Seed Addresses for Demo User
    await tx.query(
      `INSERT INTO user_addresses (id, user_id, title, street, city, state, zip_code, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [
        'addr_1',
        'usr_demo_101',
        'Home',
        'Flat 402, Lotus Heights, Bandra West',
        'Mumbai',
        'MH',
        '400050',
        'India',
        true
      ]
    );
    await tx.query(
      `INSERT INTO user_addresses (id, user_id, title, street, city, state, zip_code, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [
        'addr_2',
        'usr_demo_101',
        'Work / Tech Park',
        'Tower 4, Floor 7, Manyata Tech Park',
        'Bengaluru',
        'KA',
        '560045',
        'India',
        false
      ]
    );

    // 3. Seed Products & Inventory
    for (const p of SEED_PRODUCTS) {
      await tx.query(
        `INSERT INTO products (
          id, name, slug, category, category_name, price_cents, was_price_cents,
          discount_label, rating, reviews_count, tag, image, badge_class,
          description, features, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          price_cents = EXCLUDED.price_cents,
          was_price_cents = EXCLUDED.was_price_cents,
          is_active = EXCLUDED.is_active`,
        [
          p.id,
          p.name,
          p.slug,
          p.category,
          p.category_name,
          p.price_cents,
          p.was_price_cents,
          p.discount_label,
          p.rating,
          p.reviews_count,
          p.tag,
          p.image,
          p.badge_class,
          p.description,
          p.features,
          true
        ]
      );

      await tx.query(
        `INSERT INTO inventory (product_id, stock_quantity, reserved_quantity)
         VALUES ($1, $2, 0)
         ON CONFLICT (product_id) DO UPDATE SET
           stock_quantity = EXCLUDED.stock_quantity`,
        [p.id, p.initial_stock]
      );
    }

    // 4. Seed Coupons
    const now = new Date();
    const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const coupons = [
      {
        id: 'cpn_summer20',
        code: 'SUMMER20',
        discount_type: 'PERCENTAGE',
        discount_value: 20, // 20%
        min_order_amount_cents: 49900, // ₹499
        max_discount_cents: 100000, // ₹1,000
        valid_from: pastDate,
        valid_until: nextYear,
        usage_limit: 1000,
        per_user_limit: 5,
        is_active: true
      },
      {
        id: 'cpn_save20',
        code: 'SAVE20',
        discount_type: 'PERCENTAGE',
        discount_value: 20, // 20%
        min_order_amount_cents: 49900, // ₹499
        max_discount_cents: 50000, // ₹500
        valid_from: pastDate,
        valid_until: nextYear,
        usage_limit: 500,
        per_user_limit: 2,
        is_active: true
      },
      {
        id: 'cpn_welcome50',
        code: 'WELCOME50',
        discount_type: 'FIXED',
        discount_value: 5000, // ₹50
        min_order_amount_cents: 29900, // ₹299
        max_discount_cents: 5000,
        valid_from: pastDate,
        valid_until: nextYear,
        usage_limit: 200,
        per_user_limit: 1,
        is_active: true
      },
      {
        id: 'cpn_expired',
        code: 'EXPIRED20',
        discount_type: 'PERCENTAGE',
        discount_value: 20,
        min_order_amount_cents: 0,
        max_discount_cents: 100000,
        valid_from: pastDate,
        valid_until: pastDate, // Expired
        usage_limit: 100,
        per_user_limit: 1,
        is_active: true
      }
    ];

    for (const c of coupons) {
      await tx.query(
        `INSERT INTO coupons (
          id, code, discount_type, discount_value, min_order_amount_cents,
          max_discount_cents, valid_from, valid_until, usage_limit, per_user_limit, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (code) DO UPDATE SET
          discount_value = EXCLUDED.discount_value,
          valid_until = EXCLUDED.valid_until,
          is_active = EXCLUDED.is_active`,
        [
          c.id,
          c.code,
          c.discount_type,
          c.discount_value,
          c.min_order_amount_cents,
          c.max_discount_cents,
          c.valid_from,
          c.valid_until,
          c.usage_limit,
          c.per_user_limit,
          c.is_active
        ]
      );
    }

    // 5. Seed an initial historical order for the demo user
    await tx.query(
      `INSERT INTO orders (
        id, user_id, order_number, status, subtotal_cents, shipping_cents,
        discount_cents, total_cents, currency, shipping_address_json,
        tracking_number, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO NOTHING`,
      [
        'ord_demo_seed_01',
        'usr_demo_101',
        'ORD-2025-9832',
        'DELIVERED',
        759700,
        0,
        151940,
        607760,
        'INR',
        JSON.stringify({
          title: 'Home',
          street: 'Flat 402, Lotus Heights, Bandra West',
          city: 'Mumbai',
          state: 'MH',
          zipCode: '400050',
          country: 'India'
        }),
        'TRK-MH-88421094',
        new Date('2025-09-10T12:00:00Z')
      ]
    );

    await tx.query(
      `INSERT INTO order_items (id, order_id, product_id, product_name, price_cents, quantity, total_cents, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        'item_seed_01',
        'ord_demo_seed_01',
        'elec-1',
        'Active Noise-Canceling Wireless Over-Ear Headphones',
        499900,
        1,
        499900,
        'products/ECOMMERCE_PRODUCT_IMAGES/train/ELECTRONICS/3361_ELECTR_train.jpeg'
      ]
    );

    await tx.query(
      `INSERT INTO order_items (id, order_id, product_id, product_name, price_cents, quantity, total_cents, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        'item_seed_02',
        'ord_demo_seed_01',
        'beauty-1',
        'Hyaluronic Acid Multi-Molecular Hydration Serum 50ml',
        129900,
        2,
        259800,
        'products/ECOMMERCE_PRODUCT_IMAGES/train/BEAUTY_HEALTH/1088_BEAUTY_train.jpeg'
      ]
    );
  });

  logger.info('Database seeded successfully.');
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase()
    .catch((err) => {
      logger.error({ err }, 'Seeding failed.');
      process.exit(1);
    })
    .finally(() => closeDb());
}
