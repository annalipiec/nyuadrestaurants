import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { apiErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import PriceTag from '../components/PriceTag';
import StarRating from '../components/StarRating';

function DishRow({ dish, restaurantId, onLiked }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  async function toggleLike() {
    if (!user || busy) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/dishes/${dish.id}/like`);
      onLiked(dish.id, data.likes);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-nyuad-100 px-3 py-2">
      <div>
        <p className="text-sm font-medium text-nyuad-950">{dish.name}</p>
        {dish.price_aed != null && <p className="text-xs text-nyuad-500">{dish.price_aed} AED</p>}
      </div>
      <button
        onClick={toggleLike}
        disabled={!user || busy}
        title={user ? 'Like this dish' : 'Log in to like dishes'}
        className="flex items-center gap-1 rounded-full border border-nyuad-200 px-3 py-1 text-sm text-nyuad-700 hover:bg-nyuad-50 disabled:opacity-60"
      >
        👍 {dish.likes}
      </button>
    </li>
  );
}

function AddDishForm({ restaurantId, onAdded }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/restaurants/${restaurantId}/dishes`, {
        name: name.trim(),
        price_aed: price ? Number(price) : null,
      });
      onAdded(data.dish);
      setName('');
      setPrice('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add a dish (e.g. Chicken Shawarma)"
        className="flex-1 rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
      />
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="AED"
        type="number"
        min="0"
        className="w-20 rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
      />
      <button
        disabled={busy}
        className="rounded-lg bg-nyuad-700 px-4 py-2 text-sm font-medium text-white hover:bg-nyuad-800 disabled:opacity-60"
      >
        Add
      </button>
    </form>
  );
}

function ReviewForm({ restaurantId, phrases, onAdded }) {
  const [stars, setStars] = useState(5);
  const [phrase, setPhrase] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(`/restaurants/${restaurantId}/reviews`, {
        stars,
        nyuad_phrase: phrase || null,
        text: text.trim() || null,
      });
      onAdded(data.review);
      setText('');
      setPhrase('');
      setStars(5);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-nyuad-100 bg-nyuad-50 p-4">
      <div>
        <p className="mb-1 text-sm font-medium text-nyuad-800">Your rating</p>
        <StarRating value={stars} onChange={setStars} size="text-2xl" />
      </div>
      <div>
        <p className="mb-1 text-sm font-medium text-nyuad-800">NYUAD vibe tag (optional)</p>
        <select
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          className="w-full rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
        >
          <option value="">No tag</option>
          {phrases.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share what to order, how it was, anything future students should know…"
        rows={3}
        className="w-full rounded-lg border border-nyuad-200 px-3 py-2 text-sm outline-none focus:border-nyuad-500"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={busy}
        className="rounded-lg bg-nyuad-700 px-4 py-2 text-sm font-medium text-white hover:bg-nyuad-800 disabled:opacity-60"
      >
        Post review
      </button>
    </form>
  );
}

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get(`/restaurants/${id}`), api.get('/phrases')])
      .then(([resDetail, resPhrases]) => {
        setRestaurant(resDetail.data.restaurant);
        setReviews(resDetail.data.reviews);
        setPhrases(resPhrases.data.phrases);
      })
      .finally(() => setLoading(false));
  }, [id]);

  function handleDishLiked(dishId, likes) {
    setRestaurant((r) => ({
      ...r,
      dishes: r.dishes.map((d) => (d.id === dishId ? { ...d, likes } : d)),
    }));
  }

  function handleDishAdded(dish) {
    setRestaurant((r) => ({ ...r, dishes: [dish, ...r.dishes] }));
  }

  function handleReviewAdded(review) {
    setReviews((r) => [review, ...r]);
    setRestaurant((r) => ({
      ...r,
      review_count: r.review_count + 1,
      avg_stars:
        Math.round((((r.avg_stars || 0) * r.review_count + review.stars) / (r.review_count + 1)) * 10) / 10,
    }));
  }

  if (loading) return <p className="p-8 text-center text-nyuad-500">Loading…</p>;
  if (!restaurant) return <p className="p-8 text-center text-nyuad-500">Restaurant not found.</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link to="/" className="text-sm text-nyuad-600 hover:underline">
        ← Back to explore
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-nyuad-950">{restaurant.name}</h1>
          <p className="text-nyuad-600">
            {restaurant.cuisine} · {restaurant.neighborhood}
          </p>
        </div>
        {!restaurant.verified && (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            Not yet verified by an NYUAD student
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <PriceTag priceTier={restaurant.price_tier} avgPrice={restaurant.avg_meal_price_aed} />
        {restaurant.happy_hour_info && (
          <span className="rounded-full bg-nyuad-100 px-2.5 py-1 text-xs font-medium text-nyuad-800">
            Happy hour: {restaurant.happy_hour_info}
          </span>
        )}
        {restaurant.avg_stars && (
          <span className="flex items-center gap-1 text-sm text-nyuad-700">
            <StarRating value={restaurant.avg_stars} /> {restaurant.avg_stars} ({restaurant.review_count})
          </span>
        )}
      </div>

      {restaurant.description && <p className="mt-4 text-nyuad-800">{restaurant.description}</p>}

      {restaurant.nearest_shuttle_stop && (
        <p className="mt-3 rounded-lg bg-nyuad-50 px-3 py-2 text-sm text-nyuad-700">
          🚌 About {Math.round(restaurant.nearest_shuttle_stop.distance_m)}m from{' '}
          <strong>{restaurant.nearest_shuttle_stop.name}</strong>
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-nyuad-950">Dishes people like</h2>
        <ul className="mt-2 space-y-2">
          {restaurant.dishes.map((d) => (
            <DishRow key={d.id} dish={d} restaurantId={restaurant.id} onLiked={handleDishLiked} />
          ))}
          {restaurant.dishes.length === 0 && (
            <p className="text-sm text-nyuad-500">No dishes added yet.</p>
          )}
        </ul>
        {user ? (
          <AddDishForm restaurantId={restaurant.id} onAdded={handleDishAdded} />
        ) : (
          <p className="mt-3 text-sm text-nyuad-500">
            <Link to="/login" className="text-nyuad-700 underline">
              Log in
            </Link>{' '}
            to add a dish or like your favorites.
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-nyuad-950">Reviews</h2>

        <div className="mt-3">
          {user ? (
            <ReviewForm restaurantId={restaurant.id} phrases={phrases} onAdded={handleReviewAdded} />
          ) : (
            <p className="rounded-xl border border-dashed border-nyuad-200 p-4 text-sm text-nyuad-500">
              <Link to="/login" className="text-nyuad-700 underline">
                Log in with your NYU email
              </Link>{' '}
              to leave a review.
            </p>
          )}
        </div>

        <ul className="mt-4 space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-nyuad-100 p-4">
              <div className="flex items-center justify-between">
                <StarRating value={r.stars} />
                <span className="text-xs text-nyuad-500">{r.author_name}</span>
              </div>
              {r.nyuad_phrase && (
                <span className="mt-1 inline-block rounded-full bg-nyuad-100 px-2.5 py-0.5 text-xs font-medium text-nyuad-800">
                  {r.nyuad_phrase}
                </span>
              )}
              {r.text && <p className="mt-2 text-sm text-nyuad-800">{r.text}</p>}
            </li>
          ))}
          {reviews.length === 0 && <p className="text-sm text-nyuad-500">No reviews yet — be the first!</p>}
        </ul>
      </section>
    </div>
  );
}
