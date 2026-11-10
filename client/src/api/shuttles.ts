import api from './client'
import type { RawShuttleStop, ShuttleRoute } from './types'

export async function getShuttles() {
  const { data } = await api.get<{ routes: ShuttleRoute[]; stops: RawShuttleStop[] }>('/shuttles')
  return data
}
