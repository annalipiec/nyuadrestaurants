export default function StarRating({ value = 0, onChange, size = 'text-base' }) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onChange === 'function';

  return (
    <div className={`inline-flex gap-0.5 ${size}`} role={interactive ? 'radiogroup' : undefined}>
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <span className={n <= Math.round(value) ? 'text-nyuad-700' : 'text-nyuad-200'}>★</span>
        </button>
      ))}
    </div>
  );
}
