import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, ShieldAlert, Radio, MapPin, User, Clock, 
  ThumbsUp, Camera, ExternalLink, X, Plus, Sparkles, Filter, ShieldCheck
} from 'lucide-react';
import { DisasterAlert } from '../types';

interface DisasterAlertsFeedProps {
  alerts: DisasterAlert[];
  onOpenReportModal: () => void;
  onUpvoteAlert?: (alertId: string) => void;
}

export const DisasterAlertsFeed: React.FC<DisasterAlertsFeedProps> = ({
  alerts,
  onOpenReportModal,
  onUpvoteAlert
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-600 text-white border-red-500/50';
      case 'HIGH':
        return 'bg-orange-500 text-white border-orange-400/50';
      case 'MODERATE':
        return 'bg-amber-500 text-white border-amber-400/50';
      default:
        return 'bg-sky-600 text-white border-sky-400/50';
    }
  };

  return (
    <div id="disaster-alerts-feed-container" className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 border border-red-200/80 bg-gradient-to-r from-red-950/90 via-neutral-900 to-red-950 text-white rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-400/40 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                COMMUNITY DISASTER RADAR
              </span>
              <span className="text-[10px] font-mono text-red-200/70 uppercase">
                {alerts.length} VERIFIED REPORTS ACTIVE
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight flex items-center gap-3">
              <span>LIVE NATURAL DISASTER & HAZARD ALERTS</span>
            </h2>

            <p className="text-xs font-mono text-red-100/80 max-w-2xl mt-1">
              Real-time crowdsourced ground reports for landslides, cloudbursts, severe weather, and roadblocks logged by explorers and highway patrols.
            </p>
          </div>

          <button
            id="btn-trigger-report-disaster"
            type="button"
            onClick={onOpenReportModal}
            className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-black uppercase tracking-wider shadow-lg cursor-pointer transition-transform active:scale-95 shrink-0 flex items-center justify-center gap-2 border border-red-400/40"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>REPORT DISASTER / ALERT</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-mono font-bold uppercase text-slate-600">FILTER SEVERITY:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'INFO'].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                filterSeverity === sev
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts.length === 0 ? (
          <div className="col-span-full p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-black text-sm uppercase text-slate-900">NO ACTIVE DISASTER ALERTS FOR THIS FILTER</h4>
            <p className="text-xs font-mono text-slate-500">All corridors appear clear. Use the report button if you encounter an unreported hazard.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-mono font-black uppercase border ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity} • {alert.disasterType === 'Custom / Others' && alert.customDetails ? alert.customDetails : alert.disasterType}
                  </span>

                  <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {alert.timestamp}
                  </span>
                </div>

                {/* Location */}
                <h4 className="font-black text-sm uppercase text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{alert.location}</span>
                </h4>

                {/* Description */}
                {alert.description && (
                  <p className="text-xs font-mono text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{alert.description}"
                  </p>
                )}

                {/* Image Evidence Thumbnail */}
                {alert.imageUrl && (
                  <div className="mt-3 relative rounded-xl overflow-hidden group cursor-pointer border border-slate-200" onClick={() => setSelectedPhoto(alert.imageUrl!)}>
                    <img src={alert.imageUrl} alt="Hazard photo evidence" className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono font-bold uppercase gap-1.5">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>EXPAND CAMERA EVIDENCE</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reporter Footer & Upvote */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-bold text-slate-700">{alert.reporterName}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onUpvoteAlert && onUpvoteAlert(alert.id)}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-3 h-3 text-emerald-600" />
                  <span>HELPFUL ({alert.upvotesCount})</span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Expandable Image Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-3xl w-full bg-black rounded-3xl overflow-hidden border border-white/20 p-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={selectedPhoto} alt="Disaster Evidence" className="w-full max-h-[80vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DisasterAlertsFeed;
