// NYUAD shuttle stops and timetable — the single source of truth for both the map routes and
// every "next shuttle" time in the app. Served as-is (plus DB stop ids) by GET /api/shuttles.
//
// Transcribed from NYUAD Campus & Shuttle Services' "Transportation Schedule", effective
// Wednesday, Oct 07, 2026. When a new schedule comes out, edit this file and push — nothing in
// the database needs changing (the DB only holds the stops restaurants point at, see seed.js).
//
// TRIP FORMAT: each trip lists times in the exact column order of the printed table:
//   DEP stop0, ARR stop1, DEP stop1, ARR stop2, DEP stop2, …, ARR lastStop
// i.e. 2 × (stops.length − 1) values. `null` = "–" in the printed table (the bus doesn't
// serve that stop on that trip). Times are Abu Dhabi local time, written as printed.

export const NYUAD_CAMPUS = { lat: 24.5335, lng: 54.438 };

// Stops with confirmed coordinates (given directly by the team). `key` links timetable stops,
// restaurants (seed.js) and map pins together; `name` is what the DB row is called.
export const REAL_STOPS = [
  { key: 'wtc', name: 'WTC stop', lat: 24.488711817967236, lng: 54.356473283742844 },
  { key: 'alWahda', name: 'Al Wahda stop', lat: 24.471688247027856, lng: 54.37297630832414 },
  { key: 'mamsha', name: 'Mamsha stop', lat: 24.538358148499473, lng: 54.41029684004894 },
  { key: 'galleria', name: 'Galleria Mall stop', lat: 24.501385508814867, lng: 54.38982096701346 },
  { key: 'louvre', name: 'Louvre stop', lat: 24.532504123520646, lng: 54.401687247219705 },
];

export const SCHEDULE_INFO = {
  effective: '2026-10-07',
  notice: 'Schedule effective Wednesday, Oct 07, 2026; subject to change.',
  advisory: 'Times may fluctuate depending on Abu Dhabi city traffic.',
  seating: 'Seating is first-come, first-served.',
};

// Timetable stops: `stop` is a REAL_STOPS key, 'campus', or null when we don't have the stop's
// coordinates yet (it's still shown in the timetable, just not drawn on the map).
const CAMPUS = { label: 'Saadiyat Campus', stop: 'campus' };

