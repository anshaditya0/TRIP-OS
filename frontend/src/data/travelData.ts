import { DestinationCard, ItineraryPlan, UserProfile, WeatherThemeConfig, WeatherType } from '../types';

export const WEATHER_CONFIGS: Record<WeatherType, WeatherThemeConfig> = {
  rain: {
    type: 'rain',
    label: 'THUNDER RAIN',
    emoji: '⛈️',
    bgGradient: 'from-slate-100 via-slate-50 to-slate-200/50',
    cardBg: 'rgba(248, 250, 252, 0.85)',
    accentColor: '#475569',
    textColor: '#1e293b',
    description: 'COOL MIST & PETRICHOR ATMOSPHERE'
  },
  nature: {
    type: 'nature',
    label: 'SERENE NATURE',
    emoji: '🍃',
    bgGradient: 'from-emerald-50/60 via-slate-50 to-emerald-100/30',
    cardBg: 'rgba(240, 253, 244, 0.85)',
    accentColor: '#15803d',
    textColor: '#14532d',
    description: 'FRESH BOTANICAL VALLEY & PINE HARMONY'
  },
  snow: {
    type: 'snow',
    label: 'FROST SNOW',
    emoji: '❄️',
    bgGradient: 'from-sky-50/60 via-slate-50 to-sky-100/30',
    cardBg: 'rgba(240, 249, 255, 0.85)',
    accentColor: '#0284c7',
    textColor: '#0c4a6e',
    description: 'CRISP GLACIER AIR & POWDER TRAILS'
  },
  sunny: {
    type: 'sunny',
    label: 'GOLDEN SUN',
    emoji: '☀️',
    bgGradient: 'from-amber-50/60 via-slate-50 to-orange-50/30',
    cardBg: 'rgba(255, 251, 235, 0.88)',
    accentColor: '#ea580c',
    textColor: '#7c2d12',
    description: 'WARM SUNRISE & COASTAL BREEZE'
  }
};

