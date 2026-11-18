import api from './client'
import type { PendingRestaurant } from './types'

// AD Bites team only (server/src/routes/admin.js) — the API returns 403 for everyone else.

export async function listPendingRestaurants() {
  const { data } = await api.get<{ restaurants: PendingRestaurant[] }>('/admin/restaurants/pending')
  return data.restaurants
}

export async function approveRestaurant(id: number) {
  await api.post(`/admin/restaurants/${id}/approve`)
}

export async function rejectRestaurant(id: number) {
  await api.delete(`/admin/restaurants/${id}`)
}
