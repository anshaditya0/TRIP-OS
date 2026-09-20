import { 
  DiningOption, ExhaustionData, HotelStay, ItineraryPlan, 
  RouteWaypoint, SightItem, TransportMode, WeatherType, DayPlan, MoodMeterConfig 
} from '../types';

export interface GenerateParams {
  fromLocation: string;
  toLocation: string;
  preferredDestination?: string;
  finalDestination?: string;
  dailyStartTime?: string;
  friendsCount: number;
  budget: number;
  transportMode: TransportMode;
  preferredActivities?: string[];
  weatherType?: WeatherType;
  moodMeter?: MoodMeterConfig;
  startDate?: string;
  durationDays?: number;
}

// Known coordinates for Indian Hubs
export const CITY_COORDINATES: Record<string, { lat: number; lng: number; x: number; y: number }> = {
  delhi: { lat: 28.6139, lng: 77.2090, x: 42, y: 28 },
  mumbai: { lat: 19.0760, lng: 72.8777, x: 30, y: 56 },
  bangalore: { lat: 12.9716, lng: 77.5946, x: 44, y: 76 },
  goa: { lat: 15.2993, lng: 74.1240, x: 34, y: 68 },
  manali: { lat: 32.2432, lng: 77.1892, x: 42, y: 18 },
  jaipur: { lat: 26.9124, lng: 75.7873, x: 38, y: 36 },
  varanasi: { lat: 25.3176, lng: 82.9739, x: 62, y: 44 },
  munnar: { lat: 10.0889, lng: 77.0595, x: 45, y: 88 },
  ladakh: { lat: 34.1526, lng: 77.5771, x: 44, y: 10 },
  kolkata: { lat: 22.5726, lng: 88.3639, x: 74, y: 50 },
  hyderabad: { lat: 17.3850, lng: 78.4867, x: 48, y: 62 },
  chennai: { lat: 13.0827, lng: 80.2707, x: 54, y: 78 },
  udaipur: { lat: 24.5854, lng: 73.7125, x: 34, y: 42 },
  rishikesh: { lat: 30.0869, lng: 78.2676, x: 45, y: 24 },
  amritsar: { lat: 31.6340, lng: 74.8723, x: 36, y: 20 },
  coorg: { lat: 12.3375, lng: 75.8069, x: 40, y: 78 }
};

export function getCoordinates(cityName: string): { lat: number; lng: number } {
  const clean = cityName.toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return { lat: coords.lat, lng: coords.lng };
    }
  }
  // Default to central India (Nagpur / MP) if unrecognized
  return { lat: 21.1458, lng: 79.0882 };
}

// Distance approximation between hubs in KM
const CITY_DISTANCES: Record<string, Record<string, number>> = {
  delhi: { goa: 1880, manali: 530, jaipur: 280, varanasi: 820, munnar: 2500, ladakh: 1020, mumbai: 1420, udaipur: 660, rishikesh: 240 },
  mumbai: { goa: 590, manali: 1950, jaipur: 1150, varanasi: 1520, munnar: 1380, ladakh: 2360, delhi: 1420, udaipur: 750, rishikesh: 1650 },
  bangalore: { goa: 560, manali: 2580, jaipur: 2050, varanasi: 1820, munnar: 480, ladakh: 3050, delhi: 2170, coorg: 260, hyderabad: 570 },
  varanasi: { goa: 1850, manali: 1250, jaipur: 850, delhi: 820, munnar: 2300, ladakh: 1650, mumbai: 1520, kolkata: 680, rishikesh: 790 },
  kolkata: { varanasi: 680, delhi: 1530, goa: 2100, manali: 2050, munnar: 2350, jaipur: 1510, ladakh: 2550 }
};

export function estimateDistanceKm(from: string, to: string): number {
  const fromClean = from.toLowerCase().trim();
  const toClean = to.toLowerCase().trim();

  for (const [keyFrom, targets] of Object.entries(CITY_DISTANCES)) {
    if (fromClean.includes(keyFrom)) {
      for (const [keyTo, dist] of Object.entries(targets)) {
        if (toClean.includes(keyTo)) return dist;
      }
    }
    if (toClean.includes(keyFrom)) {
      for (const [keyTo, dist] of Object.entries(targets)) {
        if (fromClean.includes(keyTo)) return dist;
      }
    }
  }

  // Haversine formula based on coordinates if distance matrix misses
  const c1 = getCoordinates(from);
  const c2 = getCoordinates(to);
  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLon = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const directDistance = Math.round(R * c);
  // Add 25% road curvature factor for realistic land travel
  return Math.max(120, Math.round(directDistance * 1.25));
}

