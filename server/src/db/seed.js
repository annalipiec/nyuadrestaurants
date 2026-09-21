// Seeds the database with illustrative example data so the app is usable out of the box.
//
// IMPORTANT: The restaurants, prices, and reviews below are DEMO/PLACEHOLDER content
// meant to show the app working end-to-end. They are not a verified, first-hand list
// from NYUAD students. Before real launch, replace this with your and your friends'
// actual knowledge (or let the community submit it via "Add a restaurant" once seeded
// users start reviewing). Shuttle stop coordinates are approximate/illustrative too —
// swap in the real current shuttle schedule/route from NYUAD Campus Life.
import bcrypt from 'bcryptjs';
import db from './index.js';

const already = db.prepare('SELECT COUNT(*) AS c FROM restaurants').get().c;
if (already > 0) {
  console.log('Database already has data — skipping seed. Delete server/data/nyuad-eats.db to reseed.');
  process.exit(0);
}

const insertUser = db.prepare(
  `INSERT INTO users (email, name, password_hash, class_year) VALUES (?, ?, ?, ?)`
);
const demoPasswordHash = bcrypt.hashSync('nyuadeats-demo', 10);
const seedUserId = insertUser.run('eats-team@nyu.edu', 'NYUAD Eats Team', demoPasswordHash, 2026).lastInsertRowid;

const insertRoute = db.prepare(`INSERT INTO shuttle_routes (name, color, path_json) VALUES (?, ?, ?)`);
const insertStop = db.prepare(`INSERT INTO shuttle_stops (name, lat, lng, route_id) VALUES (?, ?, ?, ?)`);

const saadiyatRouteId = insertRoute.run(
  'Saadiyat ↔ Downtown Loop (example)',
  '#57068C',
  JSON.stringify([
    [24.5335, 54.4380],
    [24.5205, 54.4190],
    [24.5013, 54.3959],
    [24.4913, 54.3679],
    [24.4890, 54.3585],
  ])
).lastInsertRowid;

const yasRouteId = insertRoute.run(
  'Saadiyat ↔ Yas Island (example)',
  '#9B5DE0',
  JSON.stringify([
    [24.5335, 54.4380],
    [24.5120, 54.5200],
    [24.4913, 54.6069],
  ])
).lastInsertRowid;

const stops = {
  campus: insertStop.run('NYUAD Campus – Bus Loop', 24.5335, 54.4380, saadiyatRouteId).lastInsertRowid,
  saadiyatBeach: insertStop.run('Saadiyat Beach District', 24.5445, 54.4275, saadiyatRouteId).lastInsertRowid,
  reem: insertStop.run('Al Reem Island Stop', 24.4993, 54.4028, saadiyatRouteId).lastInsertRowid,
  hamdan: insertStop.run('Hamdan Street Stop', 24.4913, 54.3679, saadiyatRouteId).lastInsertRowid,
  downtown: insertStop.run('Downtown / Electra Street Stop', 24.4890, 54.3585, saadiyatRouteId).lastInsertRowid,
  yas: insertStop.run('Yas Mall Stop', 24.4913, 54.6069, yasRouteId).lastInsertRowid,
};

const insertRestaurant = db.prepare(`
  INSERT INTO restaurants
    (name, cuisine, neighborhood, address, lat, lng, avg_meal_price_aed, description, happy_hour_info, nearest_shuttle_stop_id, submitted_by, verified)
  VALUES (@name, @cuisine, @neighborhood, @address, @lat, @lng, @avg_meal_price_aed, @description, @happy_hour_info, @nearest_shuttle_stop_id, @submitted_by, 1)
`);
const insertDish = db.prepare(
  `INSERT INTO dishes (restaurant_id, name, price_aed, added_by) VALUES (?, ?, ?, ?)`
);
const insertReview = db.prepare(
  `INSERT INTO reviews (restaurant_id, user_id, stars, nyuad_phrase, text) VALUES (?, ?, ?, ?, ?)`
);

