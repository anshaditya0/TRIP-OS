import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, ShieldCheck, FileText, CreditCard, Settings as SettingsIcon, 
  Plus, CheckCircle2, Trash2, ArrowUpRight, DollarSign, Bell, Sliders, Moon, Sparkles,
  Award, Trophy, MapPin, X, Loader2, Edit3, AtSign, RefreshCw, Check
} from 'lucide-react';
import { DigitalDocument, PersonalExpense, UserProfile, JourneyCollectible } from '../types';
import { fetchMyBadges, claimBadgeApi, updateProfileApi } from '../services/api';

interface ProfilePageProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onAddDocument: (doc: DigitalDocument) => void;
  onAddExpense: (expense: PersonalExpense) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onUpdateUser,
  onAddDocument,
  onAddExpense,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'settings'>('profile');
  const [badgeToast, setBadgeToast] = useState<string | null>(null);
  const [isSavingBadge, setIsSavingBadge] = useState(false);

  // Sync badges from Supabase database on mount
  useEffect(() => {
    fetchMyBadges().then((dbBadges) => {
      if (dbBadges && dbBadges.length > 0) {
        const mapped: JourneyCollectible[] = dbBadges.map((b, idx) => ({
          id: b.id ? `col-supabase-${b.id}` : `col-badge-${idx}`,
          destination: b.destination,
          badgeTitle: b.badge_title,
          iconEmoji: b.icon_emoji || '🏆',
          rarity: b.rarity,
          dateUnlocked: b.unlocked_at ? new Date(b.unlocked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : 'RECENT',
          bgGradient: b.bg_gradient || 'from-amber-500 to-orange-500',
          description: b.earned_reason
        }));
        const existingTitles = new Set((user.collectibles || []).map(c => c.badgeTitle));
        const toAdd = mapped.filter(m => !existingTitles.has(m.badgeTitle));
        if (toAdd.length > 0) {
          onUpdateUser({ collectibles: [...toAdd, ...(user.collectibles || [])] });
        }
      }
    }).catch(console.warn);
  }, []);

  // New Document Modal State
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<DigitalDocument['type']>('AADHAAR');
  const [docNumber, setDocNumber] = useState('');
  const [docIssuer, setDocIssuer] = useState('');

  // New Expense Modal State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseTripTitle, setExpenseTripTitle] = useState('GOA MONSOON SURF RETREAT');
  const [expenseCategory, setExpenseCategory] = useState<PersonalExpense['category']>('FOOD');
  const [expenseAmount, setExpenseAmount] = useState(1500);
  const [expensePaymentMethod, setExpensePaymentMethod] = useState('UPI / GPAY');

  // Claim Place Badge Modal State
  const [isClaimBadgeOpen, setIsClaimBadgeOpen] = useState(false);
  const [badgeDestination, setBadgeDestination] = useState('Goa Coastline');
  const [badgeTitle, setBadgeTitle] = useState('🌴 PALOLEM SUNSET CONQUEROR');
  const [badgeEmoji, setBadgeEmoji] = useState('🏖️');
  const [badgeRarity, setBadgeRarity] = useState<'LEGENDARY' | 'RARE' | 'UNCOMMON' | 'COMMON'>('RARE');
  const [badgeDesc, setBadgeDesc] = useState('Unlocked upon completing the trip itinerary & journey check-ins.');

  const handleClaimBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeDestination.trim() || !badgeTitle.trim()) return;

    setIsSavingBadge(true);
    const newCollectible: JourneyCollectible = {
      id: `col-${Date.now()}`,
      destination: badgeDestination.trim(),
      badgeTitle: badgeTitle.trim().toUpperCase(),
      iconEmoji: badgeEmoji.trim() || '🏆',
      rarity: badgeRarity,
      dateUnlocked: 'JUST NOW',
      bgGradient: badgeRarity === 'LEGENDARY' ? 'from-amber-500 to-red-500' : badgeRarity === 'RARE' ? 'from-sky-500 to-emerald-400' : 'from-purple-600 to-pink-500',
      description: badgeDesc.trim() || 'Journey badge unlocked upon trip completion.'
    };

    const currentCollectibles = user.collectibles || [];
    onUpdateUser({ collectibles: [newCollectible, ...currentCollectibles] });

    try {
      await claimBadgeApi({
        destination: badgeDestination.trim(),
        badge_title: badgeTitle.trim().toUpperCase(),
        icon_emoji: badgeEmoji.trim() || '🏆',
        rarity: badgeRarity,
        earned_reason: badgeDesc.trim() || 'Journey badge unlocked upon trip completion.',
        bg_gradient: newCollectible.bgGradient
      });
      setBadgeToast('🏆 BADGE ALLOCATED & SAVED TO SUPABASE POSTGRESQL!');
      setTimeout(() => setBadgeToast(null), 4000);
    } catch (err) {
      console.warn('Failed to persist badge to backend:', err);
    } finally {
      setIsSavingBadge(false);
      setIsClaimBadgeOpen(false);
      setBadgeDestination('');
      setBadgeTitle('');
    }
  };

  // Edit Profile / Avatar State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(user.name || '');
  const [editUsername, setEditUsername] = useState(user.username || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(user.avatar_url || user.avatar || '');
  const [editBio, setEditBio] = useState(user.bio || '');
  const [avatarStyle, setAvatarStyle] = useState('adventurer');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessToast, setProfileSuccessToast] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    setEditName(user.name || '');
    setEditUsername(user.username || '');
    setEditAvatarUrl(user.avatar_url || user.avatar || '');
    setEditBio(user.bio || '');
  }, [user]);

  const DICEBEAR_PRESETS = [
    { name: 'Alpine Nomad', style: 'adventurer', seed: 'Alpine' },
    { name: 'Cyber Voyager', style: 'bottts', seed: 'CyberVoyager' },
    { name: 'Starlight Scout', style: 'lorelei', seed: 'Starlight' },
    { name: 'Desert Hawk', style: 'micah', seed: 'Falcon' },
    { name: 'Apex Pilot', style: 'adventurer', seed: 'Apex' },
    { name: 'Neon Glider', style: 'bottts', seed: 'Pathfinder' },
    { name: 'Himalayan Sherpa', style: 'lorelei', seed: 'Sherpa' },
    { name: 'Quantum Rover', style: 'bottts', seed: 'Quantum' },
    { name: 'Highland Trekker', style: 'adventurer', seed: 'Highland' },
    { name: 'Glacier Ranger', style: 'micah', seed: 'Glacier' },
    { name: 'Pixel Wanderer', style: 'pixel-art', seed: 'Trekker' },
    { name: 'Solar Wayfarer', style: 'fun-emoji', seed: 'Wayfarer' },
  ];

  const getDicebearUrl = (style: string, seed: string) =>
    `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;

  const handleRandomizeAvatar = () => {
    const randomSeed = 'exp_' + Math.random().toString(36).substring(2, 7);
    setAvatarSeed(randomSeed);
    setEditAvatarUrl(getDicebearUrl(avatarStyle, randomSeed));
  };

  const handleSelectPreset = (style: string, seed: string) => {
    setAvatarStyle(style);
    setAvatarSeed(seed);
    setEditAvatarUrl(getDicebearUrl(style, seed));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileError(null);
    try {
      const cleanUsername = editUsername.replace(/^@/, '').trim().toLowerCase();
      const res = await updateProfileApi({
        name: editName.trim(),
        username: cleanUsername,
        avatar_url: editAvatarUrl.trim(),
        bio: editBio.trim()
      });
      const updatedUser = res.user;
      onUpdateUser({
        name: updatedUser.name,
        username: updatedUser.username,
        avatar: updatedUser.avatar_url || editAvatarUrl,
        avatar_url: updatedUser.avatar_url || editAvatarUrl,
        bio: updatedUser.bio
      });
      setProfileSuccessToast('EXPLORER PROFILE & AVATAR UPDATED SUCCESSFULLY');
      setTimeout(() => setProfileSuccessToast(null), 4000);
      setIsEditProfileOpen(false);
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to update profile. Username may already be taken.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Generic Settings State
  const [currency, setCurrency] = useState('INR (₹)');
  const [autoWeather, setAutoWeather] = useState(true);
  const [clayDepth, setClayDepth] = useState('ORGANIC HIGH 3D');
  const [dealNotifications, setDealNotifications] = useState(true);

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !docNumber.trim()) return;

    const newDoc: DigitalDocument = {
      id: `doc-${Date.now()}`,
      name: docName.trim().toUpperCase(),
      type: docType,
      docNumber: docNumber.trim(),
      issuedBy: docIssuer.trim().toUpperCase() || 'OFFICIAL ISSUER',
      uploadedDate: 'TODAY',
      isVerified: true
    };

    onAddDocument(newDoc);
    setDocName('');
    setDocNumber('');
    setDocIssuer('');
    setIsAddDocOpen(false);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || expenseAmount <= 0) return;

    const newExp: PersonalExpense = {
      id: `exp-${Date.now()}`,
      tripTitle: expenseTripTitle.toUpperCase(),
      category: expenseCategory,
      amount: expenseAmount,
      date: 'TODAY',
      paymentMethod: expensePaymentMethod.toUpperCase()
    };

    onAddExpense(newExp);
    setExpenseAmount(1500);
    setIsAddExpenseOpen(false);
  };

  const totalSpent = user.expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="w-full max-w-5xl mx-auto pb-24">
      {/* Header with Sub-tab Switcher (Profile vs Settings) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-black uppercase tracking-widest text-orange-600">
              EXPLORER PROFILE & VAULT
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
            {activeSubTab === 'profile' ? 'EXPLORER VAULT & SPEND' : 'APPLICATION SETTINGS'}
          </h1>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1.5 glass-pill border border-white/80 bg-white/70 shadow-xs">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'profile'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PROFILE & EXPENSES
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'settings'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>SETTINGS</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'profile' ? (
        <div className="space-y-8">
          {/* USER INFO & STATS HERO */}
          <div className="glass-card p-6 sm:p-8 border border-white/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="relative group cursor-pointer" onClick={() => setIsEditProfileOpen(true)}>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-24 h-24 rounded-3xl object-cover ring-2 ring-white shadow-md group-hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-orange-950 text-amber-400 font-black text-3xl flex flex-col items-center justify-center ring-2 ring-white shadow-md">
                    <span>{user.name ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2) : 'EX'}</span>
                    <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mt-0.5">TRIP OS</span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-mono font-black uppercase">
                  <Edit3 className="w-4 h-4 mr-1" /> EDIT
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                    {user.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase">{user.homeCity}</span>
                  {user.username && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[10px] font-mono font-bold">
                      @{user.username}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-900">
                  {user.name}
                </h2>
                {user.bio && (
                  <p className="text-xs font-medium text-slate-600 mt-1 max-w-md italic">
                    "{user.bio}"
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600 justify-center sm:justify-start mt-2">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-orange-500" />
                    <span>{user.email}</span>
                  </div>
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95"
                  >
                    <Edit3 className="w-3 h-3 text-amber-400" />
                    <span>EDIT PROFILE & AVATAR</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-center">
              <div className="p-3 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
                <span className="block text-xl font-black text-slate-900">{user.tripsCount}</span>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">TRIPS DONE</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
                <span className="block text-xl font-black text-slate-900">{user.statesExplored}</span>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">STATES</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
                <span className="block text-xl font-black text-slate-900">{(user.totalMiles).toLocaleString()}</span>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">MILES</span>
              </div>
            </div>
          </div>

          {/* Toast notifications */}
          <AnimatePresence>
            {profileSuccessToast && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="p-3.5 rounded-2xl bg-slate-900 text-amber-400 border border-amber-400/40 font-mono text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{profileSuccessToast}</span>
                </div>
                <button
                  onClick={() => setProfileSuccessToast(null)}
                  className="p-1 hover:bg-white/20 rounded-lg cursor-pointer text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
            {badgeToast && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="p-3.5 rounded-2xl bg-emerald-600 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-200 animate-spin" />
                  <span>{badgeToast}</span>
                </div>
                <button
                  onClick={() => setBadgeToast(null)}
                  className="p-1 hover:bg-white/20 rounded-lg cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DESTINATION COLLECTIBLES & JOURNEY BADGES */}
          <div id="collectibles-section" className="glass-card p-6 border border-amber-200/80 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-amber-200/80 gap-3 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black shadow-xs">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                      JOURNEY COLLECTIBLES & PLACE BADGES
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-black uppercase">
                      {(user.collectibles || []).length} UNLOCKED
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    BADGES EARNED AUTOMATICALLY UPON COMPLETING DESTINATION JOURNEYS
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsClaimBadgeOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95 self-start sm:self-auto"
              >
                <Award className="w-4 h-4 text-white" />
                <span>CLAIM PLACE BADGE</span>
              </button>
            </div>

            {/* Collectibles Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(user.collectibles || []).length === 0 ? (
                <div className="col-span-full p-8 text-center bg-white/80 rounded-2xl border border-slate-200">
                  <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase text-slate-700">NO BADGES COLLECTED YET</p>
                  <p className="text-[11px] font-mono text-slate-500">Finish any trip itinerary or click 'Claim Place Badge' above to register a new destination badge!</p>
                </div>
              ) : (
                user.collectibles?.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs relative overflow-hidden flex flex-col justify-between group"
                  >
                    {/* Top Rarity Ribbon */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider text-white bg-gradient-to-r ${item.bgGradient}`}>
                        {item.rarity}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                        {item.dateUnlocked}
                      </span>
                    </div>

                    {/* Emoji Emblem */}
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-2xl shadow-inner my-1 group-hover:scale-110 transition-transform">
                      {item.iconEmoji}
                    </div>

                    {/* Badge Title & Location */}
                    <div className="my-2">
                      <h4 className="text-xs font-black uppercase text-slate-900 leading-snug">
                        {item.badgeTitle}
                      </h4>
                      <p className="text-[10px] font-mono font-bold text-orange-600 uppercase flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-orange-500" />
                        <span>{item.destination}</span>
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 mt-2 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Verified Badge Stamp */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-mono font-bold text-emerald-700 uppercase">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>JOURNEY COMPLETED</span>
                      </span>
                      <span className="text-slate-400">TRIP OS</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* DIGITAL DOCUMENTATION SAVE VAULT */}
          <div className="glass-card p-6 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                    DIGITAL TRAVEL DOCUMENTS VAULT
                  </h3>
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    SECURE PHYSICAL & E-GOVERNMENT ID REPOSITORIES
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddDocOpen(true)}
                className="px-4 py-2 glass-button text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>SAVE NEW DOCUMENT</span>
              </button>
            </div>

            {/* Document Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user.documents.length === 0 ? (
                <div className="col-span-full p-8 text-center glass-card border border-dashed border-slate-300 rounded-2xl">
                  <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-black uppercase text-slate-600">NO DOCUMENTS STORED YET</p>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                    TAP "+ SAVE NEW DOCUMENT" TO SECURELY STORE YOUR PASSPORT, AADHAAR, OR FLIGHT PASS.
                  </p>
                </div>
              ) : (
                user.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-white/90 border border-slate-200 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 text-slate-700">
                          {doc.type}
                        </span>
                        {doc.isVerified && (
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>VERIFIED</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black uppercase text-slate-900 mb-1">
                        {doc.name}
                      </h4>
                      <p className="text-xs font-mono font-bold text-slate-600 mb-2">
                        {doc.docNumber}
                      </p>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase">
                        ISSUED BY: {doc.issuedBy}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                      <span>ADDED: {doc.uploadedDate}</span>
                      {doc.expiryDate && <span>EXP: {doc.expiryDate}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PERSONAL SPENT ON EACH TRIP TRACKER */}
          <div className="glass-card p-6 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3 mb-6">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  PERSONAL SPENT ON EACH TRIP
                </h3>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  TRACK YOUR INDIVIDUAL CONTRIBUTION ACROSS DESTINATIONS
                </p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="px-4 py-2 rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 text-right">
                  <span className="block text-[10px] font-black uppercase">LIFETIME PERSONAL SPENT</span>
                  <span className="text-lg font-black">₹{totalSpent.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => setIsAddExpenseOpen(true)}
                  className="px-4 py-2.5 glass-button text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>LOG EXPENSE</span>
                </button>
              </div>
            </div>

            {/* Expenses List */}
            <div className="space-y-3">
              {user.expenses.length === 0 ? (
                <div className="p-8 text-center glass-card border border-dashed border-slate-300 rounded-2xl">
                  <p className="text-sm font-black uppercase text-slate-600">NO EXPENSES RECORDED YET</p>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                    TAP "+ LOG EXPENSE" TO RECORD YOUR HOTEL, TRANSPORT, FOOD, OR TRIP ACTIVITY SPENDS.
                  </p>
                </div>
              ) : (
                user.expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white/85 border border-slate-200/80 shadow-2xs gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black text-xs shrink-0">
                        {exp.category === 'TRANSPORT' ? '✈️' : exp.category === 'HOTEL' ? '🏨' : exp.category === 'FOOD' ? '🍲' : exp.category === 'SHOPPING' ? '🛍️' : '🎟️'}
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-slate-900">{exp.tripTitle}</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-extrabold">{exp.category}</span>
                          <span>{exp.date}</span>
                          <span>• {exp.paymentMethod}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right self-end sm:self-auto">
                      <span className="text-sm font-black text-slate-900">
                        ₹{exp.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* SETTINGS PAGE SECTION */
        <div className="glass-card p-6 sm:p-8 border border-white/80 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div>
            <h2 className="text-2xl font-black uppercase text-slate-900 mb-1">
              SYSTEM & TRIP PREFERENCES
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase">
              CUSTOMIZE INTERFACE GLASS THEME, CURRENCY, AND TRAVEL NOTIFICATIONS
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            {/* Currency Choice */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
              <div>
                <span className="block text-xs font-black uppercase text-slate-900">CURRENCY DISPLAY</span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">PRIMARY DISPLAY FOR TRIP BUDGETS</span>
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2 glass-input text-xs font-bold uppercase text-slate-800 cursor-pointer"
              >
                <option value="INR (₹)">INR (₹) INDIAN RUPEE</option>
                <option value="USD ($)">USD ($) US DOLLAR</option>
                <option value="EUR (€)">EUR (€) EURO</option>
              </select>
            </div>

            {/* Weather Auto Theming */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
              <div>
                <span className="block text-xs font-black uppercase text-slate-900">WEATHER AUTO-SYNC BACKGROUND</span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  DYNAMICALLY ADAPTS PAGE THEME ACCORDING TO DESTINATION CLIMATE
                </span>
              </div>
              <button
                onClick={() => setAutoWeather(!autoWeather)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  autoWeather ? 'bg-orange-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    autoWeather ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Glass Interface Style */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs">
              <div>
                <span className="block text-xs font-black uppercase text-slate-900">INTERFACE GLASS & DEPTH STYLE</span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">APPLE-LIKE SOFT GLASS & TRANSLUCENCY</span>
              </div>
              <select
                value={clayDepth}
                onChange={(e) => setClayDepth(e.target.value)}
                className="px-3 py-2 glass-input text-xs font-bold uppercase text-slate-800 cursor-pointer"
              >
                <option value="SOFT FROSTED GLASS">SOFT FROSTED GLASS</option>
                <option value="TRANSLUCENT MINIMAL">TRANSLUCENT MINIMAL</option>
                <option value="CRYSTAL AIR">CRYSTAL AIR</option>
              </select>
            </div>

            {/* Flash Deals & Media Ticker */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/80 border border-slate-200">
              <div>
                <span className="block text-xs font-black uppercase text-slate-900">LIVE AIRLINE DEALS & ALERTS</span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  SHOW REAL-TIME FLIGHT TICKER AND CROWD INDICATORS
                </span>
              </div>
              <button
                onClick={() => setDealNotifications(!dealNotifications)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  dealNotifications ? 'bg-orange-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    dealNotifications ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DIGITAL DOCUMENT MODAL */}
      <AnimatePresence>
        {isAddDocOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-card p-6 border border-white/90 shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <h3 className="text-base font-black uppercase text-slate-900">
                  SAVE DIGITAL TRAVEL DOCUMENT
                </h3>
                <button
                  onClick={() => setIsAddDocOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveDoc} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    DOCUMENT TITLE
                  </label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="E.G. AADHAAR CARD, GOA FLIGHT TICKET"
                    required
                    className="w-full px-3 py-2 text-xs glass-input font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    DOCUMENT TYPE
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DigitalDocument['type'])}
                    className="w-full px-3 py-2 text-xs glass-input font-bold uppercase text-slate-800"
                  >
                    <option value="AADHAAR">AADHAAR CARD</option>
                    <option value="PASSPORT">PASSPORT</option>
                    <option value="TICKET">E-TICKET / BOARDING PASS</option>
                    <option value="INSURANCE">TRAVEL INSURANCE</option>
                    <option value="VOUCHER">HOTEL VOUCHER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    DOCUMENT / IDENTIFIER NUMBER
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="E.G. 1234-5678-9012 OR PNR NUMBER"
                    required
                    className="w-full px-3 py-2 text-xs glass-input font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    ISSUING ENTITY
                  </label>
                  <input
                    type="text"
                    value={docIssuer}
                    onChange={(e) => setDocIssuer(e.target.value)}
                    placeholder="E.G. UIDAI, INDIGO AIRLINES, IRCTC"
                    className="w-full px-3 py-2 text-xs glass-input font-bold uppercase"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3 glass-button text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>SAVE INTO DIGITAL VAULT</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD EXPENSE MODAL */}
      <AnimatePresence>
        {isAddExpenseOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-card p-6 border border-white/90 shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <h3 className="text-base font-black uppercase text-slate-900">
                  LOG PERSONAL EXPENSE
                </h3>
                <button
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    TRIP NAME
                  </label>
                  <input
                    type="text"
                    value={expenseTripTitle}
                    onChange={(e) => setExpenseTripTitle(e.target.value)}
                    placeholder="E.G. GOA RETREAT, MANALI TRIP"
                    required
                    className="w-full px-3 py-2 text-xs glass-input font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    EXPENSE CATEGORY
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as PersonalExpense['category'])}
                    className="w-full px-3 py-2 text-xs glass-input font-bold uppercase text-slate-800"
                  >
                    <option value="TRANSPORT">TRANSPORT</option>
                    <option value="HOTEL">HOTEL / PG</option>
                    <option value="FOOD">FOOD & DINING</option>
                    <option value="SHOPPING">SHOPPING</option>
                    <option value="ACTIVITIES">ACTIVITIES</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    AMOUNT (INR ₹)
                  </label>
                  <input
                    type="number"
                    value={expenseAmount || ''}
                    onChange={(e) => setExpenseAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                    min="1"
                    step="any"
                    placeholder="Enter amount (e.g. 1000)"
                    required
                    className="w-full px-3 py-2 text-xs glass-input font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    PAYMENT METHOD
                  </label>
                  <input
                    type="text"
                    value={expensePaymentMethod}
                    onChange={(e) => setExpensePaymentMethod(e.target.value)}
                    placeholder="E.G. UPI / GPAY / HDFC CARD"
                    className="w-full px-3 py-2 text-xs glass-input font-bold uppercase"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3 glass-button text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>RECORD EXPENSE</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* CLAIM PLACE BADGE MODAL */}
      <AnimatePresence>
        {isClaimBadgeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-card p-6 border border-amber-300 bg-white/95 shadow-[0_25px_60px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-amber-100 mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-black uppercase text-slate-900">
                    CLAIM DESTINATION BADGE
                  </h3>
                </div>
                <button
                  onClick={() => setIsClaimBadgeOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleClaimBadge} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    DESTINATION NAME *
                  </label>
                  <input
                    type="text"
                    value={badgeDestination}
                    onChange={(e) => setBadgeDestination(e.target.value)}
                    placeholder="E.G. GOA COASTLINE, VARANASI GHATS, SHIMLA"
                    required
                    className="w-full px-3 py-2 text-xs glass-input font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    BADGE TITLE *
                  </label>
                  <input
                    type="text"
                    value={badgeTitle}
                    onChange={(e) => setBadgeTitle(e.target.value)}
                    placeholder="E.G. 🌴 PALOLEM SUNSET CONQUEROR"
                    required
                    className="w-full px-3 py-2 text-xs glass-input font-bold uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      EMBLEM EMOJI
                    </label>
                    <input
                      type="text"
                      value={badgeEmoji}
                      onChange={(e) => setBadgeEmoji(e.target.value)}
                      placeholder="e.g. 🏄‍♂️, 🏔️, 🏰, ☕"
                      className="w-full px-3 py-2 text-xs glass-input font-bold text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      RARITY LEVEL
                    </label>
                    <select
                      value={badgeRarity}
                      onChange={(e) => setBadgeRarity(e.target.value as JourneyCollectible['rarity'])}
                      className="w-full px-3 py-2 text-xs glass-input font-bold uppercase text-slate-800"
                    >
                      <option value="COMMON">COMMON</option>
                      <option value="UNCOMMON">UNCOMMON</option>
                      <option value="RARE">RARE</option>
                      <option value="LEGENDARY">LEGENDARY</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    JOURNEY DESCRIPTION
                  </label>
                  <textarea
                    value={badgeDesc}
                    onChange={(e) => setBadgeDesc(e.target.value)}
                    placeholder="Short note about your memory or adventure at this place"
                    rows={2}
                    className="w-full px-3 py-2 text-xs glass-input font-mono"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl shadow-md cursor-pointer transition-transform active:scale-95"
                  >
                    <Award className="w-4 h-4 text-white" />
                    <span>UNLOCK BADGE TO PROFILE</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PROFILE & AVATAR MODAL */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card p-6 sm:p-8 border border-white/80 bg-white/95 shadow-[0_25px_70px_rgba(0,0,0,0.3)] rounded-3xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-amber-400 flex items-center justify-center font-black shadow-xs">
                    <Edit3 className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                      EDIT EXPLORER IDENTITY & AVATAR
                    </h3>
                    <p className="text-xs font-bold text-slate-500 uppercase">
                      CUSTOMIZE AVATAR, CHOOSE USERNAME & UPDATE BIO
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditProfileOpen(false)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {profileError && (
                <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono font-bold uppercase tracking-wider">
                  ⚠️ {profileError}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* AVATAR SECTION */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-black uppercase text-slate-700 tracking-wider">
                      SELECT OR GENERATE EXPLORER AVATAR
                    </span>
                    <button
                      type="button"
                      onClick={handleRandomizeAvatar}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> RANDOMIZE SEED
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-4">
                    {/* Live Preview */}
                    <div className="relative">
                      <img
                        src={editAvatarUrl || getDicebearUrl('adventurer', 'explorer')}
                        alt="Avatar Preview"
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover bg-white ring-4 ring-amber-400/40 shadow-lg"
                      />
                      <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 text-[9px] font-mono font-black uppercase">
                        PREVIEW
                      </span>
                    </div>

                    {/* Generator Controls */}
                    <div className="flex-1 space-y-3 w-full">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono font-bold uppercase text-slate-600 mb-1">
                            AVATAR STYLE
                          </label>
                          <select
                            value={avatarStyle}
                            onChange={(e) => {
                              const newStyle = e.target.value;
                              setAvatarStyle(newStyle);
                              setEditAvatarUrl(getDicebearUrl(newStyle, avatarSeed || editUsername || 'explorer'));
                            }}
                            className="w-full px-3 py-2 text-xs glass-input font-bold uppercase text-slate-800"
                          >
                            <option value="adventurer">Adventurer (Illustrated)</option>
                            <option value="bottts">Bottts (Cyborg / Tech)</option>
                            <option value="lorelei">Lorelei (Minimalist Chic)</option>
                            <option value="micah">Micah (Modern Flat)</option>
                            <option value="pixel-art">Pixel Art (Retro)</option>
                            <option value="fun-emoji">Fun Emoji (Vibrant)</option>
                            <option value="avataaars">Avataaars (Cartoon)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono font-bold uppercase text-slate-600 mb-1">
                            CUSTOM SEED / NAME
                          </label>
                          <input
                            type="text"
                            value={avatarSeed}
                            onChange={(e) => {
                              const seed = e.target.value;
                              setAvatarSeed(seed);
                              setEditAvatarUrl(getDicebearUrl(avatarStyle, seed || 'explorer'));
                            }}
                            placeholder="e.g. Phoenix, Trekker..."
                            className="w-full px-3 py-2 text-xs glass-input font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-slate-600 mb-1">
                          DIRECT IMAGE URL (OPTIONAL)
                        </label>
                        <input
                          type="url"
                          value={editAvatarUrl}
                          onChange={(e) => setEditAvatarUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-1.5 text-[11px] glass-input font-mono text-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 12 Presets Grid */}
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-2">
                      OR CHOOSE A QUICK EXPLORER PRESET:
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {DICEBEAR_PRESETS.map((preset) => {
                        const url = getDicebearUrl(preset.style, preset.seed);
                        const isSelected = editAvatarUrl === url;
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handleSelectPreset(preset.style, preset.seed)}
                            className={`p-1.5 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-100 ring-2 ring-amber-500 shadow-sm scale-105'
                                : 'bg-white hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            <img
                              src={url}
                              alt={preset.name}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-50"
                            />
                            <span className="text-[9px] font-mono font-bold text-slate-700 truncate w-full text-center">
                              {preset.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* USER INFO FIELDS */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                        FULL NAME *
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Your full name"
                        required
                        className="w-full px-3.5 py-2.5 text-xs glass-input font-bold uppercase text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                        EXPLORER USERNAME (@HANDLE) *
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-slate-400 font-mono font-bold text-xs">@</span>
                        <input
                          type="text"
                          value={editUsername.replace(/^@/, '')}
                          onChange={(e) => setEditUsername(e.target.value.replace(/^@/, '').toLowerCase().trim())}
                          placeholder="username_explorer"
                          required
                          className="w-full pl-7 pr-3.5 py-2.5 text-xs glass-input font-mono font-bold text-slate-900"
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                        Friends & squad leaders can search and invite you with this username.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                      EXPLORER BIO & MOTTO
                    </label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="e.g. Alpine trekker, foodie & sunset chaser across India."
                      rows={2}
                      maxLength={160}
                      className="w-full px-3.5 py-2.5 text-xs glass-input font-medium text-slate-800"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                      <span>Max 160 characters</span>
                      <span>{editBio.length} / 160</span>
                    </div>
                  </div>
                </div>

                {/* MODAL ACTIONS */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-mono font-bold uppercase hover:bg-slate-100 cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                  >
                    {isUpdatingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>SAVING...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>SAVE PROFILE & AVATAR</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
