import api from './client'
import type { ShuttleSchedule } from './types'

// The timetable is static between deploys, so fetch it once per page load and share it.
let cached: Promise<ShuttleSchedule> | null = null

export function getShuttles() {
  if (!cached) {
    cached = api.get<ShuttleSchedule>('/shuttles').then((r) => r.data)
    cached.catch(() => {
      cached = null
    })
  }
  return cached
}
