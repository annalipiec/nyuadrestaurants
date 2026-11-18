import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './ShuttleScheduleScreen.css'
import { ChevronLeftIcon } from '../components/icons'
import { getShuttles } from '../api/shuttles'
import type { ShuttleRoute, ShuttleSchedule } from '../api/types'
import { abuDhabiNowMinutes, arrivalAt, departureFrom, parseTime } from '../utils/shuttleTimes'

/** Time to show for a stop in the timetable: departure where there is one, else arrival. */
function cellTime(trip: (string | null)[], stopIndex: number, stopCount: number) {
  return departureFrom(trip, stopIndex, stopCount) ?? arrivalAt(trip, stopIndex)
}

function RouteTable({ route, now }: { route: ShuttleRoute; now: number }) {
  const n = route.stops.length
  const firstTime = (trip: (string | null)[]) => trip.find((t) => t) ?? null
  const lastTime = (trip: (string | null)[]) => [...trip].reverse().find((t) => t) ?? null
  const nextIndex = route.trips.findIndex((trip) => {
    const t = firstTime(trip)
    return t != null && parseTime(t) >= now
  })

  return (
    <section className="shuttle-route">
      <header className="shuttle-route__header">
        <span className="shuttle-route__swatch" style={{ backgroundColor: route.color }} aria-hidden="true" />
        <h2 className="shuttle-route__name">{route.name}</h2>
        <span className="shuttle-route__service">{route.service}</span>
      </header>
      <div className="shuttle-route__scroll">
        <table className="shuttle-table">
          <thead>
            <tr>
              {route.stops.map((stop, i) => (
                <th key={i} scope="col">
                  {stop.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {route.trips.map((trip, ti) => {
              const last = lastTime(trip)
              const past = last != null && parseTime(last) < now
              const isNext = ti === nextIndex
              return (
                <tr
                  key={ti}
                  className={isNext ? 'shuttle-table__row--next' : past ? 'shuttle-table__row--past' : undefined}
                >
                  {route.stops.map((_, si) => (
                    <td key={si}>{cellTime(trip, si, n) ?? '–'}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/** Full NYUAD shuttle timetable (server/src/data/shuttleSchedule.js). Linked from the map and restaurant pages. */
export default function ShuttleScheduleScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const [schedule, setSchedule] = useState<ShuttleSchedule | null>(null)
  const [error, setError] = useState(false)
  const now = abuDhabiNowMinutes()

  useEffect(() => {
    getShuttles()
      .then(setSchedule)
      .catch(() => setError(true))
  }, [])

  // A direct visit has no in-app history to go back to.
  const goBack = () => (location.key === 'default' ? navigate('/') : navigate(-1))

  return (
    <div className="shuttle-screen">
      <div className="shuttle-screen__top">
        <button type="button" className="shuttle-screen__back" aria-label="Go back" onClick={goBack}>
          <ChevronLeftIcon />
        </button>
        <h1 className="shuttle-screen__title">Shuttle timetable</h1>
      </div>

      {error && <p className="shuttle-screen__state">Couldn't load the timetable. Please try again.</p>}
      {!schedule && !error && <p className="shuttle-screen__state">Loading…</p>}

      {schedule && (
        <>
          <div className="shuttle-screen__notice">
            <p>{schedule.info.notice}</p>
            <p>{schedule.info.advisory}</p>
            <p>
              {schedule.info.seating} Times are departures, except each route's last column (arrival back on
              campus). The highlighted row is the next bus today.
            </p>
          </div>

          {schedule.routes.map((route) => (
            <RouteTable key={route.key} route={route} now={now} />
          ))}

          {schedule.other_services.length > 0 && (
            <section className="shuttle-route">
              <header className="shuttle-route__header">
                <h2 className="shuttle-route__name">Other weekly services</h2>
              </header>
              <ul className="shuttle-other">
                {schedule.other_services.map((s, i) => (
                  <li key={i}>
                    <strong>{s.destination}</strong> — {s.when}, returns {s.returns}
                    <span className="shuttle-other__kind"> · {s.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
