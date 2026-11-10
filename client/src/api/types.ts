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
}

export type ShuttleRoute = {
  id: number
  name: string
  color: string
  path: [number, number][]
}

export type RawShuttleStop = {
  id: number
  name: string
  lat: number
  lng: number
  route_id: number | null
}
