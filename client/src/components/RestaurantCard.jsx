import { Link } from 'react-router-dom';
import PriceTag from './PriceTag';
import StarRating from './StarRating';

export default function RestaurantCard({ restaurant, active, onHover }) {
  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      onMouseEnter={() => onHover?.(restaurant.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`block rounded-xl border p-4 transition hover:shadow-md hover:border-nyuad-300 ${
        active ? 'border-nyuad-500 shadow-md bg-nyuad-50' : 'border-nyuad-100 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-nyuad-950">{restaurant.name}</h3>
          <p className="text-sm text-nyuad-600">{restaurant.cuisine} · {restaurant.neighborhood}</p>
        </div>
        {!restaurant.verified && (
          <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
            Unverified
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <PriceTag priceTier={restaurant.price_tier} avgPrice={restaurant.avg_meal_price_aed} />
        {restaurant.happy_hour_info && (
          <span className="rounded-full bg-nyuad-100 px-2.5 py-1 text-xs font-medium text-nyuad-800">
            Happy hour
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2 text-sm">
        {restaurant.avg_stars ? (
          <>
            <StarRating value={restaurant.avg_stars} />
            <span className="text-nyuad-600">
              {restaurant.avg_stars} ({restaurant.review_count})
            </span>
          </>
        ) : (
          <span className="text-nyuad-400">No reviews yet</span>
        )}
      </div>

      {restaurant.nearest_shuttle_stop && (
        <p className="mt-2 text-xs text-nyuad-500">
          🚌 {Math.round(restaurant.nearest_shuttle_stop.distance_m)}m from {restaurant.nearest_shuttle_stop.name}
        </p>
      )}
    </Link>
  );
}
