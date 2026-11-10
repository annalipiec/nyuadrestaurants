import api from './client'
import type { Dish, Restaurant, Review } from './types'

export type RestaurantFilters = {
  q?: string
  cuisine?: string
  maxPrice?: number
  happyHour?: boolean
}

export async function listRestaurants(filters: RestaurantFilters = {}) {
  const params: Record<string, string> = {}
  if (filters.q) params.q = filters.q
  if (filters.cuisine) params.cuisine = filters.cuisine
  if (filters.maxPrice) params.maxPrice = String(filters.maxPrice)
  if (filters.happyHour) params.happyHour = 'true'

  const { data } = await api.get<{ restaurants: Restaurant[] }>('/restaurants', { params })
  return data.restaurants
}

export async function listCuisines() {
  const { data } = await api.get<{ cuisines: string[] }>('/restaurants/cuisines')
  return data.cuisines
}

export async function getRestaurant(id: number | string) {
  const { data } = await api.get<{ restaurant: Restaurant; reviews: Review[] }>(`/restaurants/${id}`)
  return data
}

export async function likeDish(dishId: number) {
  const { data } = await api.post<{ dish_id: number; liked: boolean; likes: number }>(
    `/dishes/${dishId}/like`,
  )
  return data
}

export async function addDish(restaurantId: number, name: string, priceAed: number | null) {
  const { data } = await api.post<{ dish: Dish }>(`/restaurants/${restaurantId}/dishes`, {
    name,
    price_aed: priceAed,
  })
  return data.dish
}

export async function addReview(
  restaurantId: number,
  payload: { stars: number; nyuad_phrase?: string | null; text?: string | null },
) {
  const { data } = await api.post<{ review: Review }>(`/restaurants/${restaurantId}/reviews`, payload)
  return data.review
}

export async function listPhrases() {
  const { data } = await api.get<{ phrases: string[] }>('/phrases')
  return data.phrases
}
