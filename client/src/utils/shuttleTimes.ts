import type { ShuttleRoute } from '../api/types'

// Helpers for reading a route's timetable. Trip columns: DEP stop0, ARR stop1, DEP stop1, …,
// ARR lastStop — so stop i (0 < i < last) arrives at column 2i−1 and departs at column 2i.

/** "7:58 AM" → minutes since midnight. */
export function parseTime(t: string): number {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t.trim())
  if (!m) return NaN
  let h = Number(m[1]) % 12
  if (m[3].toUpperCase() === 'PM') h += 12
  return h * 60 + Number(m[2])
}

/** Current time in Abu Dhabi, as minutes since midnight. */
export function abuDhabiNowMinutes(now = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return get('hour') * 60 + get('minute')
}

export function arrivalAt(trip: (string | null)[], stopIndex: number) {
  return stopIndex === 0 ? null : trip[2 * stopIndex - 1]
}

export function departureFrom(trip: (string | null)[], stopIndex: number, stopCount: number) {
  return stopIndex === stopCount - 1 ? null : trip[2 * stopIndex]
}

export type Leg = { leave: string; arrive: string }

/** Campus → this stop: trips that leave campus and stop here. */
export function legsFromCampus(route: ShuttleRoute, stopIndex: number): Leg[] {
  return route.trips.flatMap((trip) => {
    const leave = trip[0]
    const arrive = arrivalAt(trip, stopIndex)
    return leave && arrive ? [{ leave, arrive }] : []
  })
}

/** This stop → campus: trips that pick up here and make it back to campus. */
export function legsToCampus(route: ShuttleRoute, stopIndex: number): Leg[] {
  const n = route.stops.length
  return route.trips.flatMap((trip) => {
    const leave = departureFrom(trip, stopIndex, n)
    const arrive = trip[trip.length - 1]
    return leave && arrive ? [{ leave, arrive }] : []
  })
}

/** First leg leaving at or after `now` (minutes), or null if none left today. */
export function nextLeg(legs: Leg[], now: number): Leg | null {
  return legs.find((l) => parseTime(l.leave) >= now) ?? null
}

/** Where a DB stop (restaurant.nearest_shuttle_stop.id) appears in the timetable. */
export function routesServingStop(routes: ShuttleRoute[], stopId: number) {
  return routes.flatMap((route) => {
    const stopIndex = route.stops.findIndex((s) => s.stop_id === stopId)
    return stopIndex > 0 ? [{ route, stopIndex }] : []
  })
}

/**
 * Summary for one stop across every route that serves it: the next bus from campus (or the first
 * one tomorrow) and the last bus back to campus today.
 */
export function stopSummary(routes: ShuttleRoute[], stopId: number, now = abuDhabiNowMinutes()) {
  const serving = routesServingStop(routes, stopId)
  if (serving.length === 0) return null
  const byLeave = (a: Leg, b: Leg) => parseTime(a.leave) - parseTime(b.leave)
  const out = serving.flatMap(({ route, stopIndex }) => legsFromCampus(route, stopIndex)).sort(byLeave)
  const back = serving.flatMap(({ route, stopIndex }) => legsToCampus(route, stopIndex)).sort(byLeave)
  const next = nextLeg(out, now)
  return {
    routes: serving.map((s) => s.route),
    next,
    firstTomorrow: next ? null : (out[0] ?? null),
    lastBack: back[back.length - 1] ?? null,
    lastBackGone: back.length > 0 && parseTime(back[back.length - 1].leave) < now,
  }
}
