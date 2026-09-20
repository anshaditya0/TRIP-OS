import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserPlus, Search, Check, X, Send, UserCheck, 
  Sparkles, Compass, MapPin, Mail, ShieldCheck, Clock, 
  Trash2, Plus, ArrowRight, Share2, Copy
} from 'lucide-react';
import { FriendUser, FriendRequestItem, ItineraryPlan, UserProfile } from '../types';
import { 
  fetchFriendsApi, 
  sendFriendRequestApi, 
  respondFriendRequestApi, 
  inviteFriendToTripApi, 
  removeFriendApi 
} from '../services/api';

interface FriendsPageProps {
  user: UserProfile;
  savedPlans: ItineraryPlan[];
  onSelectTripToPlan?: (plan: ItineraryPlan) => void;
  onFriendInviteSent?: (tripId: string | number, friendName: string) => void;
}

export const FriendsPage: React.FC<FriendsPageProps> = ({
  user,
  savedPlans,
  onSelectTripToPlan,
  onFriendInviteSent,
}) => {
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Send request form state
  const [friendEmail, setFriendEmail] = useState('');
  const [friendName, setFriendName] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Invite to trip modal state
  const [selectedFriendToInvite, setSelectedFriendToInvite] = useState<FriendUser | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | number>(savedPlans[0]?.id || '');
  const [isInvitingToTrip, setIsInvitingToTrip] = useState(false);

  // Copy own friend code
  const [copiedCode, setCopiedCode] = useState(false);

  const loadFriendsData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchFriendsApi();
      if (data) {
        setFriends(data.friends || []);
        setIncomingRequests(data.incomingRequests || []);
        setOutgoingRequests(data.outgoingRequests || []);
      }
    } catch (err) {
      console.warn('Load friends error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFriendsData();
  }, []);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendEmail.trim()) return;

    setIsSubmittingRequest(true);
    setStatusMessage(null);

    try {
      await sendFriendRequestApi(friendEmail.trim(), friendName.trim() || undefined);
      setStatusMessage({ text: `Friend request sent to ${friendEmail.trim()}! 🚀`, type: 'success' });
      setFriendEmail('');
      setFriendName('');
      loadFriendsData();
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to send friend request.', type: 'error' });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleRespond = async (requestId: number, action: 'ACCEPT' | 'REJECT') => {
    try {
      await respondFriendRequestApi(requestId, action);
      loadFriendsData();
    } catch (err: any) {
      console.warn('Respond request error:', err);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await removeFriendApi(friendId);
      setFriends(prev => prev.filter(f => f.friend_id !== friendId));
    } catch (err) {
      console.warn('Remove friend error:', err);
    }
  };

  const handleConfirmInviteToTrip = async () => {
    if (!selectedFriendToInvite || !selectedTripId) return;
    setIsInvitingToTrip(true);

    try {
      await inviteFriendToTripApi(
        selectedTripId,
        selectedFriendToInvite.friend_id,
        selectedFriendToInvite.email,
        selectedFriendToInvite.name
      );
      if (onFriendInviteSent) {
        onFriendInviteSent(selectedTripId, selectedFriendToInvite.name);
      }
      setSelectedFriendToInvite(null);
    } catch (err: any) {
      alert(err.message || 'Failed to invite friend to trip.');
    } finally {
      setIsInvitingToTrip(false);
    }
  };

  const myExplorerCode = user.email ? `TRIP-${user.email.split('@')[0].toUpperCase()}` : 'TRIP-EXPLORER';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.email || myExplorerCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div id="friends-page-container" className="w-full max-w-5xl mx-auto space-y-8 pb-24">
      {/* Top Banner */}
      <div className="glass-card p-6 sm:p-8 border border-white/90 bg-gradient-to-r from-slate-900 via-neutral-900 to-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/40 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-orange-400" />
                SQUAD TELEMETRY NETWORK
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                {friends.length} CONNECTED EXPLORERS
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
              FRIENDS & EXPEDITION SQUAD
            </h1>
            <p className="text-xs font-mono text-slate-300 max-w-2xl mt-1">
              Add travel companions by email or explorer ID. Approve requests and send direct invites to upcoming trips.
            </p>
          </div>

          {/* Quick share own code pill */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shrink-0 flex flex-col gap-1.5">
            <span className="text-[9px] font-mono font-bold uppercase text-slate-400">YOUR EXPLORER ID & USERNAME</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-orange-300 select-all">
                {user.username ? `@${user.username}` : user.email || myExplorerCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Copy explorer ID"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            {user.username && user.email && (
              <span className="text-[10px] font-mono text-slate-400">
                Email: {user.email}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Left Column = Add Friend Form, Right Column = Pending Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Add New Friend */}
        <div className="glass-card p-6 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/80">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
                SEND FRIEND REQUEST
              </h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase">
                ADD BY @USERNAME OR EMAIL ADDRESS
              </p>
            </div>
          </div>

          <form onSubmit={handleSendRequest} className="space-y-3">
            <div>
              <label className="text-[10px] font-mono font-black uppercase text-slate-600 block mb-1">
                FRIEND'S @USERNAME OR EMAIL *
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. @wanderer or alex@tripos.world"
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono font-black uppercase text-slate-600 block mb-1">
                FRIEND'S NAME (OPTIONAL)
              </label>
              <input
                type="text"
                placeholder="Explorer Name"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
              />
            </div>

            {statusMessage && (
              <div className={`p-3 rounded-xl text-xs font-mono font-bold ${
                statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {statusMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingRequest || !friendEmail.trim()}
              className="w-full py-3 rounded-2xl bg-neutral-950 hover:bg-black disabled:opacity-50 text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-orange-400" />
              <span>{isSubmittingRequest ? 'TRANSMITTING...' : 'TRANSMIT FRIEND REQUEST'}</span>
            </button>
          </form>
        </div>

        {/* Card 2: Incoming Requests Tray */}
        <div className="glass-card p-6 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
                  INCOMING REQUESTS ({incomingRequests.length})
                </h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  LEADER & EXPLORER APPROVALS
                </p>
              </div>
            </div>

            {incomingRequests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-mono font-black">
                {incomingRequests.length} NEW
              </span>
            )}
          </div>

          {incomingRequests.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-mono text-xs">
              <span>No incoming friend requests right now.</span>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-black uppercase text-slate-900 truncate">
                      {req.sender_name || 'Explorer'}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-500 truncate">
                      {req.sender_email}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRespond(req.id, 'ACCEPT')}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-mono font-black uppercase flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                    >
                      <Check className="w-3 h-3" />
                      <span>ACCEPT</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespond(req.id, 'REJECT')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono font-black uppercase transition-all cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Section: Friends Roster */}
      <div className="glass-card p-6 sm:p-8 border border-white/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-2">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>MY FRIENDS ROSTER</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {friends.length} EXPLORERS
              </span>
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase">
              ONE-CLICK DIRECT INVITATION TO EXPEDITIONS
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center font-mono text-xs text-slate-500">
            <span>Loading squad members...</span>
          </div>
        ) : friends.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black uppercase text-slate-800">
              NO FRIENDS ADDED YET
            </h3>
            <p className="text-xs font-mono text-slate-500 max-w-sm mx-auto">
              Use the form above to add your friends by email so you can send direct one-click invites to your trips!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => (
              <div
                key={friend.friend_id}
                className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {friend.avatar ? (
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-11 h-11 rounded-2xl object-cover shrink-0 ring-2 ring-slate-100 bg-slate-100"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-900 to-neutral-800 text-white flex items-center justify-center font-black text-sm uppercase shrink-0 ring-2 ring-slate-100">
                        {friend.name.slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-sm font-black uppercase text-slate-900 truncate">
                        {friend.name}
                      </h4>
                      {friend.username && (
                        <span className="text-[10px] font-mono font-bold text-indigo-600 truncate block">
                          @{friend.username}
                        </span>
                      )}
                      <p className="text-[11px] font-mono text-slate-500 truncate">
                        {friend.email}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Remove ${friend.name} from your friends roster?`)) {
                        handleRemoveFriend(friend.friend_id);
                      }
                    }}
                    className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove friend"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-emerald-600 font-black">
                    <ShieldCheck className="w-3.5 h-3.5" /> CONNECTED
                  </span>
                  <span>TRIP//OS EXPLORER</span>
                </div>

                {/* DIRECT INVITE TO TRIP BUTTON */}
                <button
                  type="button"
                  onClick={() => setSelectedFriendToInvite(friend)}
                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>INVITE TO TRIP</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TRIP PICKER MODAL FOR DIRECT INVITATION */}
      <AnimatePresence>
        {selectedFriendToInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-orange-500" />
                  <h3 className="text-base font-black uppercase text-slate-900">
                    INVITE TO EXPEDITION
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFriendToInvite(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs font-mono text-slate-600">
                Directly approve and add <span className="font-bold text-slate-900">{selectedFriendToInvite.name}</span> to an expedition:
              </p>

              {savedPlans.length === 0 ? (
                <div className="p-4 rounded-2xl bg-amber-50 text-amber-900 text-xs font-mono">
                  <span>No saved trips found yet. Create a trip in the Plans tab first!</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {savedPlans.map((p) => {
                    const cleanId = String(p.id).replace('trip-', '');
                    const isSelected = String(selectedTripId) === cleanId || selectedTripId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedTripId(cleanId)}
                        className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-neutral-900 text-white border-neutral-950 shadow-sm'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-black uppercase block truncate">
                            {p.title || p.destination}
                          </span>
                          <span className={`text-[10px] font-mono block ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {p.dates || 'Active Expedition'}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-orange-400" />}
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                disabled={isInvitingToTrip || savedPlans.length === 0}
                onClick={handleConfirmInviteToTrip}
                className="w-full py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isInvitingToTrip ? 'INVITING...' : 'CONFIRM & ADD TO SQUAD'}</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
