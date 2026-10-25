import type { Review } from '../types.js';

const STORAGE_KEY_REVIEWS = 'shopcart_user_reviews';
const STORAGE_KEY_HELPFUL = 'shopcart_helpful_votes';

// Initial curated reviews for the store catalog
const DEFAULT_REVIEWS: Review[] = [
  // --- elec-1: ANC Headphones ---
  {
    id: 'rev-elec-1-1',
    productId: 'elec-1',
    userName: 'Aarav Sharma',
    userAvatar: 'A',
    rating: 5,
    title: 'Outstanding sound quality and ANC!',
    comment: 'I travel frequently by metro and train, and the hybrid noise cancellation completely blocks ambient low rumble. Battery easily lasts 4-5 full work days without a recharge.',
    date: '2 weeks ago',
    verifiedPurchase: true,
    helpfulCount: 38
  },
  {
    id: 'rev-elec-1-2',
    productId: 'elec-1',
    userName: 'Priya Patel',
    userAvatar: 'P',
    rating: 5,
    title: 'Super comfortable for 8+ hour work sessions',
    comment: 'The memory foam ear cups are like clouds. No ear fatigue even with spectacles. Microphone clarity during Zoom calls is crystal clear without picking up background fans.',
    date: '1 month ago',
    verifiedPurchase: true,
    helpfulCount: 24
  },
  {
    id: 'rev-elec-1-3',
    productId: 'elec-1',
    userName: 'Rohan Mehra',
    userAvatar: 'R',
    rating: 4,
    title: 'Great value for money in this segment',
    comment: 'The bass is punchy without distorting vocals. App pairing is quick. Only minor complaint is the carrying pouch could be a hard-shell case.',
    date: '2 months ago',
    verifiedPurchase: true,
    helpfulCount: 11
  },

  // --- elec-2: Smart AMOLED Watch ---
  {
    id: 'rev-elec-2-1',
    productId: 'elec-2',
    userName: 'Kavita Nair',
    userAvatar: 'K',
    rating: 5,
    title: 'Vibrant AMOLED screen & reliable battery',
    comment: 'The display is bright enough even under direct sunlight at noon. Sleep tracking and heart rate monitor align closely with my medical pulse oximeter.',
    date: '3 weeks ago',
    verifiedPurchase: true,
    helpfulCount: 19
  },
  {
    id: 'rev-elec-2-2',
    productId: 'elec-2',
    userName: 'Aditya Gupta',
    userAvatar: 'A',
    rating: 4,
    title: 'Sleek design and accurate step counter',
    comment: 'Looks much more premium than its price. The water resistance survived swimming sessions with zero issues. Notification sync is instantaneous.',
    date: '1 month ago',
    verifiedPurchase: true,
    helpfulCount: 8
  },

  // --- elec-3: Vintage Instant Print Camera ---
  {
    id: 'rev-elec-3-1',
    productId: 'elec-3',
    userName: 'Sneha Deshmukh',
    userAvatar: 'S',
    rating: 5,
    title: 'So much fun for gatherings and vacations!',
    comment: 'Brought this to my friend\'s wedding reception. Guests loved getting physical prints instantly without messy ink cartridges. The digital microSD backup is a lifesaver.',
    date: '1 week ago',
    verifiedPurchase: true,
    helpfulCount: 42
  },
  {
    id: 'rev-elec-3-2',
    productId: 'elec-3',
    userName: 'Vikram Joshi',
    userAvatar: 'V',
    rating: 5,
    title: 'Aesthetic retro build, great gift item',
    comment: 'The retro pastel body feels sturdy. Thermal print rolls are very affordable compared to traditional film packets.',
    date: '3 weeks ago',
    verifiedPurchase: true,
    helpfulCount: 15
  },

  // --- fash-1: Minimalist Chronograph Watch ---
  {
    id: 'rev-fash-1-1',
    productId: 'fash-1',
    userName: 'Karan Verma',
    userAvatar: 'K',
    rating: 5,
    title: 'Timeless luxury aesthetics on a budget',
    comment: 'Looks and feels like a ₹25,000 Swiss timepiece. The magnetic mesh strap adjusts effortlessly to any wrist size. Highly recommended for formal wear.',
    date: '10 days ago',
    verifiedPurchase: true,
    helpfulCount: 29
  },
  {
    id: 'rev-fash-1-2',
    productId: 'fash-1',
    userName: 'Neha Singhal',
    userAvatar: 'N',
    rating: 5,
    title: 'Perfect birthday present for my husband',
    comment: 'He received endless compliments at his corporate dinner. The packaging was immaculate with protective velvet lining.',
    date: '1 month ago',
    verifiedPurchase: true,
    helpfulCount: 17
  },

  // --- home-1: Espresso Machine ---
  {
    id: 'rev-home-1-1',
    productId: 'home-1',
    userName: 'Tanvi Roy',
    userAvatar: 'T',
    rating: 5,
    title: 'True cafe-quality crema at home',
    comment: 'The 15-bar Italian pump extracts deep, rich crema. The steam wand produces silky micro-foam for latte art with just a little practice.',
    date: '2 weeks ago',
    verifiedPurchase: true,
    helpfulCount: 33
  },
  {
    id: 'rev-home-1-2',
    productId: 'home-1',
    userName: 'Manish Chawla',
    userAvatar: 'M',
    rating: 4,
    title: 'Compact footprint, warms up in 35 seconds',
    comment: 'Takes up minimal counter space in our apartment kitchen. Heating thermo-block is blazing fast compared to older boiler models.',
    date: '1 month ago',
    verifiedPurchase: true,
    helpfulCount: 14
  },

  // --- beauty-1: Ultrasonic Face Cleanser ---
  {
    id: 'rev-beauty-1-1',
    productId: 'beauty-1',
    userName: 'Ananya Mukherjee',
    userAvatar: 'A',
    rating: 5,
    title: 'Skin feels visibly smoother in just 5 days',
    comment: 'The gentle sonic vibrations dislodge pore sebum without causing any redness or sensitivity. Battery has lasted a full month on a single USB charge.',
    date: '2 weeks ago',
    verifiedPurchase: true,
    helpfulCount: 27
  },

  // --- pets-1: Orthopedic Dog Bed ---
  {
    id: 'rev-pets-1-1',
    productId: 'pets-1',
    userName: 'Deepak Reddy',
    userAvatar: 'D',
    rating: 5,
    title: 'My 9-year-old Labrador is sleeping so comfortably',
    comment: 'Our senior lab had trouble getting up from regular beds due to stiff joints. This orthopedic memory foam supports his spine perfectly. Cover washes easily.',
    date: '3 weeks ago',
    verifiedPurchase: true,
    helpfulCount: 36
  }
];

