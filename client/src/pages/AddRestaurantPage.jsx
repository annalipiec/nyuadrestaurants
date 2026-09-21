import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { apiErrorMessage } from '../api';
import LocationPicker from '../components/LocationPicker';

const initialForm = {
  name: '',
  cuisine: '',
  neighborhood: '',
  address: '',
  avg_meal_price_aed: '',
  description: '',
  happy_hour_info: '',
};

export default function AddRestaurantPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (coords.lat == null || coords.lng == null) {
      setError('Click on the map to drop a pin at the restaurant’s location.');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/restaurants', {
        ...form,
        avg_meal_price_aed: Number(form.avg_meal_price_aed),
        lat: coords.lat,
        lng: coords.lng,
      });
      navigate(`/restaurants/${data.restaurant.id}`);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not add restaurant.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-nyuad-950">Add a restaurant</h1>
      <p className="mt-1 text-sm text-nyuad-600">
        Know a good, affordable spot? Add it here. New submissions show up as{' '}
        <span className="font-medium">unverified</span> until other NYUAD students confirm it with reviews.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            required
            placeholder="Restaurant name"
            value={form.name}
            onChange={update('name')}
            className="rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
          />
          <input
            required
            placeholder="Cuisine (e.g. Lebanese)"
            value={form.cuisine}
            onChange={update('cuisine')}
            className="rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
          />
          <input
            placeholder="Neighborhood (e.g. Hamdan Street)"
            value={form.neighborhood}
            onChange={update('neighborhood')}
            className="rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
          />
          <input
            placeholder="Address (optional)"
            value={form.address}
            onChange={update('address')}
            className="rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
          />
          <input
            required
            type="number"
            min="0"
            placeholder="Average price per person (AED)"
            value={form.avg_meal_price_aed}
            onChange={update('avg_meal_price_aed')}
            className="rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
          />
          <input
            placeholder="Happy hour info (optional)"
            value={form.happy_hour_info}
            onChange={update('happy_hour_info')}
            className="rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
          />
        </div>

        <textarea
          placeholder="Description — what should people order? Why is it worth the trip?"
          rows={3}
          value={form.description}
          onChange={update('description')}
          className="w-full rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
        />

        <div>
          <p className="mb-2 text-sm font-medium text-nyuad-800">
            Click the map to drop a pin at the restaurant's location
          </p>
          <LocationPicker lat={coords.lat} lng={coords.lng} onPick={(lat, lng) => setCoords({ lat, lng })} />
          {coords.lat != null && (
            <p className="mt-1 text-xs text-nyuad-500">
              Pinned at {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} — nearest shuttle stop will be detected automatically.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={busy}
          className="rounded-lg bg-nyuad-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-nyuad-800 disabled:opacity-60"
        >
          Submit restaurant
        </button>
      </form>
    </div>
  );
}
