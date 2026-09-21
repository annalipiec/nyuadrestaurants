import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import RestaurantCard from '../components/RestaurantCard';
import RestaurantMap from '../components/RestaurantMap';

const MAX_PRICE_OPTIONS = [
  { label: 'Any price', value: '' },
  { label: 'Under 33 AED (meal swipe)', value: '33' },
  { label: 'Under 70 AED', value: '70' },
  { label: 'Under 120 AED', value: '120' },
];

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [shuttleData, setShuttleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('map');
  const [showShuttles, setShowShuttles] = useState(true);
  const [activeId, setActiveId] = useState(null);

  const [filters, setFilters] = useState({ q: '', cuisine: '', maxPrice: '', happyHour: false });

  useEffect(() => {
    api.get('/restaurants/cuisines').then(({ data }) => setCuisines(data.cuisines));
    api.get('/shuttles').then(({ data }) => setShuttleData(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.q) params.q = filters.q;
    if (filters.cuisine) params.cuisine = filters.cuisine;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.happyHour) params.happyHour = 'true';

    const handle = setTimeout(() => {
      api
        .get('/restaurants', { params })
        .then(({ data }) => setRestaurants(data.restaurants))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [filters]);

  const resultsLabel = useMemo(() => {
    if (loading) return 'Loading…';
    return `${restaurants.length} spot${restaurants.length === 1 ? '' : 's'}`;
  }, [restaurants, loading]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
      <div className="rounded-2xl bg-gradient-to-br from-nyuad-700 to-nyuad-900 p-6 text-white">
        <h1 className="text-2xl font-bold sm:text-3xl">Find affordable eats in Abu Dhabi</h1>
        <p className="mt-1 max-w-2xl text-sm text-nyuad-100">
          Crowdsourced by NYUAD students, for NYUAD students — with shuttle stops mapped in so you know
          exactly how far a good meal is from campus.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-nyuad-100 bg-white p-3">
        <input
          type="text"
          placeholder="Search restaurants, cuisines, neighborhoods…"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          className="min-w-[200px] flex-1 rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
        />
        <select
          value={filters.cuisine}
          onChange={(e) => setFilters((f) => ({ ...f, cuisine: e.target.value }))}
          className="rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
        >
          <option value="">All cuisines</option>
          {cuisines.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filters.maxPrice}
          onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
          className="rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
        >
          {MAX_PRICE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 rounded-lg border border-nyuad-200 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={filters.happyHour}
            onChange={(e) => setFilters((f) => ({ ...f, happyHour: e.target.checked }))}
          />
          Happy hour
        </label>

        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-nyuad-700">
            <input type="checkbox" checked={showShuttles} onChange={(e) => setShowShuttles(e.target.checked)} />
            Shuttle routes
          </label>
          <div className="flex overflow-hidden rounded-lg border border-nyuad-200">
            <button
              onClick={() => setView('map')}
              className={`px-3 py-2 text-sm font-medium ${view === 'map' ? 'bg-nyuad-700 text-white' : 'bg-white text-nyuad-700'}`}
            >
              Map
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 text-sm font-medium ${view === 'list' ? 'bg-nyuad-700 text-white' : 'bg-white text-nyuad-700'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      <p className="text-sm text-nyuad-600">{resultsLabel}</p>

      {view === 'map' ? (
        <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
          <div className="order-2 flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1 lg:order-1">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} active={r.id === activeId} onHover={setActiveId} />
            ))}
            {!loading && restaurants.length === 0 && (
              <p className="rounded-xl border border-dashed border-nyuad-200 p-6 text-center text-sm text-nyuad-500">
                No restaurants match those filters yet — maybe add one yourself?
              </p>
            )}
          </div>
          <div className="order-1 h-[70vh] overflow-hidden rounded-xl border border-nyuad-100 lg:order-2">
            <RestaurantMap
              restaurants={restaurants}
              activeId={activeId}
              onMarkerHover={setActiveId}
              showShuttles={showShuttles}
              shuttleData={shuttleData}
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
          {!loading && restaurants.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-nyuad-200 p-6 text-center text-sm text-nyuad-500">
              No restaurants match those filters yet — maybe add one yourself?
            </p>
          )}
        </div>
      )}
    </div>
  );
}