const restaurants = [
  {
    name: 'Automatic Restaurant',
    cuisine: 'Lebanese',
    neighborhood: 'Hamdan Street',
    address: 'Hamdan Street, Abu Dhabi',
    lat: 24.4908, lng: 54.3701,
    avg_meal_price_aed: 28,
    description: 'Reliable Lebanese chain — mezze, grills, and shawarma at student-friendly prices.',
    happy_hour_info: null,
    nearest_shuttle_stop_id: stops.hamdan,
    dishes: [['Chicken Shawarma Wrap', 12], ['Hummus with Meat', 22], ['Mixed Grill Platter', 45]],
  },
  {
    name: 'Zaroob',
    cuisine: 'Levantine Street Food',
    neighborhood: 'Al Reem Island',
    address: 'City Walk, Al Reem Island',
    lat: 24.4975, lng: 54.4055,
    avg_meal_price_aed: 30,
    description: 'Open-late Levantine street food spot — good for a quick bite between shuttle rides.',
    happy_hour_info: null,
    nearest_shuttle_stop_id: stops.reem,
    dishes: [['Falafel Sandwich', 10], ['Knefeh', 15], ['Chicken Fatteh', 32]],
  },
  {
    name: 'Filli Café',
    cuisine: 'Karak & Sandwiches',
    neighborhood: 'Downtown',
    address: 'Electra Street, Abu Dhabi',
    lat: 24.4884, lng: 54.3579,
    avg_meal_price_aed: 14,
    description: 'The go-to for cheap karak and paratha sandwiches on a budget day.',
    happy_hour_info: null,
    nearest_shuttle_stop_id: stops.downtown,
    dishes: [['Karak Chai', 2], ['Chicken Tikka Sandwich', 9], ['Cheese Paratha Roll', 8]],
  },
  {
    name: "Al Mallah",
    cuisine: 'Arabic / Grills',
    neighborhood: 'Khalidiya',
    address: 'Khalidiya Street, Abu Dhabi',
    lat: 24.4732, lng: 54.3316,
    avg_meal_price_aed: 26,
    description: 'Classic Arabic grill house popular for late dinners with a big group.',
    happy_hour_info: null,
    nearest_shuttle_stop_id: stops.downtown,
    dishes: [['Shish Tawook', 24], ['Fattoush Salad', 14], ['Fresh Juice', 10]],
  },
  {
    name: 'Lebanese Flower',
    cuisine: 'Lebanese',
    neighborhood: 'Al Bateen',
    address: 'Al Bateen, Abu Dhabi',
    lat: 24.4590, lng: 54.3288,
    avg_meal_price_aed: 35,
    description: 'Sit-down Lebanese favorite — slightly pricier but great for a special weekend dinner.',
    happy_hour_info: null,
    nearest_shuttle_stop_id: stops.downtown,
    dishes: [['Mixed Mezze', 40], ['Grilled Kofta', 38], ['Baklava', 18]],
  },
  {
    name: 'Karachi Darbar',
    cuisine: 'Pakistani / South Asian',
    neighborhood: 'Tourist Club Area',
    address: 'Al Zahiyah, Abu Dhabi',
    lat: 24.5013, lng: 54.3745,
    avg_meal_price_aed: 20,
    description: 'Big portions of biryani and karahi — easily shareable between two people to save more.',
    happy_hour_info: null,
    nearest_shuttle_stop_id: stops.downtown,
    dishes: [['Chicken Biryani', 15], ['Chicken Karahi (half)', 35], ['Naan', 3]],
  },
  {
    name: 'Wild Bites Food Truck',
    cuisine: 'Burgers & Fries',
    neighborhood: 'Saadiyat',
    address: 'Saadiyat Beach District, Abu Dhabi',
    lat: 24.5450, lng: 54.4290,
    avg_meal_price_aed: 32,
    description: 'Closest good burger option to campus — walkable from the Saadiyat Beach shuttle stop.',
    happy_hour_info: null,
    nearest_shuttle_stop_id: stops.saadiyatBeach,
    dishes: [['Classic Cheeseburger', 25], ['Loaded Fries', 18], ['Milkshake', 15]],
  },
  {
    name: 'Al Fanar Restaurant & Café',
    cuisine: 'Emirati',
    neighborhood: 'Al Bateen',
    address: 'Al Bateen Marina, Abu Dhabi',
    lat: 24.4610, lng: 54.3245,
    avg_meal_price_aed: 55,
    description: 'Traditional Emirati dishes in an old-Abu-Dhabi themed setting — good for visiting family.',
    happy_hour_info: null,
    nearest_shuttle_stop_id: stops.downtown,
    dishes: [['Machboos', 48], ['Luqaimat', 20], ['Karak Karak', 12]],
  },
  {
    name: 'Salt',
    cuisine: 'Burgers',
    neighborhood: 'Al Bateen',
    address: 'Al Bateen Marina, Abu Dhabi',
    lat: 24.4605, lng: 54.3255,
    avg_meal_price_aed: 60,
    description: 'Popular waterfront burger spot — a step up in price, save it for a weekend treat.',
    happy_hour_info: null,
    nearest_shuttle_stop_id: stops.downtown,
    dishes: [['Salt Signature Burger', 45], ['Truffle Fries', 32]],
  },
  {
    name: "Man'oushe Street",
    cuisine: 'Lebanese Bakery',
    neighborhood: 'Hamdan Street',
    address: 'Hamdan Street, Abu Dhabi',
    lat: 24.4920, lng: 54.3690,
    avg_meal_price_aed: 16,
    description: 'Fast, cheap manakish and man’oushe — great for breakfast before an early shuttle.',
    happy_hour_info: null,
    nearest_shuttle_stop_id: stops.hamdan,
    dishes: [['Cheese Manakish', 8], ['Zaatar Manakish', 6], ['Halloumi Wrap', 14]],
  },
  {
    name: 'Yum! Asian Kitchen',
    cuisine: 'Pan-Asian',
    neighborhood: 'Al Reem Island',
    address: 'Al Reem Island, Abu Dhabi',
    lat: 24.4965, lng: 54.4040,
    avg_meal_price_aed: 38,
    description: 'Solid noodle and rice bowls — good happy hour on weekday afternoons.',
    happy_hour_info: 'Weekdays 3–6 PM: 20% off all rice and noodle bowls.',
    nearest_shuttle_stop_id: stops.reem,
    dishes: [['Pad Thai', 32], ['Chicken Fried Rice', 28], ['Spring Rolls', 16]],
  },
  {
    name: 'Cabin Coffee',
    cuisine: 'Café',
    neighborhood: 'Downtown',
    address: 'Electra Street, Abu Dhabi',
    lat: 24.4878, lng: 54.3595,
    avg_meal_price_aed: 19,
    description: 'Budget café good for a coffee-and-croissant study break downtown.',
    happy_hour_info: null,
    nearest_shuttle_stop_id: stops.downtown,
    dishes: [['Flat White', 14], ['Croissant', 9], ['Club Sandwich', 24]],
  },
  {
    name: 'Yas Bay Grill House',
    cuisine: 'Grills',
    neighborhood: 'Yas Island',
    address: 'Yas Bay Waterfront, Abu Dhabi',
    lat: 24.4715, lng: 54.6080,
    avg_meal_price_aed: 65,
    description: 'Worth the trip to Yas for a birthday dinner — waterfront seating.',
    happy_hour_info: 'Sun–Thu 4–6 PM: free mocktail with any grill platter.',
    nearest_shuttle_stop_id: stops.yas,
    dishes: [['Mixed Grill for Two', 120], ['Grilled Halloumi', 28]],
  },
  {
    name: 'Bait el Khetyar',
    cuisine: 'Emirati / Yemeni',
    neighborhood: 'Khalidiya',
    address: 'Khalidiya, Abu Dhabi',
    lat: 24.4745, lng: 54.3330,
    avg_meal_price_aed: 24,
    description: 'Cheap and filling Yemeni mandi — a favorite for big group dinners on a budget.',
    happy_hour_info: null,
    nearest_shuttle_stop_id: stops.downtown,
    dishes: [['Chicken Mandi', 22], ['Lamb Mandi', 30], ['Fattah', 20]],
  },
];

const reviewTemplates = [
  [5, 'Would shuttle back for this', 'Went with the whole floor after finals and it did not disappoint.'],
  [4, 'First-week find', 'Found this in my first month and still come back a lot.'],
  [5, 'Group dinner, split the bill', 'Great for splitting a bunch of dishes with friends.'],
  [3, 'Study break treat', 'Decent, a bit far from campus but fine for a change of scenery.'],
];

const restaurantIdByName = {};
for (const r of restaurants) {
  const { dishes, ...row } = r;
  const id = insertRestaurant.run({ ...row, submitted_by: seedUserId }).lastInsertRowid;
  restaurantIdByName[r.name] = id;
  for (const [dishName, price] of dishes) {
    insertDish.run(id, dishName, price, seedUserId);
  }
  const [stars, phrase, text] = reviewTemplates[id % reviewTemplates.length];
  insertReview.run(id, seedUserId, stars, phrase, text);
}

console.log(`Seeded ${restaurants.length} restaurants, shuttle stops, and demo reviews.`);
