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

// Optional "vibe" tag a reviewer can attach alongside their star rating.
export const NYUAD_PHRASES = [
  'Would shuttle back for this',
  'Bring the whole floor',
  'First-week find',
  'Study break treat',
  'Late-night craving fix',
  'Family weekend approved',
  'Group dinner, split the bill',
  'Senior-year splurge',
];