export const POPULAR_DESTINATIONS: DestinationCard[] = [
  {
    id: 'jaipur',
    name: 'JAIPUR, RAJASTHAN',
    state: 'Rajasthan',
    tagline: 'The Pink City of Royal Palaces and Amber Fortresses',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewCount: 3840,
    activeVisitors: 4120,
    weatherType: 'sunny',
    weatherTemp: '28°C',
    recommendedDuration: '3-4 Days',
    highlights: ['Hawa Mahal Palace', 'Amber Fort Elephant Ridge', 'Nahargarh Sunset Point', 'City Palace'],
    famousShopping: ['Johari Bazaar Gemstones', 'Bapu Bazaar Mojaris', 'Blue Pottery at Sanganer', 'Bandhani Silk'],
    mustVisitSpots: ['Jantar Mantar', 'Albert Hall Museum', 'Panna Meena ka Kund', 'Chokhi Dhani'],
    averageBudget: 18000,
    coordinates: { x: 38, y: 36, lat: 26.9124, lng: 75.7873 },
    reviews: [
      {
        id: 'rev-1',
        author: 'Aarav Sharma',
        rating: 5,
        date: '2 days ago',
        comment: 'Exploring Nahargarh fort during dusk gave chills. The clay pottery shops near Johari bazaar are unbeatable!',
        helpfulCount: 42,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
      },
      {
        id: 'rev-2',
        author: 'Priya Iyer',
        rating: 4.5,
        date: '1 week ago',
        comment: 'Great heritage walk. Wear comfortable shoes for the fort stairs!',
        helpfulCount: 19,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
      }
    ]
  },
  {
    id: 'manali',
    name: 'MANALI & SOLANG, HP',
    state: 'Himachal Pradesh',
    tagline: 'Snow-capped Himalayan Peaks, Pine Valleys & Atal Tunnel',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 5210,
    activeVisitors: 3640,
    weatherType: 'snow',
    weatherTemp: '-2°C',
    recommendedDuration: '4-5 Days',
    highlights: ['Solang Valley Skiing', 'Atal Tunnel Snow Crossing', 'Old Manali Cafes', 'Jogini Waterfall Trek'],
    famousShopping: ['Mall Road Kullu Shawls', 'Tibetan Handicrafts & Singing Bowls', 'Fresh Himalayan Apples & Honey'],
    mustVisitSpots: ['Hadimba Temple', 'Vashisht Hot Water Springs', 'Rohtang Pass Snow Point', 'Kasol Day Trip'],
    averageBudget: 22000,
    coordinates: { x: 42, y: 18, lat: 32.2432, lng: 77.1892 },
    reviews: [
      {
        id: 'rev-3',
        author: 'Rohan Mehta',
        rating: 5,
        date: 'Yesterday',
        comment: 'Fresh snowfall in Solang! Renting waterproof boots from local stands made paragliding awesome.',
        helpfulCount: 68,
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'
      }
    ]
  },
  {
    id: 'goa',
    name: 'GOA COASTLINE',
    state: 'Goa',
    tagline: 'Sun-kissed Beaches, Portuguese Architecture & Night Bazaars',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewCount: 6180,
    activeVisitors: 5890,
    weatherType: 'sunny',
    weatherTemp: '31°C',
    recommendedDuration: '4-6 Days',
    highlights: ['Palolem Kayaking', 'Anjuna Flea Market', 'Fontainhas Heritage Quarter', 'Dudhsagar Waterfalls'],
    famousShopping: ['Arpora Saturday Night Market', 'Cashew Nuts & Feni', 'Boho Beachwear', 'Spices at Sahakari Farm'],
    mustVisitSpots: ['Chapora Fort', 'Arambol Sweet Water Lake', 'Aguada Fort Lighthouse', 'Baga Water Sports'],
    averageBudget: 24000,
    coordinates: { x: 34, y: 68, lat: 15.2993, lng: 74.1240 },
    reviews: [
      {
        id: 'rev-4',
        author: 'Sneha Roy',
        rating: 5,
        date: '3 days ago',
        comment: 'Rented an electric scooter and hopped across North Goa beaches. Fontainhas Latin quarter feels like Europe!',
        helpfulCount: 34,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80'
      }
    ]
  },
  {
    id: 'varanasi',
    name: 'VARANASI GHATS, UP',
    state: 'Uttar Pradesh',
    tagline: 'Spiritual Heart of India, Evening Ganga Aarti & Ancient Lanes',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 4790,
    activeVisitors: 6410,
    weatherType: 'rain',
    weatherTemp: '24°C',
    recommendedDuration: '2-3 Days',
    highlights: ['Dashashwamedh Evening Maha Aarti', 'Sunrise Subah-e-Banaras Boat Ride', 'Kashi Vishwanath Corridor', 'Assi Ghat Classical Music'],
    famousShopping: ['Banarasi Brocade & Zari Sarees', 'Ganga Jal Sacred Brassware', 'Gulabi Meenakari Jewelry', 'Banarasi Paan & Malaiyo'],
    mustVisitSpots: ['Manikarnika Ghat', 'Sarnath Buddhist Stupa', 'Ramnagar Fort', 'BHU Vishwanath Temple'],
    averageBudget: 14000,
    coordinates: { x: 62, y: 40, lat: 25.3176, lng: 82.9739 },
    reviews: [
      {
        id: 'rev-5',
        author: 'Vikramaditya',
        rating: 5,
        date: '4 days ago',
        comment: 'Watching the lamps float on Mother Ganga at 5:30 AM is an unforgettable life experience. Must try Kachori Jalebi at Thatheri Bazaar.',
        helpfulCount: 89,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
      }
    ]
  },
  {
    id: 'munnar',
    name: 'MUNNAR TEA HILLS, KERALA',
    state: 'Kerala',
    tagline: 'Rolling Emerald Tea Estates, Misty Waterfalls & Neelakurinji',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewCount: 3120,
    activeVisitors: 2890,
    weatherType: 'nature',
    weatherTemp: '19°C',
    recommendedDuration: '3-4 Days',
    highlights: ['Kolukkumalai Sunrise Jeep Safari', 'Eravikulam Tahr Sanctuary', 'Mattupetty Dam Speedboating', 'Tea Tasting & Museum'],
    famousShopping: ['Fresh Organic CTC & Green Tea', 'Natural Homemade Chocolates', 'Cardamom & Cloves', 'Essential Eucalyptus Oils'],
    mustVisitSpots: ['Top Station Viewpoint', 'Kundala Lake & Shikara', 'Attukad Waterfall', 'Anamudi Peak'],
    averageBudget: 19500,
    coordinates: { x: 44, y: 84, lat: 10.0889, lng: 77.0595 },
    reviews: [
      {
        id: 'rev-6',
        author: 'Ananya Verma',
        rating: 5,
        date: '5 days ago',
        comment: 'The morning mist over Tata tea estates looks magical. Definitely book the 4x4 safari to Kolukkumalai!',
        helpfulCount: 29,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80'
      }
    ]
  },
  {
    id: 'ladakh',
    name: 'LEH LADAKH HIGHLANDS',
    state: 'Ladakh',
    tagline: 'Moonland High Passes, Pangong Tso & Ancient Monasteries',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 4100,
    activeVisitors: 2150,
    weatherType: 'snow',
    weatherTemp: '4°C',
    recommendedDuration: '6-8 Days',
    highlights: ['Pangong Tso Blue Waters', 'Nubra Valley Double Humped Camel Ride', 'Khardung La High Altitude Pass', 'Magnetic Hill Gravity Defiance'],
    famousShopping: ['Authentic Pashmina Shawls', 'Ladakhi Apricot Oil & Jam', 'Tibetan Prayer Flags & Turquoise Stones'],
    mustVisitSpots: ['Thiksey Monastery', 'Hemis Festival Courtyard', 'Shanti Stupa at Sunset', 'Tso Moriri Lake'],
    averageBudget: 35000,
    coordinates: { x: 44, y: 10, lat: 34.1526, lng: 77.5771 },
    reviews: [
      {
        id: 'rev-7',
        author: 'Kabir Singhania',
        rating: 5,
        date: '1 week ago',
        comment: 'Camping under the Milky Way at Pangong is peak wanderlust. Take 2 full days for Leh altitude acclimatization.',
        helpfulCount: 112,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80'
      }
    ]
  }
];

