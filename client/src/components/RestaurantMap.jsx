import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PriceTag from './PriceTag';

const NYUAD_CENTER = [24.5335, 54.438];

const TIER_COLORS = {
  swipe: '#0f9d58',
  topup: '#57068c',
  splurge: '#b8860b',
};

function restaurantIcon(tier, isActive) {
  const color = TIER_COLORS[tier] || '#57068c';
  const size = isActive ? 30 : 22;
  return divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const stopIcon = divIcon({
  className: '',
  html: `<div style="
    width:14px;height:14px;border-radius:50%;
    background:white;border:3px solid #57068c;box-shadow:0 1px 3px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function FlyToActive({ restaurant }) {
  const map = useMap();
  useEffect(() => {
    if (restaurant) {
      map.flyTo([restaurant.lat, restaurant.lng], Math.max(map.getZoom(), 13), { duration: 0.5 });
    }
  }, [restaurant, map]);
  return null;
}

export default function RestaurantMap({ restaurants, activeId, onMarkerHover, showShuttles, shuttleData }) {
  const active = restaurants.find((r) => r.id === activeId);

  return (
    <MapContainer center={NYUAD_CENTER} zoom={12} className="h-full w-full rounded-xl">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {showShuttles &&
        shuttleData?.routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.path}
            pathOptions={{ color: route.color, weight: 4, opacity: 0.75, dashArray: '1 8' }}
          />
        ))}

      {showShuttles &&
        shuttleData?.stops.map((stop) => (
          <Marker key={`stop-${stop.id}`} position={[stop.lat, stop.lng]} icon={stopIcon}>
            <Popup>
              <strong>{stop.name}</strong>
              <br />
              Shuttle stop
            </Popup>
          </Marker>
        ))}

      {restaurants.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={restaurantIcon(r.price_tier?.key, r.id === activeId)}
          eventHandlers={{
            mouseover: () => onMarkerHover?.(r.id),
            mouseout: () => onMarkerHover?.(null),
          }}
        >
          <Popup>
            <div className="min-w-[160px]">
              <p className="font-semibold text-nyuad-950">{r.name}</p>
              <p className="text-xs text-nyuad-600">{r.cuisine}</p>
              <div className="mt-1">
                <PriceTag priceTier={r.price_tier} avgPrice={r.avg_meal_price_aed} />
              </div>
              <Link to={`/restaurants/${r.id}`} className="mt-2 inline-block text-xs font-medium text-nyuad-700 underline">
                View details
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}

      <FlyToActive restaurant={active} />
    </MapContainer>
  );
}
