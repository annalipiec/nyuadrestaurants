// Mirrors the shapes returned by server/src/routes/*.js. Keep in sync with that API.

export type PriceTier = {
  key: 'swipe' | 'topup' | 'splurge'
  label: string
  symbol: string
}

export type Dish = {
  id: number
  name: string
  price_aed: number | null
  likes: number
}

export type ShuttleStop = {
  id: number
  name: string
  lat: number
  lng: number
  distance_m: number
}

export type Restaurant = {
  id: number
  name: string
  cuisine: string
  neighborhood: string | null
  address: string | null
  lat: number
  lng: number
  avg_meal_price_aed: number
  description: string | null
  happy_hour_info: string | null
  /** A human-written transport note (e.g. "WTC stop + 10 min walk"), preferred over
   *  nearest_shuttle_stop.distance_m (a straight-line estimate) when present. */
  getting_there_note: string | null
  verified: boolean
  price_tier: PriceTier
  dishes: Dish[]
  review_count: number
  avg_stars: number | null
  nearest_shuttle_stop: ShuttleStop | null
}

export type Review = {
  id: number
  stars: number
  nyuad_phrase: string | null
  text: string | null
  created_at: string
  author_name: string
}

export type User = {
  id: number
  email: string
  name: string
  class_year: number | null
  email_verified: boolean
  /** On the AD Bites team (server ADMIN_EMAILS): can approve restaurant suggestions. */
  is_admin: boolean
}

/** A stop in a route's timetable. stop_id/lat/lng are null when we don't have its location yet. */
export type ShuttleRouteStop = {
  label: string
  stop_id: number | null
  is_campus: boolean
  lat: number | null
  lng: number | null
}

/**
 * A shuttle route and its timetable (server/src/data/shuttleSchedule.js). Each trip lists times in
 * the printed table's column order — DEP stop0, ARR stop1, DEP stop1, …, ARR lastStop — with null
 * for "–". See utils/shuttleTimes.ts for reading them.
 */
export type ShuttleRoute = {
  key: string
  name: string
  color: string
  service: string
  stops: ShuttleRouteStop[]
  trips: (string | null)[][]
  /** Line to draw on the map; [] if none of the route's stops are mapped yet. */
  path: [number, number][]
  /** true = path follows real roads; false = straight lines between stops (fallback). */
  follows_roads: boolean
}

export type RawShuttleStop = {
  id: number
  name: string
  lat: number
  lng: number
}

export type ShuttleSchedule = {
  info: { effective: string; notice: string; advisory: string; seating: string }
  /** Where every shuttle leaves from and returns to. */
  campus: { label: string; lat: number; lng: number }
  stops: RawShuttleStop[]
  routes: ShuttleRoute[]
  other_services: { name: string; when: string; destination: string; returns: string }[]
}

/** One of the current user's restaurant suggestions (Profile → Your suggestions). */
export type MySuggestion = {
  id: number
  name: string
  cuisine: string
  /** false = waiting for team approval */
  verified: boolean
  created_at: string
}

/** A suggestion waiting for approval, as the admin review screen sees it. */
export type PendingRestaurant = {
  id: number
  name: string
  cuisine: string
  lat: number
  lng: number
  avg_meal_price_aed: number
  description: string | null
  happy_hour_info: string | null
  getting_there_note: string | null
  created_at: string
  nearest_stop_name: string | null
  submitted_by_name: string | null
  submitted_by_email: string | null
  price_tier: PriceTier
}