export function calculateExhaustion(
  distanceKm: number, 
  transport: TransportMode,
  activities: string[] = [],
  mood?: MoodMeterConfig
): ExhaustionData {
  let modeFactor = 1.0;
  let travelHours = 8;
  let transitStrain = 50;

  switch (transport) {
    case 'flight':
      modeFactor = 0.32;
      travelHours = Math.max(1.5, Math.round((distanceKm / 550) * 10) / 10);
      transitStrain = 25;
      break;
    case 'train':
      modeFactor = 0.62;
      travelHours = Math.max(4, Math.round((distanceKm / 75) * 10) / 10);
      transitStrain = 55;
      break;
    case 'roadtrip':
      modeFactor = 0.95;
      travelHours = Math.max(4, Math.round((distanceKm / 55) * 10) / 10);
      transitStrain = 75;
      break;
    case 'bike':
      modeFactor = 1.5;
      travelHours = Math.max(5, Math.round((distanceKm / 40) * 10) / 10);
      transitStrain = 95;
      break;
  }

  // Base physical strain
  let physicalStrain = 35;
  const acts = activities.map(a => a.toUpperCase());
  if (acts.some(a => a.includes('TREK') || a.includes('ADVENTURE') || a.includes('SPORTS'))) {
    physicalStrain += 30;
  }
  if (acts.some(a => a.includes('NIGHTLIFE') || a.includes('BEACH'))) {
    physicalStrain += 15;
  }
  if (acts.some(a => a.includes('HERITAGE') || a.includes('GHATS'))) {
    physicalStrain += 15;
  }
  if (acts.some(a => a.includes('WELLNESS') || a.includes('YOGA') || a.includes('LEISURE'))) {
    physicalStrain = Math.max(20, physicalStrain - 20);
  }

  // If dynamic Mood Meter is supplied, refine strain & transit impact with biometric precision
  if (mood) {
    // Adventure (0-100) & Walking Tolerance (0-100) are primary drivers of physical strain
    const adventureFactor = (mood.adventure / 100) * 35;
    const walkingFactor = (mood.walkingTolerance / 100) * 35;
    const nightlifeFactor = (mood.nightlife / 100) * 15;
    const crowdFactor = (mood.crowdTolerance / 100) * 15;
    const relaxationOffset = (mood.relaxation / 100) * 30;

    physicalStrain = Math.round(15 + adventureFactor + walkingFactor + nightlifeFactor + crowdFactor - relaxationOffset);
    physicalStrain = Math.max(10, Math.min(100, physicalStrain));

    // Budget sensitivity also affects transit fatigue (frugal travelers take longer, less cushioned routes)
    if (mood.budgetSensitivity > 70 && transport !== 'flight') {
      transitStrain = Math.min(100, transitStrain + 10);
    }
  } else {
    physicalStrain = Math.min(100, Math.max(10, physicalStrain));
  }

  // Overall combined score (0 - 100)
  const distanceScore = Math.min(50, (distanceKm / 1800) * 50);
  const rawScore = Math.round((distanceScore * modeFactor) + (transitStrain * 0.38) + (physicalStrain * 0.42));
  const score = Math.min(100, Math.max(12, rawScore));
  const recoveryScore = Math.max(10, 100 - score);

  let level: ExhaustionData['level'] = 'RELAXED';
  let color = '#10b981'; // emerald-500
  let gradient = 'from-emerald-400 via-teal-500 to-emerald-600';
  let description = 'EASY BREEZE • AMPLE TIME FOR LEISURE STROLLS, ROOFTOP DINING & RESTFUL SLEEP';
  let recoveryTips = [
    'Enjoy relaxed morning brunches after 09:30 AM',
    'Stay hydrated with tender coconut water & fresh lemon soda',
    'Schedule a 45-minute afternoon siesta before evening activities'
  ];

  if (score > 85) {
    level = 'EXTREME TREKKER';
    color = '#dc2626'; // red-600
    gradient = 'from-red-600 via-rose-600 to-amber-600';
    description = 'HIGH FATIGUE WARNING • RUGGED ENDURANCE WITH EXTENSIVE COMMUTES & PHYSICAL STRAIN';
    recoveryTips = [
      'Carry ORS electrolytes and high-protein snack bars at all times',
      'Wear ankle-supported trekking boots with cushioned wool socks',
      'Mandatory 8+ hours deep sleep; avoid late night parties on transfer days',
      'Plan dedicated recovery halts every 3 hours of road transit'
    ];
  } else if (score > 70) {
    level = 'HIGH PACE';
    color = '#ea580c'; // orange-600
    gradient = 'from-orange-500 via-amber-500 to-red-500';
    description = 'PACKED ACTION • FAST-PACED ITINERARY REQUIRING EARLY RISES AND TIGHT TRANSFERS';
    recoveryTips = [
      'Pre-book auto-rickshaws or cabs to avoid exhausting transit waits',
      'Take 15-minute shaded bench breaks between monument tours',
      'Hydrate with mineral water; pack compact foot massage balm'
    ];
  } else if (score > 48) {
    level = 'ACTIVE';
    color = '#f59e0b'; // amber-500
    gradient = 'from-amber-400 via-yellow-500 to-orange-500';
    description = 'DYNAMIC EXPLORATION • BALANCED SIGHTSEEING WITH MODERATE WALKING & SIGHTSEEING';
    recoveryTips = [
      'Wear breathable cotton shoes for fort and temple staircases',
      'Pace afternoon market shopping when sun intensity is lower',
      'Balance street food tasting with fresh fruit juices'
    ];
  } else if (score > 30) {
    level = 'MODERATE';
    color = '#84cc16'; // lime-500
    gradient = 'from-lime-400 via-emerald-500 to-teal-500';
    description = 'COMFORTABLE RHYTHM • WELL-SPACED STOPS, SCENIC TRANSIT AND BALANCED REST';
    recoveryTips = [
      'Light morning stretching before departing hotel',
      'Sip herbal tea or local chai during sunset halts',
      'Enjoy unhurried dinners with regional music'
    ];
  }

  return {
    score,
    level,
    color,
    gradient,
    description,
    travelDistanceKm: distanceKm,
    travelTimeHours: travelHours,
    paceFactor: `${travelHours} hrs transit via ${transport.toUpperCase()}`,
    physicalStrain,
    transitStrain,
    recoveryScore,
    recoveryTips
  };
}

export function detectWeatherType(destination: string): WeatherType {
  const dest = destination.toLowerCase();
  if (
    dest.includes('manali') ||
    dest.includes('ladakh') ||
    dest.includes('spiti') ||
    dest.includes('shimla') ||
    dest.includes('kashmir') ||
    dest.includes('gulmarg') ||
    dest.includes('leh')
  ) {
    return 'snow';
  }
  if (
    dest.includes('munnar') ||
    dest.includes('kerala') ||
    dest.includes('wayanad') ||
    dest.includes('coorg') ||
    dest.includes('ooty') ||
    dest.includes('rishikesh') ||
    dest.includes('darjeeling')
  ) {
    return 'nature';
  }
  if (
    dest.includes('varanasi') ||
    dest.includes('cherrapunji') ||
    dest.includes('meghalaya') ||
    dest.includes('kolkata') ||
    dest.includes('rain')
  ) {
    return 'rain';
  }
  return 'sunny';
}

// Destination-specific curated databases for intelligent fallback / offline generation
interface DestinationContent {
  sights: SightItem[];
  dining: DiningOption[];
  hotels: HotelStay[];
  shopping: { item: string; market: string; priceRange: string }[];
}