// Fallback generic reviews for any product without custom ones
function generateFallbackReviews(productId: string): Review[] {
  return [
    {
      id: `rev-${productId}-gen-1`,
      productId,
      userName: 'Suresh Kumar',
      userAvatar: 'S',
      rating: 5,
      title: 'Exceeded my expectations!',
      comment: 'The build quality and attention to detail are top notch. Delivery arrived a day earlier than projected and packaging was tamper-proof.',
      date: '2 weeks ago',
      verifiedPurchase: true,
      helpfulCount: 16
    },
    {
      id: `rev-${productId}-gen-2`,
      productId,
      userName: 'Divya Sundaram',
      userAvatar: 'D',
      rating: 5,
      title: 'Highly recommended purchase',
      comment: 'Matches the description and photos 100%. Easy to use and works flawlessly out of the box. Will definitely purchase again from ShopCart.',
      date: '1 month ago',
      verifiedPurchase: true,
      helpfulCount: 9
    },
    {
      id: `rev-${productId}-gen-3`,
      productId,
      userName: 'Arjun Nambiar',
      userAvatar: 'A',
      rating: 4,
      title: 'Good value and dependable quality',
      comment: 'Solid performance for the price point. Customer support promptly answered my queries regarding warranty registration.',
      date: '1 month ago',
      verifiedPurchase: true,
      helpfulCount: 5
    }
  ];
}

function getUserReviews(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUserReviews(reviews: Review[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  } catch (err) {
    console.error('Failed to save user reviews to storage:', err);
  }
}

export function getReviewsForProduct(productId: string): Review[] {
  const userReviews = getUserReviews().filter((r) => r.productId === productId);
  const defaultList = DEFAULT_REVIEWS.filter((r) => r.productId === productId);

  const baseList = defaultList.length > 0 ? defaultList : generateFallbackReviews(productId);
  return [...userReviews, ...baseList];
}

export function addReviewForProduct(
  productId: string,
  reviewInput: {
    userName: string;
    rating: number;
    title: string;
    comment: string;
  }
): Review {
  const allUserReviews = getUserReviews();

  const newReview: Review = {
    id: `rev-user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    productId,
    userName: reviewInput.userName.trim() || 'Verified Customer',
    userAvatar: (reviewInput.userName.trim() || 'V').charAt(0).toUpperCase(),
    rating: Math.max(1, Math.min(5, reviewInput.rating)),
    title: reviewInput.title.trim(),
    comment: reviewInput.comment.trim(),
    date: 'Just now',
    verifiedPurchase: true,
    helpfulCount: 0
  };

  allUserReviews.unshift(newReview);
  saveUserReviews(allUserReviews);

  return newReview;
}

export function voteHelpful(reviewId: string): number {
  try {
    const rawVotes = localStorage.getItem(STORAGE_KEY_HELPFUL);
    const votes: Record<string, boolean> = rawVotes ? JSON.parse(rawVotes) : {};

    if (votes[reviewId]) {
      return 0; // Already voted
    }

    votes[reviewId] = true;
    localStorage.setItem(STORAGE_KEY_HELPFUL, JSON.stringify(votes));
    return 1;
  } catch {
    return 1;
  }
}

export function getReviewStats(productId: string): {
  average: number;
  total: number;
  breakdown: Record<number, number>;
  percentageBreakdown: Record<number, number>;
} {
  const reviews = getReviewsForProduct(productId);
  const total = reviews.length;

  const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  reviews.forEach((r) => {
    const score = Math.round(r.rating);
    if (breakdown[score] !== undefined) {
      breakdown[score] += 1;
    }
    sum += r.rating;
  });

  const average = total > 0 ? parseFloat((sum / total).toFixed(1)) : 5.0;

  const percentageBreakdown: Record<number, number> = {
    5: total > 0 ? Math.round((breakdown[5] / total) * 100) : 0,
    4: total > 0 ? Math.round((breakdown[4] / total) * 100) : 0,
    3: total > 0 ? Math.round((breakdown[3] / total) * 100) : 0,
    2: total > 0 ? Math.round((breakdown[2] / total) * 100) : 0,
    1: total > 0 ? Math.round((breakdown[1] / total) * 100) : 0
  };

  return { average, total, breakdown, percentageBreakdown };
}