export const ROUTES = [
  {
    key: 'souk-wahda-galleria',
    name: 'Central Souk – Al Wahda – Galleria Mall',
    color: '#57068C',
    service: 'Daily',
    stops: [
      CAMPUS,
      { label: 'Central Souk (WTC)', stop: 'wtc' },
      { label: 'Al Wahda Mall', stop: 'alWahda' },
      { label: 'Galleria Mall', stop: 'galleria' },
      CAMPUS,
    ],
    trips: [
      [null, '7:58 AM', '8:00 AM', '8:08 AM', '8:10 AM', '8:20 AM', '8:22 AM', '8:35 AM'],
      ['7:55 AM', '8:10 AM', '8:12 AM', '8:20 AM', '8:22 AM', '8:32 AM', '8:35 AM', '8:50 AM'],
      ['10:40 AM', '10:55 AM', '10:57 AM', '11:05 AM', '11:07 AM', '11:15 AM', '11:20 AM', '11:40 AM'],
      ['1:15 PM', '1:30 PM', '1:32 PM', '1:40 PM', '1:42 PM', '1:50 PM', '1:55 PM', '2:15 PM'],
      ['4:00 PM', '4:15 PM', '4:17 PM', '4:25 PM', '4:27 PM', '4:35 PM', '4:40 PM', '5:00 PM'],
      ['5:30 PM', '5:45 PM', '5:47 PM', '5:55 PM', '5:57 PM', '6:05 PM', '6:10 PM', '6:30 PM'],
      ['6:30 PM', '6:45 PM', '6:47 PM', '6:55 PM', '6:57 PM', '7:05 PM', '7:10 PM', '7:30 PM'],
      ['7:40 PM', '7:50 PM', '7:52 PM', '7:57 PM', '8:00 PM', '8:10 PM', null, null],
      [null, null, null, null, '9:30 PM', '9:40 PM', '9:42 PM', '9:55 PM'],
    ],
  },
  {
    key: 'spinneys-mamsha-louvre',
    name: 'Spinneys St. Regis – Mamsha – Louvre',
    color: '#0F766E',
    service: 'Daily',
    stops: [
      CAMPUS,
      { label: 'Spinneys St. Regis', stop: null },
      { label: 'Mamsha Saadiyat', stop: 'mamsha' },
      { label: 'Louvre', stop: 'louvre' },
      CAMPUS,
    ],
    trips: [
      ['10:30 AM', '10:38 AM', '10:40 AM', '10:48 AM', '10:50 AM', '10:56 AM', '10:58 AM', '11:10 AM'],
      ['11:45 AM', '11:53 AM', '11:55 AM', '12:03 PM', '12:05 PM', '12:13 PM', '12:15 PM', '12:25 PM'],
      ['4:00 PM', '4:08 PM', '4:10 PM', '4:18 PM', '4:20 PM', '4:26 PM', '4:28 PM', '4:40 PM'],
      ['5:15 PM', '5:23 PM', '5:25 PM', '5:33 PM', '5:35 PM', '5:42 PM', '5:44 PM', '5:55 PM'],
    ],
  },
  {
    key: 'yas-mall',
    name: 'Yas Mall',
    color: '#C2410C',
    service: 'Daily',
    stops: [CAMPUS, { label: 'Yas Mall', stop: null }, CAMPUS],
    trips: [
      ['9:30 AM', '9:50 AM', '11:00 AM', '11:20 AM'],
      ['12:15 PM', '12:35 PM', '1:30 PM', '1:50 PM'],
      ['4:10 PM', '4:30 PM', '5:30 PM', '5:50 PM'],
      ['5:40 PM', '6:00 PM', '7:00 PM', '7:20 PM'],
      ['8:00 PM', '8:20 PM', '9:30 PM', '9:50 PM'],
    ],
  },
  {
    key: 'miza-corniche-marina-harley',
    name: 'Miza HQ – Corniche – Marina Mall – Harley St.',
    color: '#1D4ED8',
    service: 'Limited period: Sep 7 – Dec 31, 2026',
    validFrom: '2026-09-07',
    validUntil: '2026-12-31',
    stops: [
      CAMPUS,
      { label: 'Miza HQ', stop: null },
      { label: 'Corniche', stop: null },
      { label: 'Marina Mall', stop: null },
      { label: 'Harley St.', stop: null },
      CAMPUS,
    ],
    trips: [
      ['9:30 AM', '9:40 AM', '9:42 AM', '10:00 AM', '10:02 AM', '10:08 AM', '10:10 AM', '10:15 AM', '10:18 AM', '10:45 AM'],
      ['12:15 PM', '12:25 PM', '12:28 PM', '12:40 PM', '12:42 PM', '12:50 PM', '12:52 PM', '12:58 PM', '1:00 PM', '1:25 PM'],
      ['4:10 PM', '4:20 PM', '4:22 PM', '4:30 PM', '4:32 PM', '4:38 PM', '4:40 PM', '4:45 PM', '4:48 PM', '5:15 PM'],
      ['5:40 PM', '5:50 PM', '5:52 PM', '6:00 PM', '6:02 PM', '6:08 PM', '6:10 PM', '6:15 PM', '6:18 PM', '6:55 PM'],
    ],
  },
];

// Weekly services that aren't food runs — shown in the timetable only.
export const OTHER_SERVICES = [
  { name: 'Religious transportation', when: 'Friday, 12:00 PM – 12:10 PM', destination: 'Saadiyat Mosque', returns: '1:15 PM' },
  { name: 'Religious transportation', when: 'Sunday, 9:15 AM', destination: 'St. Andrew / ECC', returns: '11:45 AM' },
];

// Sanity check at import time so a typo in a new schedule fails loudly instead of silently
// mis-aligning times with stops.
for (const route of ROUTES) {
  const expected = 2 * (route.stops.length - 1);
  route.trips.forEach((trip, i) => {
    if (trip.length !== expected) {
      throw new Error(`shuttleSchedule: ${route.key} trip ${i + 1} has ${trip.length} times, expected ${expected}`);
    }
  });
}
