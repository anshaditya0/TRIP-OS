import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, X, Check, Calendar, Users, DollarSign, AlertTriangle, 
  Sparkles, ArrowRight, Clock, ShieldCheck, UserCheck, Trash2,
  Compass, ExternalLink
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onApproveMember?: (tripId: string, memberId: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onApproveMember,
  onNavigateToTab
}) => {
  const [filter, setFilter] = useState<'ALL' | 'TRIP' | 'REQUESTS' | 'BUDGET'>('ALL');

  if (!isOpen) return null;

  const filtered = notifications.filter(n => {
    if (filter === 'ALL') return true;
    if (filter === 'TRIP') return n.type === 'TRIP_UPCOMING' || n.type === 'PREFERENCES_SUBMITTED' || n.type === 'DESTINATION_RECOMMENDATION';
    if (filter === 'REQUESTS') return n.type === 'JOIN_REQUEST';
    if (filter === 'BUDGET') return n.type === 'BUDGET_ALERT';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end sm:pr-8 pt-16 sm:pt-20 px-4 bg-slate-950/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center ring-1 ring-orange-500/30">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    MISSION TELEMETRY NOTIFICATIONS
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-black">
                      {unreadCount} NEW
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  TRIP UPDATES • JOIN REQUESTS • BUDGET ALERTS
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Pills & Mark Read */}
          <div className="p-3 bg-slate-50/80 border-b border-slate-200/60 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              {(['ALL', 'TRIP', 'REQUESTS', 'BUDGET'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    filter === tab
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[10px] font-bold uppercase text-orange-600 hover:text-orange-700 whitespace-nowrap cursor-pointer transition-colors"
              >
                CLEAR UNREAD
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                  ALL CAUGHT UP!
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                  NO ACTIVE NOTIFICATIONS IN THIS CATEGORY
                </p>
              </div>
            ) : (
              filtered.map((item) => {
                const getIcon = () => {
                  switch (item.type) {
                    case 'TRIP_UPCOMING':
                      return <Calendar className="w-4 h-4 text-emerald-600" />;
                    case 'JOIN_REQUEST':
                      return <Users className="w-4 h-4 text-blue-600" />;
                    case 'BUDGET_ALERT':
                      return <DollarSign className="w-4 h-4 text-amber-600" />;
                    case 'DESTINATION_RECOMMENDATION':
                    case 'PREFERENCES_SUBMITTED':
                      return <Sparkles className="w-4 h-4 text-purple-600" />;
                    default:
                      return <Bell className="w-4 h-4 text-orange-600" />;
                  }
                };

                const getBg = () => {
                  switch (item.type) {
                    case 'TRIP_UPCOMING': return 'bg-emerald-50/80 border-emerald-200/60';
                    case 'JOIN_REQUEST': return 'bg-blue-50/80 border-blue-200/60';
                    case 'BUDGET_ALERT': return 'bg-amber-50/80 border-amber-200/60';
                    case 'DESTINATION_RECOMMENDATION':
                    case 'PREFERENCES_SUBMITTED': return 'bg-purple-50/80 border-purple-200/60';
                    default: return 'bg-slate-50/80 border-slate-200/60';
                  }
                };

                return (
                  <div
                    key={item.id}
                    onClick={() => onMarkAsRead(item.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${getBg()} ${
                      !item.read ? 'ring-1 ring-orange-400/50 shadow-xs' : 'opacity-85'
                    }`}
                  >
                    {!item.read && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-500"></span>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white shadow-2xs flex items-center justify-center shrink-0">
                        {getIcon()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between pr-4">
                          <h4 className="text-xs font-black uppercase text-slate-900 tracking-tight">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-600 mt-0.5 leading-snug">
                          {item.message}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {item.timestamp}
                          </span>

                          <div className="flex items-center gap-2">
                            {item.type === 'JOIN_REQUEST' && item.tripId && item.memberId && onApproveMember && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onApproveMember(item.tripId!, item.memberId!);
                                  onMarkAsRead(item.id);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>APPROVE</span>
                              </button>
                            )}

                            {item.actionLabel && onNavigateToTab && item.actionTab && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateToTab(item.actionTab!);
                                  onClose();
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <span>{item.actionLabel}</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-100/80 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase px-5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              REALTIME GROUP SYNC ACTIVE
            </span>
            <span>TRIP//OS v2.4</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
