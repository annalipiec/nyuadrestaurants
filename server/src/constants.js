import { randomInt } from 'crypto';

// Price tiers are computed from avg_meal_price_aed rather than stored,
// so the label always reflects the current price (e.g. after a review updates it).
export const MEAL_SWIPE_AED = 33; // NYUAD dining hall meal swipe value, used as the "affordable" anchor

export function priceTierFor(avgMealPriceAed) {
  if (avgMealPriceAed < MEAL_SWIPE_AED) {
    return { key: 'swipe', label: 'Less than a meal swipe', symbol: '$' };
  }
  if (avgMealPriceAed < MEAL_SWIPE_AED * 2) {
    return { key: 'topup', label: 'Worth a Campus Card top-up', symbol: '$$' };
  }
  return { key: 'splurge', label: 'Senior-year splurge', symbol: '$$$' };
}

export const VERIFICATION_CODE_LENGTH = 6;
export const VERIFICATION_EXPIRY_MINUTES = 15;
export const VERIFICATION_MAX_ATTEMPTS = 5; // wrong guesses before the code is invalidated
export const VERIFICATION_RESEND_COOLDOWN_SECONDS = 60;

export function generateVerificationCode() {
  const max = 10 ** VERIFICATION_CODE_LENGTH;
  return String(randomInt(max)).padStart(VERIFICATION_CODE_LENGTH, '0');
}

// Optional "vibe" tag a reviewer can attach alongside their star rating.
// "Vibe tags" students can attach to a tip, grouped for the picker. The 8 originals are kept
// verbatim so tips already posted with them still match.
export const NYUAD_PHRASE_GROUPS = [
  {
    label: 'The verdict',
    phrases: [
      'Would shuttle back for this',
      'Hidden gem',
      'Worth the taxi from the stop',
      'Long wait, worth it',
      'Taste of home',
    ],
  },
  {
    label: 'Who to bring',
    phrases: [
      'Bring the whole floor',
      'Group dinner, split the bill',
      'Family weekend approved',
      'Good for a date',
      'Great solo meal',
    ],
  },
  {
    label: 'When to go',
    phrases: [
      'First-week find',
      'Study break treat',
      'Late-night craving fix',
      'Quick bite before the shuttle',
      'Brunch-worthy',
      'Post-finals celebration',
      'Birthday dinner spot',
    ],
  },
  {
    label: 'The food',
    phrases: [
      'Cheaper than a meal swipe',
      'Huge portions — share it',
      'Vegetarian-friendly',
      'Good vegan options',
      'Spicy, you’ve been warned',
      'Ask for the daily special',
    ],
  },
  {
    label: 'The place',
    phrases: ['Quiet enough to study', 'Outdoor seating', 'Senior-year splurge'],
  },
];

export const NYUAD_PHRASES = NYUAD_PHRASE_GROUPS.flatMap((g) => g.phrases);
