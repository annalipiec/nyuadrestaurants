const TIER_STYLES = {
  swipe: 'bg-emerald-100 text-emerald-800',
  topup: 'bg-nyuad-100 text-nyuad-800',
  splurge: 'bg-amber-100 text-amber-800',
};

export default function PriceTag({ priceTier, avgPrice }) {
  if (!priceTier) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${TIER_STYLES[priceTier.key] || TIER_STYLES.topup}`}
      title={`~${avgPrice} AED per person`}
    >
      {priceTier.label}
    </span>
  );
}
