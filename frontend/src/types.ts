export type WeatherType = 'rain' | 'nature' | 'snow' | 'sunny';

export interface WeatherThemeConfig {
  type: WeatherType;
  label: string;
  emoji: string;
  bgGradient: string;
  cardBg: string;
  accentColor: string;
  textColor: string;
  description: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  helpfulCount: number;
  avatar: string;
}

export interface DestinationCard {
  id: string;
  name: string;
  state: string;
  tagline: string;
  image: string;
  rating: number;
  reviewCount: number;
  activeVisitors: number;
  weatherType: WeatherType;
  weatherTemp: string;
  recommendedDuration: string;
  highlights: string[];
  famousShopping: string[];
  mustVisitSpots: string[];
  averageBudget: number; // in INR
  coordinates: { x: number; y: number; lat: number; lng: number };
  reviews: ReviewItem[];
}

export type TransportMode = 'flight' | 'train' | 'roadtrip' | 'bike';

export interface HotelStay {
  id: string;
  name: string;
  type: 'HOTEL' | 'BOUTIQUE PG' | 'HERITAGE RESORT' | 'HOMESTAY' | 'HOSTEL';
  rating: number;
  pricePerNight: number;
  bookingLink: string;
  features: string[];
  badge: string;
  distanceFromCenter: string;
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
}

export interface DiningOption {
  id: string;
  name: string;
  cuisine: string;
  famousDish: string;
  avgCostPerPerson: number;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'STREET_FOOD';
  rating: number;
  location: string;
  googleMapsUrl?: string;
}

export interface DayScheduleItem {
  time: string;
  activity: string;
  location: string;
  cost: number;
  tips: string;
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
}

export interface DayPlan {
  dayNumber: number;
  title: string;
  highlights: string;
  schedule: DayScheduleItem[];
  diningOptions: DiningOption[];
  shoppingRecommendations: { item: string; market: string; priceRange: string }[];
  dayEstimatedCost: number;
}

export interface SightItem {
  id?: string;
  name: string;
  category: string;
  timing: string;
  entryFee: number;
  bookingLink: string;
  description: string;
  rating: number;
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
}

export interface BudgetSplit {
  transport: number;
  stay: number;
  food: number;
  activities: number;
  shopping: number;
  emergencyBuffer: number;
  total: number;
  perPerson: number;
}

export interface ExhaustionData {
  score: number; // 0 - 100
  level: 'RELAXED' | 'MODERATE' | 'ACTIVE' | 'HIGH PACE' | 'EXTREME TREKKER';
  color: string;
  gradient: string;
  description: string;
  travelDistanceKm: number;
  travelTimeHours: number;
  paceFactor: string;
  physicalStrain: number; // 0 - 100
  transitStrain: number;  // 0 - 100
  recoveryScore: number;  // 0 - 100
  recoveryTips: string[];
}

export interface RouteWaypoint {
  id: string;
  name: string;
  type: string;
  order: number;
  x: number;
  y: number;
  lat: number;
  lng: number;
  description?: string;
}

export interface MoodMeterConfig {
  adventure: number;        // 0 - 100
  nature: number;           // 0 - 100
  food: number;             // 0 - 100
  photography: number;      // 0 - 100
  nightlife: number;        // 0 - 100
  relaxation: number;       // 0 - 100
  budgetSensitivity: number;// 0 - 100 (0 = luxury splurge, 100 = ultra frugal)
  walkingTolerance: number; // 0 - 100 (0 = cab only, 100 = 25k steps marathon)
  crowdTolerance: number;   // 0 - 100 (0 = secluded serene, 100 = bustling festival)
}

export interface ItineraryPlan {
  id: string;
  title: string;
  fromLocation: string;
  toLocation: string;
  friendsCount: number;
  budget: number;
  transportMode: TransportMode;
  preferredActivities: string[];
  weatherType: WeatherType;
  moodMeter?: MoodMeterConfig;
  exhaustion: ExhaustionData;
  dayPlans: DayPlan[];
  topSights: SightItem[];
  popularStays: HotelStay[];
  diningHighlights: DiningOption[];
  budgetSplit: BudgetSplit;
  routeWaypoints: RouteWaypoint[];
  originCoords: { lat: number; lng: number };
  destinationCoords: { lat: number; lng: number };
  createdAt: string;
  isSaved?: boolean;
  startDate?: string;
  durationDays?: number;
}

export interface TripPhoto {
  id: string;
  url: string;
  caption: string;
  uploadedAt: string;
  sizeMb: number;
}

export interface DigitalDocument {
  id: string;
  name: string;
  type: 'PASSPORT' | 'AADHAAR' | 'TICKET' | 'INSURANCE' | 'VOUCHER';
  docNumber: string;
  issuedBy: string;
  expiryDate?: string;
  uploadedDate: string;
  isVerified: boolean;
}

export interface PersonalExpense {
  id: string;
  tripTitle: string;
  category: 'TRANSPORT' | 'HOTEL' | 'FOOD' | 'SHOPPING' | 'ACTIVITIES';
  amount: number;
  date: string;
  paymentMethod: string;
}

export interface DisasterAlert {
  id: string;
  reporterName: string;
  location: string;
  disasterType: string;
  customDetails?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'INFO';
  description?: string;
  imageUrl?: string;
  timestamp: string;
  upvotesCount: number;
  isVerified: boolean;
}

export interface JourneyCollectible {
  id: string;
  destination: string;
  badgeTitle: string;
  iconEmoji: string;
  rarity: 'LEGENDARY' | 'RARE' | 'UNCOMMON' | 'COMMON';
  dateUnlocked: string;
  bgGradient: string;
  description: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  badge: string;
  homeCity: string;
  tripsCount: number;
  statesExplored: number;
  totalMiles: number;
  documents: DigitalDocument[];
  expenses: PersonalExpense[];
  collectibles?: JourneyCollectible[];
}
