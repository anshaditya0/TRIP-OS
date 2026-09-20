import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserPlus, Copy, Check, Share2, QrCode, 
  ShieldCheck, Clock, X, Sparkles, AlertCircle, UserCheck, Trash2
} from 'lucide-react';
import { TripMember, FriendUser } from '../../types';
import { fetchFriendsApi } from '../../services/api';

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripName: string;
  inviteCode: string;
  members: TripMember[];
  onAddMember: (name: string, email?: string) => void;
  onApproveMember: (memberId: string) => void;
  onRemoveMember?: (memberId: string) => void;
  onSelectMemberToEditPreferences?: (member: TripMember) => void;
}

export const AddMembersModal: React.FC<AddMembersModalProps> = ({
  isOpen,
  onClose,
  tripName,
  inviteCode,
  members,
  onAddMember,
  onApproveMember,
  onRemoveMember,
  onSelectMemberToEditPreferences,
}) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [friends, setFriends] = useState<FriendUser[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchFriendsApi().then(data => {
        if (data && Array.isArray(data.friends)) {
          setFriends(data.friends);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const inviteLink = `${window.location.origin}/join/${inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `Join our TRIP//OS Expedition "${tripName}"! Fill your 9 Vibe Preferences so GroupDNA can finalize our destination: ${inviteLink} (Code: ${inviteCode})`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName.trim()) {
      onAddMember(newMemberName.trim(), newMemberEmail.trim() || undefined);
      setNewMemberName('');
      setNewMemberEmail('');
    }
  };

  const approvedCount = members.filter(m => m.status === 'APPROVED').length;
  const preferencesDoneCount = members.filter(m => m.status === 'APPROVED' && m.preferencesSubmitted).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="w-full max-w-xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_25px_70px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-neutral-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center ring-1 ring-orange-500/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <span>EXPEDITION SQUAD & MEMBERS</span>
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/30 text-orange-300 text-[10px] font-mono">
                    {approvedCount} MEMBERS
                  </span>
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  INVITE COLLABORATORS • GATHER 9 VIBE PREFERENCES
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

          <div className="p-6 overflow-y-auto space-y-6">
            {/* Invite Link & Code Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50/80 to-amber-50/50 border border-orange-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-orange-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  SHAREABLE EXPEDITION INVITE LINK
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                  CODE: {inviteCode}
                </span>
              </div>

              {/* Link Input Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-white border border-orange-200 text-xs font-mono font-bold text-slate-800 select-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'COPIED!' : 'COPY'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowQr(!showQr)}
                  className={`p-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 ${
                    showQr ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Toggle QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>

              {/* QR Code Reveal */}
              {showQr && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-xl bg-white border border-orange-200/80 flex flex-col items-center justify-center text-center space-y-2"
                >
                  <div className="w-36 h-36 p-2 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(inviteLink)}`}
                      alt="Trip Invite QR Code"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    SCAN WITH CAMERA TO JOIN ON MOBILE
                  </p>
                </motion.div>
              )}
            </div>

            {/* Direct Add Member Form */}
            <form onSubmit={handleAddSubmit} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-slate-600" />
                QUICK DIRECT ADD MEMBER
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="MEMBER NAME (E.G. ROHAN, AANYA)"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="email"
                  placeholder="EMAIL (OPTIONAL)"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                type="submit"
                disabled={!newMemberName.trim()}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-xs"
              >
                + ADD MEMBER TO TRIP ROSTER
              </button>
            </form>

            {/* Quick Add from Friends List */}
            {friends.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/80 space-y-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-orange-900 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-orange-600" />
                  OR ADD FROM YOUR CONNECTED FRIENDS:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {friends.map((f) => {
                    const alreadyInTrip = members.some(m => m.email?.toLowerCase() === f.email.toLowerCase() || m.name.toLowerCase() === f.name.toLowerCase());
                    return (
                      <button
                        key={f.friend_id}
                        type="button"
                        disabled={alreadyInTrip}
                        onClick={() => onAddMember(f.name, f.email)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          alreadyInTrip
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed opacity-60'
                            : 'bg-white hover:bg-orange-500 hover:text-white text-slate-800 border border-orange-200 shadow-2xs'
                        }`}
                      >
                        <span>{f.name}</span>
                        {alreadyInTrip ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3 text-orange-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Members Roster */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span>TRIP ROSTER & PREFERENCE PROGRESS</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                    {preferencesDoneCount}/{approvedCount} PREFERENCES IN
                  </span>
                </span>
              </div>

              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-400 to-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs uppercase">
                        {member.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black uppercase text-slate-900 truncate">
                            {member.name}
                          </p>
                          {member.role === 'LEADER' && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider">
                              LEADER
                            </span>
                          )}
                          {member.status === 'PENDING' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              PENDING APPROVAL
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {member.preferencesSubmitted ? (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 uppercase">
                              <Check className="w-3 h-3 text-emerald-600" />
                              9 PREFERENCES LOGGED
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1 uppercase">
                              <Clock className="w-3 h-3 text-amber-600" />
                              PREFERENCES PENDING
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {member.status === 'PENDING' ? (
                        <button
                          type="button"
                          onClick={() => onApproveMember(member.id)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>APPROVE</span>
                        </button>
                      ) : (
                        onSelectMemberToEditPreferences && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectMemberToEditPreferences(member);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-900 text-[10px] font-black uppercase tracking-wider border border-slate-200 cursor-pointer transition-colors"
                            title="Edit or fill 9 preferences as this member"
                          >
                            <span>{member.preferencesSubmitted ? 'EDIT VIBE' : 'FILL VIBE'}</span>
                          </button>
                        )
                      )}

                      {member.role !== 'LEADER' && onRemoveMember && (
                        <button
                          type="button"
                          onClick={() => onRemoveMember(member.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              DESTINATION IS LOCKED UNTIL ALL MEMBERS LOG PREFERENCES
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider cursor-pointer shadow-xs"
            >
              DONE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