export const LIVE_NEWS_ALERTS = [
  { id: '1', badge: 'FLASH DEAL', text: '⚡ INDIGO FLIGHTS: DELHI TO GOA AT ₹3,499 FOR WEEKEND DEPARTURES', icon: 'plane' },
  { id: '2', badge: 'LIVE CROWD', text: '👥 REAL-TIME UPDATE: 4,120 VISITORS ENJOYING AMBER FORT TODAY', icon: 'users' },
  { id: '3', badge: 'WEATHER ALERT', text: '🌧️ LIGHT DRIZZLE IN KERALA GHATS — TEA GARDENS SHINING IN FULL GREEN', icon: 'cloud-rain' },
  { id: '4', badge: 'ROAD STATUS', text: '🏔️ ATAL TUNNEL & ROHTANG PASS ALL-WEATHER ACCESS NOW OPEN FOR 4X4 VEHICLES', icon: 'mountain' },
  { id: '5', badge: 'MEDIA BUZZ', text: '🎥 PUSHKAR & VARANASI DEV DEEPAVALI PASSES AVAILABLE NOW', icon: 'sparkles' },
];

export const INITIAL_DISASTER_ALERTS: import('../types').DisasterAlert[] = [
  {
    id: 'da-1',
    reporterName: 'Rahul Sharma (Highway Patrol)',
    location: 'Rohtang Pass Highway, Himachal',
    disasterType: 'Landslide / Rockfall',
    severity: 'HIGH',
    description: 'Minor rockfall near Solang Nallah curve. Police on scene diverting traffic via Atal Tunnel bypass.',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    timestamp: '15 mins ago',
    upvotesCount: 42,
    isVerified: true
  },
  {
    id: 'da-2',
    reporterName: 'Ananya V. (Local Guide)',
    location: 'Munnar Ghat Road, Kerala',
    disasterType: 'Dense Fog / Zero Visibility',
    severity: 'MODERATE',
    description: 'Thick mountain fog reducing visibility under 10m. Drive with fog lights and low beam on.',
    imageUrl: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80',
    timestamp: '45 mins ago',
    upvotesCount: 28,
    isVerified: true
  }
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: '',
  email: '',
  avatar: '',
  badge: 'ACTIVE EXPLORER',
  homeCity: 'India',
  tripsCount: 0,
  statesExplored: 0,
  totalMiles: 0,
  documents: [],
  expenses: [],
  collectibles: []
};

export const INITIAL_SAVED_PLANS: ItineraryPlan[] = [];
