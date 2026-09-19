import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, ShieldAlert, Camera, Upload, X, MapPin, 
  User, Check, ChevronDown, Sparkles, Image as ImageIcon,
  CheckCircle2, Radio, Info, AlertOctagon, HelpCircle, Trash2
} from 'lucide-react';
import { DisasterAlert } from '../types';

interface DisasterAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitAlert: (alert: DisasterAlert) => void;
  defaultReporterName?: string;
}

const ALERT_TYPE_OPTIONS = [
  'Landslide / Rockfall',
  'Heavy Flash Flooding / Cloudburst',
  'Unseasonal Heavy Rain / Storm',
  'Earthquake / Tremor',
  'Dense Fog / Zero Visibility',
  'Wildfire / Forest Fire',
  'Roadblock / Bridge Damage',
  'Custom / Others'
];

const LOCATION_PRESETS = [
  'Manali Highway, HP',
  'Rohtang Pass, Ladakh Rd',
  'Goa Coastline, GA',
  'Munnar Ghat Rd, Kerala',
  'Jaipur Expressway, RJ',
  'Shimla Ridge Rd, HP'
];

const SAMPLE_PHOTO_PRESETS = [
  { label: '🏔️ Rockfall / Landslide', url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80' },
  { label: '🌧️ Flooded Roadway', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80' },
  { label: '🌫️ Dense Fog Pass', url: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80' }
];

export const DisasterAlertModal: React.FC<DisasterAlertModalProps> = ({
  isOpen,
  onClose,
  onSubmitAlert,
  defaultReporterName = 'SPARSH RAJ'
}) => {
  const [reporterName, setReporterName] = useState(defaultReporterName);
  const [location, setLocation] = useState('');
  const [selectedAlertType, setSelectedAlertType] = useState(ALERT_TYPE_OPTIONS[0]);
  const [customDetails, setCustomDetails] = useState('');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MODERATE' | 'INFO'>('HIGH');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Camera capture simulation / state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateCameraCapture = () => {
    setIsCameraActive(true);
    setTimeout(() => {
      // Pick a realistic snapshot image
      const photo = SAMPLE_PHOTO_PRESETS[0].url;
      setImagePreview(photo);
      setIsCameraActive(false);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim()) {
      alert('Please specify the location for the disaster alert.');
      return;
    }

    if (selectedAlertType === 'Custom / Others' && !customDetails.trim()) {
      alert('Please describe your custom alert details.');
      return;
    }

    const finalAlert: DisasterAlert = {
      id: `da-user-${Date.now()}`,
      reporterName: reporterName.trim() || 'Anonymous Explorer',
      location: location.trim(),
      disasterType: selectedAlertType,
      customDetails: selectedAlertType === 'Custom / Others' ? customDetails.trim() : undefined,
      severity,
      description: description.trim() || undefined,
      imageUrl: imagePreview || undefined,
      timestamp: 'Just Now',
      upvotesCount: 1,
      isVerified: true
    };

    onSubmitAlert(finalAlert);

    // Reset form
    setLocation('');
    setSelectedAlertType(ALERT_TYPE_OPTIONS[0]);
    setCustomDetails('');
    setDescription('');
    setImagePreview(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div id="disaster-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl my-8 glass-card border border-white/90 bg-white/95 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.2)] overflow-hidden"
        >
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-r from-red-950 via-neutral-900 to-red-950 text-white relative">
            <button
              id="btn-close-disaster-modal"
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                DISASTER & HAZARD BROADCAST
              </span>
              <span className="text-[10px] font-mono text-red-200/70 uppercase">COMMUNITY NETWORK</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span>REPORT NATURAL DISASTER ALERTS</span>
            </h2>

            <p className="text-xs font-mono text-red-100/80 mt-1">
              Broadcast ground alerts for landslides, cloudbursts, earthquakes or fog to safeguard fellow explorers.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Reporter Name & Location Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-600 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  REPORTER NAME
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Sparsh Raj / Local Guide"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-red-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  INCIDENT LOCATION *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Rohtang Pass, Solang Curve"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-red-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Location Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">QUICK LOCATIONS:</span>
              {LOCATION_PRESETS.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer border border-slate-200/60"
                >
                  📍 {loc}
                </button>
              ))}
            </div>

            {/* Disaster Alert Dropdown Selector */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                DETAILS OF ALERT (DISASTER TYPE) *
              </label>
              <div className="relative">
                <select
                  value={selectedAlertType}
                  onChange={(e) => setSelectedAlertType(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 shadow-2xs cursor-pointer"
                >
                  {ALERT_TYPE_OPTIONS.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Custom Details Input (Conditional when 'Custom / Others' is selected) */}
            {selectedAlertType === 'Custom / Others' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1.5"
              >
                <label className="block text-[10px] font-mono font-bold uppercase text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  SPECIFY CUSTOM ALERT DETAILS *
                </label>
                <input
                  type="text"
                  value={customDetails}
                  onChange={(e) => setCustomDetails(e.target.value)}
                  placeholder="e.g. Glacial outburst, tunnel electrical failure, sudden hailstorm"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                />
              </motion.div>
            )}

            {/* Severity Selector */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                SEVERITY & URGENCY LEVEL
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'CRITICAL', label: '🔴 CRITICAL', color: 'bg-red-600 text-white' },
                  { id: 'HIGH', label: '🟠 HIGH ALERT', color: 'bg-orange-500 text-white' },
                  { id: 'MODERATE', label: '🟡 MODERATE', color: 'bg-amber-500 text-white' },
                  { id: 'INFO', label: '🔵 ADVISORY', color: 'bg-sky-600 text-white' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSeverity(s.id as any)}
                    className={`py-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                      severity === s.id
                        ? `${s.color} shadow-md ring-2 ring-offset-1 ring-slate-900`
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Camera Image Upload / Snapshot Section */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-red-600" />
                  OPTIONAL CAMERA IMAGE / GROUND EVIDENCE
                </label>
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">PHOTO EVIDENCE</span>
              </div>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black max-h-48 flex items-center justify-center">
                  <img src={imagePreview} alt="Alert evidence" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/70 hover:bg-black text-white text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>REMOVE</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:bg-slate-50"
                    >
                      <Upload className="w-4 h-4 text-amber-600" />
                      <span>UPLOAD PHOTO</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSimulateCameraCapture}
                      disabled={isCameraActive}
                      className="p-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                    >
                      {isCameraActive ? (
                        <>
                          <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                          <span>CAPTURING...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 text-emerald-400" />
                          <span>TAKE CAMERA SNAP</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Sample presets for fast testing */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">DEMO PHOTOS:</span>
                    {SAMPLE_PHOTO_PRESETS.map((photo, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setImagePreview(photo.url)}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-amber-50 text-slate-700 text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer"
                      >
                        {photo.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Description */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-600">
                ADDITIONAL INCIDENT DESCRIPTION / DRIVING ADVICE
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Debris on road near KM 42. Local police active. Detour recommended via riverside bypass."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-red-500 shadow-2xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                CANCEL
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-black uppercase tracking-wider shadow-md cursor-pointer transition-transform active:scale-95 flex items-center gap-2"
              >
                <Radio className="w-4 h-4 text-white animate-pulse" />
                <span>BROADCAST DISASTER ALERT</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DisasterAlertModal;
