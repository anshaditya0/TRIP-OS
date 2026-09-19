import React, { useState, useEffect } from 'react';
import { 
  APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap 
} from '@vis.gl/react-google-maps';
import { 
  Map as MapIcon, Globe, Compass, Navigation, Layers, ExternalLink, 
  Sparkles, Hotel, Utensils, Star, Info, AlertTriangle 
} from 'lucide-react';
import { ItineraryPlan, SightItem, HotelStay, DiningOption } from '../types';

interface GoogleMapsViewProps {
  plan: ItineraryPlan;
}

type MapMode = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyA2RJ60qa9LrJG-AmAsxrUQcdvPlywTS1g';

// Inner camera controller component
const MapCameraController: React.FC<{ 
  center: { lat: number; lng: number }; 
  zoom: number; 
  tilt: number;
  heading: number;
}> = ({ center, zoom, tilt, heading }) => {
  const map = useMap('google-trip-map');

  useEffect(() => {
    if (map) {
      map.setCenter(center);
      map.setZoom(zoom);
      map.setTilt(tilt);
      map.setHeading(heading);
    }
  }, [map, center, zoom, tilt, heading]);

  return null;
};

export const GoogleMapsView: React.FC<GoogleMapsViewProps> = ({ plan }) => {
  const [mapMode, setMapMode] = useState<MapMode>('hybrid');
  const [isEarth3D, setIsEarth3D] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<{
    id: string;
    title: string;
    type: 'ORIGIN' | 'DESTINATION' | 'ATTRACTION' | 'HOTEL' | 'DINING';
    position: { lat: number; lng: number };
    description?: string;
    rating?: number;
    priceOrFee?: string;
    mapsUrl?: string;
  } | null>(null);

  const [filterType, setFilterType] = useState<'ALL' | 'ATTRACTIONS' | 'HOTELS' | 'DINING'>('ALL');
  const [quotaReached, setQuotaReached] = useState(false);

  useEffect(() => {
    const handleQuota = () => setQuotaReached(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Map center defaults to destination coordinates
  const mapCenter = plan.destinationCoords || { lat: 26.9124, lng: 75.7873 };
  const currentTilt = isEarth3D ? 60 : 0;
  const currentHeading = isEarth3D ? 45 : 0;

  const googleEarthUrl = `https://earth.google.com/web/search/${encodeURIComponent(plan.toLocation)}`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(plan.fromLocation)}&destination=${encodeURIComponent(plan.toLocation)}`;

  return (
    <div className="w-full glass-card p-4 sm:p-6 border border-white/80 overflow-hidden space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {/* Top Header & Map Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800">
              LIVE GOOGLE MAPS & SATELLITE 3D EARTH
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
            {plan.toLocation} SATELLITE & ROUTE CORRIDOR
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase">
            PHOTOREALISTIC 3D TERRAIN • {plan.fromLocation} ➔ {plan.toLocation} ({plan.transportMode.toUpperCase()})
          </p>
        </div>

        {/* Action Controls: Google Earth External Flyover & Directions */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={googleEarthUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-all"
            title="Open 3D Photorealistic Google Earth in new tab"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>OPEN IN GOOGLE EARTH (3D)</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-all"
            title="Open turn-by-turn route navigation in Google Maps"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>MAPS DIRECTIONS</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>
        </div>
      </div>

      {/* Quota defense banner if reached */}
      {quotaReached && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Filter and View Switcher Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-slate-100/80 text-xs font-black uppercase">
        {/* Layer type switchers */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setMapMode('hybrid'); setIsEarth3D(true); }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              mapMode === 'hybrid' && isEarth3D
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            🌍 3D SATELLITE (EARTH)
          </button>
          <button
            onClick={() => { setMapMode('satellite'); setIsEarth3D(false); }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              mapMode === 'satellite' && !isEarth3D
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            🛰️ SATELLITE 2D
          </button>
          <button
            onClick={() => { setMapMode('roadmap'); setIsEarth3D(false); }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              mapMode === 'roadmap'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            🗺️ ROADMAP
          </button>
          <button
            onClick={() => { setMapMode('terrain'); setIsEarth3D(false); }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              mapMode === 'terrain'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            ⛰️ TERRAIN
          </button>
        </div>

        {/* Marker Category Filters */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-500 mr-1 hidden sm:inline">PINS:</span>
          {(['ALL', 'ATTRACTIONS', 'HOTELS', 'DINING'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                filterType === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white/80 text-slate-600 hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Actual Interactive Google Map Canvas */}
      <div className="relative w-full h-[460px] sm:h-[540px] rounded-3xl overflow-hidden border-2 border-slate-200 shadow-inner">
        <APIProvider apiKey={API_KEY}>
          <Map
            id="google-trip-map"
            defaultCenter={mapCenter}
            defaultZoom={12}
            mapTypeId={mapMode}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
            tilt={currentTilt}
            heading={currentHeading}
            gestureHandling="greedy"
            disableDefaultUI={false}
          >
            <MapCameraController 
              center={mapCenter} 
              zoom={12} 
              tilt={currentTilt} 
              heading={currentHeading} 
            />

            {/* Origin Marker */}
            {plan.originCoords && (
              <AdvancedMarker
                position={plan.originCoords}
                onClick={() => setSelectedMarker({
                  id: 'marker-origin',
                  title: `DEPARTURE: ${plan.fromLocation.toUpperCase()}`,
                  type: 'ORIGIN',
                  position: plan.originCoords,
                  description: `Trip start hub. Transit via ${plan.transportMode.toUpperCase()}`,
                  mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(plan.fromLocation)}`
                })}
              >
                <div className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase shadow-lg border-2 border-white flex items-center gap-1 cursor-pointer">
                  <span>🛫</span>
                  <span>{plan.fromLocation}</span>
                </div>
              </AdvancedMarker>
            )}

            {/* Destination Center Marker */}
            {plan.destinationCoords && (
              <AdvancedMarker
                position={plan.destinationCoords}
                onClick={() => setSelectedMarker({
                  id: 'marker-dest',
                  title: `DESTINATION: ${plan.toLocation.toUpperCase()}`,
                  type: 'DESTINATION',
                  position: plan.destinationCoords,
                  description: `Main expedition basecamp with ${plan.friendsCount} travelers.`,
                  mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(plan.toLocation)}`
                })}
              >
                <div className="px-3 py-1.5 rounded-full bg-orange-600 text-white font-black text-[11px] uppercase shadow-xl border-2 border-white flex items-center gap-1.5 cursor-pointer ring-4 ring-orange-300/60 animate-bounce">
                  <span>⭐</span>
                  <span>{plan.toLocation}</span>
                </div>
              </AdvancedMarker>
            )}

            {/* Suggested Attractions Markers */}
            {(filterType === 'ALL' || filterType === 'ATTRACTIONS') &&
              plan.topSights.map((sight, idx) => {
                if (!sight.lat || !sight.lng) return null;
                return (
                  <AdvancedMarker
                    key={`sight-marker-${idx}`}
                    position={{ lat: sight.lat, lng: sight.lng }}
                    onClick={() => setSelectedMarker({
                      id: `sight-${idx}`,
                      title: sight.name.toUpperCase(),
                      type: 'ATTRACTION',
                      position: { lat: sight.lat!, lng: sight.lng! },
                      description: sight.description,
                      rating: sight.rating,
                      priceOrFee: sight.entryFee === 0 ? 'FREE ENTRY' : `₹${sight.entryFee}`,
                      mapsUrl: sight.googleMapsUrl
                    })}
                  >
                    <div className="px-2 py-1 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase shadow-md border border-white flex items-center gap-1 cursor-pointer hover:scale-110 transition-transform">
                      <span>🏰</span>
                      <span className="truncate max-w-[120px]">{sight.name}</span>
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* Accommodation / Hotel Markers */}
            {(filterType === 'ALL' || filterType === 'HOTELS') &&
              plan.popularStays.map((stay, idx) => {
                if (!stay.lat || !stay.lng) return null;
                return (
                  <AdvancedMarker
                    key={`stay-marker-${idx}`}
                    position={{ lat: stay.lat, lng: stay.lng }}
                    onClick={() => setSelectedMarker({
                      id: `stay-${idx}`,
                      title: stay.name.toUpperCase(),
                      type: 'HOTEL',
                      position: { lat: stay.lat!, lng: stay.lng! },
                      description: `${stay.type} • ${stay.features.slice(0, 2).join(', ')}`,
                      rating: stay.rating,
                      priceOrFee: `₹${stay.pricePerNight} / NIGHT`,
                      mapsUrl: stay.googleMapsUrl || stay.bookingLink
                    })}
                  >
                    <div className="px-2 py-1 rounded-xl bg-sky-600 text-white text-[10px] font-black uppercase shadow-md border border-white flex items-center gap-1 cursor-pointer hover:scale-110 transition-transform">
                      <span>🏨</span>
                      <span className="truncate max-w-[110px]">{stay.name}</span>
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* Dining Options Markers */}
            {(filterType === 'ALL' || filterType === 'DINING') &&
              plan.diningHighlights.map((dine, idx) => {
                const lat = plan.destinationCoords.lat + (idx * 0.008 - 0.012);
                const lng = plan.destinationCoords.lng + (idx * -0.009 + 0.014);
                return (
                  <AdvancedMarker
                    key={`dine-marker-${idx}`}
                    position={{ lat, lng }}
                    onClick={() => setSelectedMarker({
                      id: `dine-${idx}`,
                      title: dine.name.toUpperCase(),
                      type: 'DINING',
                      position: { lat, lng },
                      description: `${dine.cuisine} • Famous for: ${dine.famousDish}`,
                      rating: dine.rating,
                      priceOrFee: `₹${dine.avgCostPerPerson} / PERSON`,
                      mapsUrl: dine.googleMapsUrl
                    })}
                  >
                    <div className="px-2 py-1 rounded-xl bg-rose-600 text-white text-[10px] font-black uppercase shadow-md border border-white flex items-center gap-1 cursor-pointer hover:scale-110 transition-transform">
                      <span>🍲</span>
                      <span className="truncate max-w-[100px]">{dine.name}</span>
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* Interactive InfoWindow Popup */}
            {selectedMarker && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-2 max-w-xs text-slate-900 font-sans">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-700">
                      {selectedMarker.type}
                    </span>
                    {selectedMarker.rating && (
                      <span className="flex items-center gap-0.5 text-xs font-black text-amber-500">
                        <Star className="w-3 h-3 fill-amber-500" />
                        <span>{selectedMarker.rating}</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 mb-1">
                    {selectedMarker.title}
                  </h4>

                  {selectedMarker.description && (
                    <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                      {selectedMarker.description}
                    </p>
                  )}

                  {selectedMarker.priceOrFee && (
                    <div className="p-1.5 rounded-lg bg-orange-50 text-orange-900 text-xs font-black mb-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase text-orange-700">COST:</span>
                      <span>{selectedMarker.priceOrFee}</span>
                    </div>
                  )}

                  {selectedMarker.mapsUrl && (
                    <a
                      href={selectedMarker.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider hover:bg-slate-800 transition-colors"
                    >
                      NAVIGATE ON GOOGLE MAPS ➔
                    </a>
                  )}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* 3D Google Earth Badge in Corner */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 pointer-events-none">
          <Globe className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '10s' }} />
          <span>GOOGLE EARTH 3D ACTIVE • TILT {currentTilt}°</span>
        </div>
      </div>
    </div>
  );
};
