import { Link, type Location } from 'react-router-dom'
import type { Restaurant } from '../api/types'

/** Shared list row for ExploreListScreen and SavedScreen. */
export default function RestaurantRow({
  restaurant,
  backgroundLocation,
}: {
  restaurant: Restaurant
  backgroundLocation: Location
}) {
  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      state={{ backgroundLocation }}
      className="restaurant-row"
    >
      <div className="restaurant-row__top">
        <div>
          <p className="restaurant-row__name">{restaurant.name}</p>
          <p className="restaurant-row__meta">
            {restaurant.cuisine}
            {restaurant.neighborhood ? ` · ${restaurant.neighborhood}` : ''}
          </p>
        </div>
        <span className="restaurant-row__tag">{restaurant.price_tier.label}</span>
      </div>
      <div className="restaurant-row__footer">
        {restaurant.avg_stars ? (
          <span>
            ★ {restaurant.avg_stars} ({restaurant.review_count})
          </span>
        ) : (
          <span>No reviews yet</span>
        )}
        {restaurant.nearest_shuttle_stop && (
          <span>🚌 {Math.round(restaurant.nearest_shuttle_stop.distance_m)}m away</span>
        )}
      </div>
    </Link>
  )
}