const DESTINATION_KNOWLEDGE_BASE: Record<string, DestinationContent> = {
  goa: {
    sights: [
      {
        name: 'Palolem Beach Crescent',
        category: 'BEACH & WATERSPORTS',
        timing: 'Open 24 Hours',
        entryFee: 0,
        bookingLink: 'https://goatourism.gov.in',
        description: 'Pristine crescent bay with gentle turquoise waves, kayaking, and sunset beach shacks.',
        rating: 4.8,
        lat: 15.0100,
        lng: 74.0232,
        googleMapsUrl: 'https://maps.google.com/?q=Palolem+Beach+Goa'
      },
      {
        name: 'Fontainhas Latin Quarter',
        category: 'PORTUGUESE HERITAGE',
        timing: '08:00 AM - 07:00 PM',
        entryFee: 0,
        bookingLink: 'https://goatourism.gov.in',
        description: 'Vibrant narrow alleys lined with centuries-old Portuguese villas and terracotta roofs.',
        rating: 4.9,
        lat: 15.4989,
        lng: 73.8320,
        googleMapsUrl: 'https://maps.google.com/?q=Fontainhas+Panaji+Goa'
      },
      {
        name: 'Aguada Fort & Lighthouse',
        category: '17TH CENTURY CITADEL',
        timing: '09:00 AM - 05:30 PM',
        entryFee: 50,
        bookingLink: 'https://asi.nic.in',
        description: 'Iconic clifftop Portuguese bastion offering panoramic Arabian Sea vistas.',
        rating: 4.7,
        lat: 15.4925,
        lng: 73.7736,
        googleMapsUrl: 'https://maps.google.com/?q=Aguada+Fort+Goa'
      },
      {
        name: 'Dudhsagar 4-Tier Waterfalls',
        category: 'NATURE TREK',
        timing: '06:00 AM - 04:00 PM',
        entryFee: 500,
        bookingLink: 'https://goatourism.gov.in',
        description: 'Spectacular 310m cascade rushing under the historic railway bridge in Bhagwan Mahaveer Sanctuary.',
        rating: 4.8,
        lat: 15.3144,
        lng: 74.3143,
        googleMapsUrl: 'https://maps.google.com/?q=Dudhsagar+Falls+Goa'
      }
    ],
    dining: [
      {
        id: 'dine-goa-1',
        name: 'Fisherman’s Wharf',
        cuisine: 'Authentic Goan Seafood & Coastal Curries',
        famousDish: 'Butter Garlic King Prawns & Fish Curry Thali',
        avgCostPerPerson: 850,
        mealType: 'LUNCH',
        rating: 4.8,
        location: 'Cavelossim Riverside',
        googleMapsUrl: 'https://maps.google.com/?q=Fishermans+Wharf+Cavelossim+Goa'
      },
      {
        id: 'dine-goa-2',
        name: 'Confeitaria 31 De Janeiro',
        cuisine: 'Traditional Portuguese Bakery & Coffee',
        famousDish: 'Bebinca & Warm Goan Poee with Cheese',
        avgCostPerPerson: 250,
        mealType: 'BREAKFAST',
        rating: 4.9,
        location: 'Fontainhas, Panaji',
        googleMapsUrl: 'https://maps.google.com/?q=Confeitaria+31+De+Janeiro+Panaji'
      },
      {
        id: 'dine-goa-3',
        name: 'Curlies Beach Shack & Sunset Bar',
        cuisine: 'Continental, Woodfired Pizzas & Fresh Mocktails',
        famousDish: 'Seafood Sizzler & Calamari Peri Peri',
        avgCostPerPerson: 700,
        mealType: 'DINNER',
        rating: 4.6,
        location: 'South Anjuna Beach',
        googleMapsUrl: 'https://maps.google.com/?q=Curlies+Anjuna+Goa'
      },
      {
        id: 'dine-goa-4',
        name: 'Mapusa Street Food Corner',
        cuisine: 'Goan Street Snacks & Chai',
        famousDish: 'Spicy Ros Omelette with Crusty Pao',
        avgCostPerPerson: 120,
        mealType: 'STREET_FOOD',
        rating: 4.7,
        location: 'Mapusa Market Square',
        googleMapsUrl: 'https://maps.google.com/?q=Mapusa+Market+Goa'
      }
    ],
    hotels: [
      {
        id: 'stay-goa-1',
        name: 'W GOA CLIFFSIDE RETREAT',
        type: 'HERITAGE RESORT',
        rating: 4.8,
        pricePerNight: 12500,
        bookingLink: 'https://www.booking.com/searchresults.html?ss=W+Goa',
        features: ['Rock Pool', 'Private Beach Access', 'Spa', 'Breakfast Included'],
        badge: 'LUXURY SEASIDE',
        distanceFromCenter: '0.4 km from Vagator Beach',
        lat: 15.6026,
        lng: 73.7340,
        googleMapsUrl: 'https://maps.google.com/?q=W+Goa+Vagator'
      },
      {
        id: 'stay-goa-2',
        name: 'ZOSTEL PALOLEM BOUTIQUE PG & PODS',
        type: 'BOUTIQUE PG',
        rating: 4.7,
        pricePerNight: 2200,
        bookingLink: 'https://www.zostel.com/zostel/goa-palolem/',
        features: ['Social Lounge', 'Coworking Cafe', 'Bike Rentals', 'AC Dorms & Privates'],
        badge: 'TOP FRIENDS PICK',
        distanceFromCenter: '200m from Palolem Beach',
        lat: 15.0110,
        lng: 74.0245,
        googleMapsUrl: 'https://maps.google.com/?q=Zostel+Palolem+Goa'
      },
      {
        id: 'stay-goa-3',
        name: 'CASA BONITA HERITAGE HOMESTAY',
        type: 'HOMESTAY',
        rating: 4.9,
        pricePerNight: 4200,
        bookingLink: 'https://www.airbnb.com/s/Goa/homes',
        features: ['Garden Courtyard', 'Heritage Furnishings', 'Homemade Breakfast'],
        badge: 'AUTHENTIC PORTUGUESE',
        distanceFromCenter: 'In Fontainhas, Panaji',
        lat: 15.4980,
        lng: 73.8325,
        googleMapsUrl: 'https://maps.google.com/?q=Fontainhas+Homestay+Goa'
      }
    ],
    shopping: [
      { item: 'Bohemian linen shirts & resort wear', market: 'Anjuna Flea Market', priceRange: '₹400 - ₹1200' },
      { item: 'Goan Jumbo Cashews & Spices', market: 'Mapusa Municipal Market', priceRange: '₹600 - ₹1400/kg' },
      { item: 'Handmade Azulejos Ceramic Tiles', market: 'Panjim Craft Center', priceRange: '₹800 - ₹2500' }
    ]
  },
  manali: {
    sights: [
      {
        name: 'Solang Valley Adventure Plateau',
        category: 'SNOW SPORTS & PARAGLIDING',
        timing: '09:00 AM - 06:00 PM',
        entryFee: 100,
        bookingLink: 'https://himachaltourism.gov.in',
        description: 'Vast alpine bowl offering paragliding, zorbing, skiing, and snow scooter rides.',
        rating: 4.8,
        lat: 32.3167,
        lng: 77.1583,
        googleMapsUrl: 'https://maps.google.com/?q=Solang+Valley+Manali'
      },
      {
        name: 'Hadimba Wooden Temple',
        category: 'HIMALAYAN HERITAGE',
        timing: '08:00 AM - 06:00 PM',
        entryFee: 0,
        bookingLink: 'https://himachaltourism.gov.in',
        description: '16th-century pagoda-style cedar temple surrounded by towering deodar pine forest.',
        rating: 4.7,
        lat: 32.2483,
        lng: 77.1706,
        googleMapsUrl: 'https://maps.google.com/?q=Hadimba+Temple+Manali'
      },
      {
        name: 'Atal Tunnel & Sissu Waterfall',
        category: 'ENGINEERING & GLACIAL VALLEY',
        timing: '07:00 AM - 06:00 PM',
        entryFee: 0,
        bookingLink: 'https://himachaltourism.gov.in',
        description: 'World’s longest highway tunnel above 10,000 feet leading into the stark Lahaul valley.',
        rating: 4.9,
        lat: 32.3639,
        lng: 77.1328,
        googleMapsUrl: 'https://maps.google.com/?q=Atal+Tunnel+Manali'
      },
      {
        name: 'Jogini Waterfalls & Vashisht Hot Springs',
        category: 'NATURAL WONDER & TREK',
        timing: '06:00 AM - 05:00 PM',
        entryFee: 0,
        bookingLink: 'https://himachaltourism.gov.in',
        description: 'Scenic 45-minute pine trail to cascading mountain torrents with natural sulfur thermal baths.',
        rating: 4.8,
        lat: 32.2644,
        lng: 77.1889,
        googleMapsUrl: 'https://maps.google.com/?q=Jogini+Falls+Manali'
      }
    ],
    dining: [
      {
        id: 'dine-manali-1',
        name: 'Cafe 1947',
        cuisine: 'Italian, Woodfired Pizzas & Live Acoustic',
        famousDish: 'Thin Crust Truffle Pizza & Mulled Wine / Cider',
        avgCostPerPerson: 650,
        mealType: 'DINNER',
        rating: 4.8,
        location: 'Old Manali Bridge',
        googleMapsUrl: 'https://maps.google.com/?q=Cafe+1947+Old+Manali'
      },
      {
        id: 'dine-manali-2',
        name: 'The Lazy Dog Lounge',
        cuisine: 'Himalayan Trout & Continental Breakfast',
        famousDish: 'Pan-fried River Trout with Lemon Butter & Pancakes',
        avgCostPerPerson: 550,
        mealType: 'BREAKFAST',
        rating: 4.7,
        location: 'Old Manali Manu Temple Road',
        googleMapsUrl: 'https://maps.google.com/?q=The+Lazy+Dog+Manali'
      },
      {
        id: 'dine-manali-3',
        name: 'Chopsticks Restaurant',
        cuisine: 'Tibetan & Bhutanese Comfort Food',
        famousDish: 'Steamed Mutton Momos & Piping Hot Thukpa',
        avgCostPerPerson: 380,
        mealType: 'LUNCH',
        rating: 4.7,
        location: 'Mall Road Central',
        googleMapsUrl: 'https://maps.google.com/?q=Chopsticks+Mall+Road+Manali'
      },
      {
        id: 'dine-manali-4',
        name: 'Vashisht Herbal Tea Corner',
        cuisine: 'Himalayan Street Chai & Siddu',
        famousDish: 'Traditional Steamed Himachali Siddu with Pure Ghee',
        avgCostPerPerson: 100,
        mealType: 'STREET_FOOD',
        rating: 4.8,
        location: 'Vashisht Temple Square',
        googleMapsUrl: 'https://maps.google.com/?q=Vashisht+Village+Manali'
      }
    ],
    hotels: [
      {
        id: 'stay-manali-1',
        name: 'THE ALPINE CHALET & RESORT',
        type: 'HERITAGE RESORT',
        rating: 4.8,
        pricePerNight: 9500,
        bookingLink: 'https://www.booking.com/searchresults.html?ss=Manali+Resort',
        features: ['Snow Peak Balcony Views', 'Heated Rooms', 'Bonfire Garden', 'Buffet Breakfast'],
        badge: 'TOP LUXURY MOUNTAIN',
        distanceFromCenter: '2 km from Mall Road',
        lat: 32.2510,
        lng: 77.1920,
        googleMapsUrl: 'https://maps.google.com/?q=Manali+Resorts'
      },
      {
        id: 'stay-manali-2',
        name: 'ZOSTEL OLD MANALI BACKPACKER VILLA',
        type: 'BOUTIQUE PG',
        rating: 4.7,
        pricePerNight: 1800,
        bookingLink: 'https://www.zostel.com/zostel/manali/',
        features: ['Apple Orchard Terrace', 'Rooftop Cafe', 'Guitar & Games Lounge', 'High-speed WiFi'],
        badge: 'SOLO & FRIENDS FAVORITE',
        distanceFromCenter: 'In Old Manali',
        lat: 32.2530,
        lng: 77.1780,
        googleMapsUrl: 'https://maps.google.com/?q=Zostel+Old+Manali'
      },
      {
        id: 'stay-manali-3',
        name: 'PINE VALLEY CEDAR HOMESTAY',
        type: 'HOMESTAY',
        rating: 4.9,
        pricePerNight: 3400,
        bookingLink: 'https://www.airbnb.com/s/Manali/homes',
        features: ['Fireplace Living Room', 'Home-cooked Himachali Meals', 'Valley Balcony'],
        badge: 'COZY ALPINE IMMERSION',
        distanceFromCenter: '1.5 km from Hadimba Temple',
        lat: 32.2470,
        lng: 77.1690,
        googleMapsUrl: 'https://maps.google.com/?q=Hadimba+Homestay+Manali'
      }
    ],
    shopping: [
      { item: 'Authentic Handwoven Kullu Shawls & Caps', market: 'Himachal State Emporium, Mall Road', priceRange: '₹800 - ₹3500' },
      { item: 'Tibetan Prayer Flags & Singing Bowls', market: 'Old Manali Artisan Stalls', priceRange: '₹250 - ₹1200' },
      { item: 'Fresh Himalayan Pine Honey & Apple Jams', market: 'Tibetan Market Center', priceRange: '₹300 - ₹700' }
    ]
  },
  jaipur: {
    sights: [
      {
        name: 'Amber Fort Elephant Ridge & Sheesh Mahal',
        category: 'RAJPUTANA ARCHITECTURE',
        timing: '08:00 AM - 05:30 PM',
        entryFee: 200,
        bookingLink: 'https://asi.nic.in',
        description: 'Majestic 16th-century fortress featuring marble mirror palaces and ramparts above Maota Lake.',
        rating: 4.9,
        lat: 26.9855,
        lng: 75.8513,
        googleMapsUrl: 'https://maps.google.com/?q=Amber+Fort+Jaipur'
      },
      {
        name: 'Hawa Mahal (Palace of Winds)',
        category: 'ROYAL ICON',
        timing: '09:00 AM - 05:00 PM',
        entryFee: 50,
        bookingLink: 'https://tourism.rajasthan.gov.in',
        description: 'Five-story pink sandstone palace with 953 honeycomb windows crafted for royal breezes.',
        rating: 4.8,
        lat: 26.9239,
        lng: 75.8267,
        googleMapsUrl: 'https://maps.google.com/?q=Hawa+Mahal+Jaipur'
      },
      {
        name: 'Nahargarh Fort Sunset Overlook',
        category: 'SUNSET & CITADEL',
        timing: '10:00 AM - 08:00 PM',
        entryFee: 100,
        bookingLink: 'https://tourism.rajasthan.gov.in',
        description: 'Highest clifftop fortress overlooking the entire illuminated expanse of the Pink City.',
        rating: 4.8,
        lat: 26.9378,
        lng: 75.8156,
        googleMapsUrl: 'https://maps.google.com/?q=Nahargarh+Fort+Jaipur'
      },
      {
        name: 'City Palace & Jantar Mantar Observatory',
        category: 'HERITAGE ASTRONOMY',
        timing: '09:30 AM - 05:00 PM',
        entryFee: 300,
        bookingLink: 'https://asi.nic.in',
        description: 'UNESCO World Heritage royal palace museum with massive stone astronomical sundials.',
        rating: 4.7,
        lat: 26.9258,
        lng: 75.8236,
        googleMapsUrl: 'https://maps.google.com/?q=City+Palace+Jaipur'
      }
    ],
    dining: [
      {
        id: 'dine-jaipur-1',
        name: 'LMB (Laxmi Misthan Bhandar)',
        cuisine: 'Royal Rajasthani Thali & Desserts',
        famousDish: 'Dal Baati Churma & Ghewar',
        avgCostPerPerson: 550,
        mealType: 'LUNCH',
        rating: 4.7,
        location: 'Johari Bazaar',
        googleMapsUrl: 'https://maps.google.com/?q=LMB+Johari+Bazaar+Jaipur'
      },
      {
        id: 'dine-jaipur-2',
        name: 'The Tattoo Cafe & Lounge',
        cuisine: 'Rooftop Cafe & Continental',
        famousDish: 'Cold Brew Coffee & Woodfired Pizza with Hawa Mahal View',
        avgCostPerPerson: 400,
        mealType: 'BREAKFAST',
        rating: 4.8,
        location: 'Opposite Hawa Mahal',
        googleMapsUrl: 'https://maps.google.com/?q=The+Tattoo+Cafe+Hawa+Mahal+Jaipur'
      },
      {
        id: 'dine-jaipur-3',
        name: 'Chokhi Dhani Ethnic Resort & Village',
        cuisine: 'Traditional Rajasthani Cultural Dinner',
        famousDish: 'Ker Sangri, Bajre ki Roti, Gatte ki Sabzi & Jalebi',
        avgCostPerPerson: 1100,
        mealType: 'DINNER',
        rating: 4.8,
        location: 'Tonk Road Outskirts',
        googleMapsUrl: 'https://maps.google.com/?q=Chokhi+Dhani+Jaipur'
      },
      {
        id: 'dine-jaipur-4',
        name: 'Rawat Misthan Bhandar',
        cuisine: 'Legendary Street Snacks',
        famousDish: 'Crispy Pyaaz Kachori with Mint Chutney',
        avgCostPerPerson: 90,
        mealType: 'STREET_FOOD',
        rating: 4.9,
        location: 'Station Road',
        googleMapsUrl: 'https://maps.google.com/?q=Rawat+Misthan+Bhandar+Jaipur'
      }
    ],
    hotels: [
      {
        id: 'stay-jaipur-1',
        name: 'ALISAR HAVELI HERITAGE PALACE',
        type: 'HERITAGE RESORT',
        rating: 4.8,
        pricePerNight: 8500,
        bookingLink: 'https://www.booking.com/searchresults.html?ss=Jaipur+Haveli',
        features: ['Royal Courtyard Pool', 'Frescoed Rooms', 'Rajasthani Puppet Shows', 'Breakfast'],
        badge: 'ROYAL HAVELI PICK',
        distanceFromCenter: '1 km from City Center',
        lat: 26.9240,
        lng: 75.8010,
        googleMapsUrl: 'https://maps.google.com/?q=Alsisar+Haveli+Jaipur'
      },
      {
        id: 'stay-jaipur-2',
        name: 'ZOSTEL JAIPUR PINK CITY',
        type: 'BOUTIQUE PG',
        rating: 4.6,
        pricePerNight: 1600,
        bookingLink: 'https://www.zostel.com/zostel/jaipur/',
        features: ['Rooftop Hawa Mahal Deck', 'Common Game Zone', 'Air-Conditioned Dorms & Privates'],
        badge: 'GREAT VALUE DOWNTOWN',
        distanceFromCenter: 'Walking distance to Hawa Mahal',
        lat: 26.9230,
        lng: 75.8290,
        googleMapsUrl: 'https://maps.google.com/?q=Zostel+Jaipur'
      },
      {
        id: 'stay-jaipur-3',
        name: 'MAHARAJA ROYAL RETREAT HOMESTAY',
        type: 'HOMESTAY',
        rating: 4.9,
        pricePerNight: 3800,
        bookingLink: 'https://www.airbnb.com/s/Jaipur/homes',
        features: ['Terrace Garden', 'Authentic Home Thali', 'Heritage Decor'],
        badge: 'PERSONALIZED HOSPITALITY',
        distanceFromCenter: 'Civil Lines Quarter',
        lat: 26.9080,
        lng: 75.7870,
        googleMapsUrl: 'https://maps.google.com/?q=Civil+Lines+Jaipur'
      }
    ],
    shopping: [
      { item: 'Precious Gemstones & Silver Jewelry', market: 'Johari Bazaar', priceRange: '₹1200 - ₹8000' },
      { item: 'Traditional Embroidered Mojari Shoes', market: 'Bapu Bazaar', priceRange: '₹350 - ₹1100' },
      { item: 'Handcrafted Blue Pottery Plates & Vases', market: 'Sanganer Craft Center', priceRange: '₹400 - ₹2200' }
    ]
  }
};

// Generic fallback content for any other destination in India
function getFallbackDestinationContent(destName: string): DestinationContent {
  return {
    sights: [
      {
        name: `${destName} Grand Heritage Citadel & Fort`,
        category: 'HISTORICAL MONUMENT',
        timing: '09:00 AM - 05:30 PM',
        entryFee: 150,
        bookingLink: 'https://asi.nic.in',
        description: 'Stunning stone architecture featuring royal pavilions, courtyards, and panoramic city vistas.',
        rating: 4.8,
        googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(destName + ' Fort Heritage')}`
      },
      {
        name: `${destName} Sacred Promenade & Old Town`,
        category: 'CULTURAL EXPERIENCE',
        timing: 'Open 24 Hours',
        entryFee: 0,
        bookingLink: 'https://tourism.gov.in',
        description: 'Atmospheric heritage promenade filled with centuries-old temples, tea shops, and evening light rituals.',
        rating: 4.9,
        googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(destName + ' Old Town Market')}`
      },
      {
        name: `${destName} Sunset Overlook & Eco Trail`,
        category: 'NATURE VIEWPOINT',
        timing: '06:00 AM - 07:00 PM',
        entryFee: 50,
        bookingLink: 'https://tourism.gov.in',
        description: 'Breathtaking ridge viewpoint with crisp mountain/coastal air and panoramic horizon.',
        rating: 4.7,
        googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(destName + ' Viewpoint')}`
      }
    ],
    dining: [
      {
        id: `dine-${destName}-1`,
        name: `${destName} Heritage Dining Hall`,
        cuisine: 'Authentic Regional Thali & Specialties',
        famousDish: 'Signature Regional Platter with Bread & Sweets',
        avgCostPerPerson: 500,
        mealType: 'LUNCH',
        rating: 4.8,
        location: `${destName} Central Market`,
        googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(destName + ' famous restaurant')}`
      },
      {
        id: `dine-${destName}-2`,
        name: 'The Old Town Sunrise Bistro',
        cuisine: 'Artisan Coffee, Bakery & Breakfast',
        famousDish: 'Fresh Baked Bread, Eggs / Poha & Masala Chai',
        avgCostPerPerson: 300,
        mealType: 'BREAKFAST',
        rating: 4.7,
        location: 'Heritage Quarter',
        googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(destName + ' cafe')}`
      },
      {
        id: `dine-${destName}-3`,
        name: 'Rooftop Horizon Lounge',
        cuisine: 'Pan-Indian & Continental Delicacies',
        famousDish: 'Clay Oven Tandoori Platter & Mocktails',
        avgCostPerPerson: 750,
        mealType: 'DINNER',
        rating: 4.8,
        location: `${destName} Ridge`,
        googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(destName + ' rooftop restaurant')}`
      },
      {
        id: `dine-${destName}-4`,
        name: `${destName} Street Food Bazaar`,
        cuisine: 'Crispy Street Chaat & Sweet Treats',
        famousDish: 'Hot Samosas, Jalebi & Spiced Chai',
        avgCostPerPerson: 100,
        mealType: 'STREET_FOOD',
        rating: 4.9,
        location: 'Clocktower Alley',
        googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(destName + ' street food market')}`
      }
    ],
    hotels: [
      {
        id: `stay-${destName}-1`,
        name: `${destName} HERITAGE BOUTIQUE RETREAT`,
        type: 'HERITAGE RESORT',
        rating: 4.8,
        pricePerNight: 7500,
        bookingLink: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destName)}`,
        features: ['Courtyard Garden', 'Complimentary Breakfast', 'Swimming Pool', 'High-speed WiFi'],
        badge: 'TOP TRAVELER CHOICE',
        distanceFromCenter: '0.8 km from City Center',
        googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(destName + ' boutique hotel')}`
      },
      {
        id: `stay-${destName}-2`,
        name: `ZOSTEL / BACKPACKER PG ${destName}`,
        type: 'BOUTIQUE PG',
        rating: 4.6,
        pricePerNight: 1600,
        bookingLink: 'https://www.zostel.com',
        features: ['Social Cafe Lounge', 'Coworking Hub', 'Air-Conditioned Dorms & Private Pods'],
        badge: 'IDEAL FOR FRIENDS CREW',
        distanceFromCenter: '1.2 km from Station',
        googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(destName + ' hostel zostel')}`
      },
      {
        id: `stay-${destName}-3`,
        name: `${destName} GREEN ECO HOMESTAY`,
        type: 'HOMESTAY',
        rating: 4.9,
        pricePerNight: 3200,
        bookingLink: `https://www.airbnb.com/s/${encodeURIComponent(destName)}/homes`,
        features: ['Homemade Traditional Meals', 'Garden Balcony', 'Local Host Guidance'],
        badge: 'AUTHENTIC WARM HOST',
        distanceFromCenter: 'Quiet Scenic Quarter',
        googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(destName + ' homestay')}`
      }
    ],
    shopping: [
      { item: 'Handcrafted Textiles & Souvenirs', market: 'Old Heritage Bazaar', priceRange: '₹500 - ₹2000' },
      { item: 'Local Spices, Tea & Dry Snacks', market: 'Central Marketplace', priceRange: '₹300 - ₹900' }
    ]
  };
}

export function generateCustomItinerary(params: GenerateParams): ItineraryPlan {
  const { fromLocation, toLocation, friendsCount, budget, transportMode } = params;
  const preferredActivities = params.preferredActivities && params.preferredActivities.length > 0 
    ? params.preferredActivities 
    : ['HERITAGE', 'FOOD', 'SIGHTSEEING'];

  const distanceKm = estimateDistanceKm(fromLocation, toLocation);
  const exhaustion = calculateExhaustion(distanceKm, transportMode, preferredActivities, params.moodMeter);
  const weatherType = params.weatherType || detectWeatherType(toLocation);

  const destClean = toLocation.toLowerCase().trim();
  let content = getFallbackDestinationContent(toLocation.toUpperCase());

  for (const [key, val] of Object.entries(DESTINATION_KNOWLEDGE_BASE)) {
    if (destClean.includes(key) || key.includes(destClean)) {
      content = val;
      break;
    }
  }

  const originCoords = getCoordinates(fromLocation);
  const destinationCoords = getCoordinates(toLocation);

  // Distribute estimated coordinates to sights and hotels if missing
  const enrichedSights = content.sights.map((s, idx) => ({
    ...s,
    id: `sight-${idx}`,
    lat: s.lat || destinationCoords.lat + (idx * 0.015 - 0.02),
    lng: s.lng || destinationCoords.lng + (idx * 0.018 - 0.015),
    googleMapsUrl: s.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(s.name)}`
  }));

  const enrichedHotels = content.hotels.map((h, idx) => ({
    ...h,
    lat: h.lat || destinationCoords.lat + (idx * -0.012 + 0.01),
    lng: h.lng || destinationCoords.lng + (idx * 0.014 - 0.01),
    googleMapsUrl: h.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(h.name)}`
  }));

  // Budget calculations
  const perPersonBudget = Math.round(budget / friendsCount);
  const transportBudget = Math.round(budget * (transportMode === 'flight' ? 0.32 : 0.22));
  const stayBudget = Math.round(budget * 0.32);
  const foodBudget = Math.round(budget * 0.22);
  const activitiesBudget = Math.round(budget * 0.12);
  const shoppingBudget = Math.round(budget * 0.08);
  const emergencyBuffer = Math.max(0, budget - (transportBudget + stayBudget + foodBudget + activitiesBudget + shoppingBudget));

  // Dynamic 3-Day daily plan tailored to user inputs and activities
  const day1Cost = Math.round(transportBudget * 0.45 + foodBudget * 0.3 + 500 * friendsCount);
  const day2Cost = Math.round(activitiesBudget * 0.6 + foodBudget * 0.4 + shoppingBudget * 0.5);
  const day3Cost = Math.round(transportBudget * 0.55 + foodBudget * 0.3 + 400 * friendsCount);

  const dayPlans: DayPlan[] = [
    {
      dayNumber: 1,
      title: `DEPARTURE FROM ${fromLocation.toUpperCase()} & ARRIVAL IN ${toLocation.toUpperCase()}`,
      highlights: 'Seamless check-in, orientation stroll, panoramic golden hour sunset, and regional welcome dinner',
      dayEstimatedCost: day1Cost,
      schedule: [
        {
          time: '08:00 AM',
          activity: `Board ${transportMode.toUpperCase()} transfer from ${fromLocation}`,
          location: `${fromLocation} Departure Hub`,
          cost: Math.round(transportBudget * 0.45),
          tips: 'Keep digital government ID ready on phone',
          lat: originCoords.lat,
          lng: originCoords.lng
        },
        {
          time: '01:30 PM',
          activity: `Check in at accommodation & refresh`,
          location: `${enrichedHotels[0]?.name || toLocation + ' Central Quarter'}`,
          cost: 0,
          tips: 'Unpack essentials and hydrate with local lemon soda',
          lat: destinationCoords.lat,
          lng: destinationCoords.lng
        },
        {
          time: '04:30 PM',
          activity: `${enrichedSights[0]?.name || 'Panoramic Sunset Deck Exploration'}`,
          location: `${enrichedSights[0]?.name || 'Sunset Viewpoint'}`,
          cost: (enrichedSights[0]?.entryFee || 100) * friendsCount,
          tips: 'Arrive 30 minutes before sunset for the best lighting angle',
          lat: enrichedSights[0]?.lat,
          lng: enrichedSights[0]?.lng,
          googleMapsUrl: enrichedSights[0]?.googleMapsUrl
        },
        {
          time: '08:00 PM',
          activity: `Welcome dinner feast at ${content.dining[0]?.name || 'Heritage Dining Hall'}`,
          location: `${content.dining[0]?.name || 'Local Bistro'}`,
          cost: (content.dining[0]?.avgCostPerPerson || 500) * friendsCount,
          tips: `Must-try specialty: ${content.dining[0]?.famousDish || 'Traditional Regional Thali'}`,
          googleMapsUrl: content.dining[0]?.googleMapsUrl
        }
      ],
      diningOptions: [
        content.dining[1] || content.dining[0],
        content.dining[0]
      ],
      shoppingRecommendations: [
        content.shopping[0] || { item: 'Local travel souvenirs & postcards', market: 'Old Town Heritage Bazaar', priceRange: '₹200 - ₹600' }
      ]
    },
    {
      dayNumber: 2,
      title: `HEART OF ${toLocation.toUpperCase()}: ATTRACTIONS, MARKETS & FOOD TRAIL`,
      highlights: `In-depth exploration tailored to ${preferredActivities.join(', ')}, local artisan workshops, and bustling night bazaars`,
      dayEstimatedCost: day2Cost,
      schedule: [
        {
          time: '09:00 AM',
          activity: `Morning heritage / adventure tour of ${enrichedSights[1]?.name || 'Iconic Cultural Landmark'}`,
          location: `${enrichedSights[1]?.name || 'City Landmark'}`,
          cost: (enrichedSights[1]?.entryFee || 150) * friendsCount,
          tips: 'Wear comfortable shoes for walking and carry sun protection',
          lat: enrichedSights[1]?.lat,
          lng: enrichedSights[1]?.lng,
          googleMapsUrl: enrichedSights[1]?.googleMapsUrl
        },
        {
          time: '01:00 PM',
          activity: `Lunch tasting regional specialties at ${content.dining[1]?.name || 'Artisan Cafe'}`,
          location: `${content.dining[1]?.location || 'Central Quarter'}`,
          cost: (content.dining[1]?.avgCostPerPerson || 400) * friendsCount,
          tips: `Famous dish: ${content.dining[1]?.famousDish || 'Chef Special Platter'}`,
          googleMapsUrl: content.dining[1]?.googleMapsUrl
        },
        {
          time: '04:00 PM',
          activity: `Street food crawl & vibrant shopping at ${content.shopping[1]?.market || 'Local Bazaar'}`,
          location: `${content.shopping[1]?.market || 'Central Marketplace'}`,
          cost: 250 * friendsCount,
          tips: 'Friendly bargaining is welcomed in the artisan lanes'
        },
        {
          time: '08:00 PM',
          activity: `Evening cultural dinner & musical session at ${content.dining[2]?.name || 'Rooftop Horizon Lounge'}`,
          location: `${content.dining[2]?.name || 'Rooftop Deck'}`,
          cost: (content.dining[2]?.avgCostPerPerson || 700) * friendsCount,
          tips: 'Book an outdoor table overlooking the illuminated city',
          googleMapsUrl: content.dining[2]?.googleMapsUrl
        }
      ],
      diningOptions: [
        content.dining[1] || content.dining[0],
        content.dining[2] || content.dining[0],
        content.dining[3] || content.dining[0]
      ],
      shoppingRecommendations: content.shopping
    },
    {
      dayNumber: 3,
      title: `OFF-BEAT TRAILS, SOUVENIR WRAP & RETURN JOURNEY`,
      highlights: 'Scenic nature trail, memory photo drop, final culinary tasting, and return journey',
      dayEstimatedCost: day3Cost,
      schedule: [
        {
          time: '07:30 AM',
          activity: `Morning eco-trail & sunrise viewpoint at ${enrichedSights[2]?.name || 'Scenic Valley Overlook'}`,
          location: `${enrichedSights[2]?.name || 'Scenic Trail'}`,
          cost: (enrichedSights[2]?.entryFee || 50) * friendsCount,
          tips: 'Fresh mountain or coastal breeze; great for group photos',
          lat: enrichedSights[2]?.lat,
          lng: enrichedSights[2]?.lng,
          googleMapsUrl: enrichedSights[2]?.googleMapsUrl
        },
        {
          time: '11:30 AM',
          activity: `Street snack farewell & local sweets shopping`,
          location: `${content.dining[3]?.name || 'Bazaar Street Food Corner'}`,
          cost: (content.dining[3]?.avgCostPerPerson || 150) * friendsCount,
          tips: `Pack some freshly prepared ${content.dining[3]?.famousDish || 'local sweets'} for the train/flight`,
          googleMapsUrl: content.dining[3]?.googleMapsUrl
        },
        {
          time: '03:00 PM',
          activity: `Hotel check-out and photo album sync to Google Drive QR`,
          location: 'Hotel Lobby & Transit Station',
          cost: 0,
          tips: 'Share the high-res QR code with all friends to pool trip memories'
        },
        {
          time: '06:00 PM',
          activity: `Return journey to ${fromLocation}`,
          location: `${toLocation} Transit Terminal`,
          cost: Math.round(transportBudget * 0.55),
          tips: 'Keep tickets, boarding passes, and souvenirs safe'
        }
      ],
      diningOptions: [
        content.dining[0],
        content.dining[3] || content.dining[0]
      ],
      shoppingRecommendations: [
        content.shopping[content.shopping.length - 1] || { item: 'Traditional sweets & savory snacks', market: 'Station Market', priceRange: '₹300 - ₹900' }
      ]
    }
  ];

  // Build route waypoints including geographic coordinates
  const routeWaypoints: RouteWaypoint[] = [
    {
      id: 'wp-origin',
      name: `Departure: ${fromLocation}`,
      type: 'ORIGIN POINT',
      order: 1,
      x: 20,
      y: 35,
      lat: originCoords.lat,
      lng: originCoords.lng,
      description: `Commence ${transportMode.toUpperCase()} journey from ${fromLocation}`
    },
    {
      id: 'wp-transit',
      name: `Transit Corridor (${transportMode.toUpperCase()})`,
      type: 'TRANSIT CORRIDOR',
      order: 2,
      x: 45,
      y: 50,
      lat: (originCoords.lat + destinationCoords.lat) / 2,
      lng: (originCoords.lng + destinationCoords.lng) / 2,
      description: `${exhaustion.paceFactor} (~${distanceKm} km)`
    },
    {
      id: 'wp-dest-base',
      name: `${toLocation} Central Basecamp`,
      type: 'BASECAMP & STAY',
      order: 3,
      x: 70,
      y: 40,
      lat: destinationCoords.lat,
      lng: destinationCoords.lng,
      description: `Lodging at ${enrichedHotels[0]?.name || toLocation + ' Retreat'}`
    },
    {
      id: 'wp-dest-highlights',
      name: `${toLocation} Attractions & Markets`,
      type: 'HIGHLIGHT TRAIL',
      order: 4,
      x: 85,
      y: 65,
      lat: enrichedSights[0]?.lat || destinationCoords.lat + 0.02,
      lng: enrichedSights[0]?.lng || destinationCoords.lng + 0.02,
      description: `Explore ${enrichedSights.map(s => s.name).slice(0, 2).join(' & ')}`
    }
  ];

  return {
    id: `plan-${Date.now()}`,
    title: `${toLocation.toUpperCase()} ${preferredActivities[0] ? preferredActivities[0] + ' ' : ''}EXPEDITION`,
    fromLocation,
    toLocation,
    friendsCount,
    budget,
    transportMode,
    preferredActivities,
    weatherType,
    moodMeter: params.moodMeter,
    exhaustion,
    dayPlans,
    topSights: enrichedSights,
    popularStays: enrichedHotels,
    diningHighlights: content.dining,
    budgetSplit: {
      transport: transportBudget,
      stay: stayBudget,
      food: foodBudget,
      activities: activitiesBudget,
      shopping: shoppingBudget,
      emergencyBuffer: Math.max(0, emergencyBuffer),
      total: budget,
      perPerson: perPersonBudget
    },
    routeWaypoints,
    originCoords,
    destinationCoords,
    createdAt: 'JUST CREATED',
    isSaved: false,
    startDate: params.startDate,
    durationDays: params.durationDays || 3,
    dailyStartTime: params.dailyStartTime || '09:00 AM',
    preferredDestination: params.preferredDestination || toLocation,
    finalDestination: params.finalDestination || toLocation
  };
}

