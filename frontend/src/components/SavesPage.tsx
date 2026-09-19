import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bookmark, MapPin, QrCode, Upload, Trash2, CheckSquare, Square, 
  Share2, Image as ImageIcon, Plus, ExternalLink, Download, FileText, Sparkles 
} from 'lucide-react';
import { ItineraryPlan, TripPhoto } from '../types';

interface SavesPageProps {
  savedPlans: ItineraryPlan[];
  onSelectPlan: (plan: ItineraryPlan) => void;
  onDeletePlan: (planId: string) => void;
}

interface NoteItem {
  id: string;
  text: string;
  isCompleted: boolean;
  category: 'PACKING' | 'DOCS' | 'CONTACTS' | 'GENERAL';
}

export const SavesPage: React.FC<SavesPageProps> = ({
  savedPlans,
  onSelectPlan,
  onDeletePlan,
}) => {
  // Travel Notes Scratchpad State with localStorage persistence (v2 clean storage)
  const NOTES_STORAGE_KEY = 'tripos_saved_notes_v2';
  try {
    localStorage.removeItem('tripos_saved_notes');
  } catch {}

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(NOTES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<NoteItem['category']>('GENERAL');
  const [noteFeedback, setNoteFeedback] = useState<string | null>(null);
  const [inputError, setInputError] = useState(false);

  // Google Drive Trip Photos Dropzone State with localStorage persistence
  const [photos, setPhotos] = useState<TripPhoto[]>(() => {
    try {
      const saved = localStorage.getItem('tripos_saved_photos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const handleToggleNote = (id: string) => {
    setNotes((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isCompleted: !n.isCompleted } : n));
      try {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) {
      setInputError(true);
      setNoteFeedback('⚠️ PLEASE ENTER A NOTE OR REMINDER FIRST!');
      setTimeout(() => setInputError(false), 800);
      setTimeout(() => setNoteFeedback(null), 3000);
      return;
    }

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      text: newNoteText.trim().toUpperCase(),
      isCompleted: false,
      category: newNoteCategory
    };

    setNotes((prev) => {
      const updated = [newNote, ...prev];
      try {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setNewNoteText('');
    setInputError(false);
    setNoteFeedback('✅ NOTE ADDED TO PACKING CHECKLIST!');
    setTimeout(() => setNoteFeedback(null), 2500);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      try {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setNoteFeedback('🗑️ ITEM REMOVED');
    setTimeout(() => setNoteFeedback(null), 2000);
  };

  // Photo upload simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newPhoto: TripPhoto = {
        id: `photo-${Date.now()}`,
        url: URL.createObjectURL(file),
        caption: file.name.toUpperCase().replace(/\.[^/.]+$/, ''),
        uploadedAt: 'JUST NOW',
        sizeMb: Math.round((file.size / (1024 * 1024)) * 10) / 10
      };
      setPhotos((prev) => {
        const updated = [newPhoto, ...prev];
        try {
          localStorage.setItem('tripos_saved_photos', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  const handleCopyDriveLink = () => {
    const link = 'https://drive.google.com/drive/folders/yatra-trip-photos-vault-shared';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopyStatus('GOOGLE DRIVE SHARE LINK COPIED!');
      setTimeout(() => setCopyStatus(null), 3000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Bookmark className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-black uppercase tracking-widest text-orange-600">
            SAVED PLANS & VAULT
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900">
          YOUR SAVED TRIPS & MEDIA VAULT
        </h1>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
          SAVED ROUTE MAPS • TRIP NOTES SCRATCHPAD • GOOGLE DRIVE QR DUMP
        </p>
      </div>

      {/* 1. SAVED MAPS & LOCATIONS GALLERY */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
            SAVED ITINERARIES & ROUTE MAPS ({savedPlans.length})
          </h2>
        </div>

        {savedPlans.length === 0 ? (
          <div className="p-8 text-center glass-card border border-dashed border-slate-300">
            <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-black uppercase text-slate-600">NO SAVED TRIPS YET</p>
            <p className="text-xs font-bold text-slate-400 uppercase mt-1">
              GO TO PLANS PAGE AND CLICK "SAVE TRIP" TO PIN ITINERARIES HERE.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPlans.map((plan) => (
              <div
                key={plan.id}
                className="glass-card p-5 border border-white/80 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-950 text-[10px] font-black uppercase">
                      SAVED • {plan.createdAt}
                    </span>
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-2xs"
                      style={{ backgroundColor: plan.exhaustion.color }}
                    >
                      {plan.exhaustion.level} ({plan.exhaustion.score}%)
                    </span>
                  </div>

                  <h3 className="text-base font-black uppercase text-slate-900 mb-1">
                    {plan.title}
                  </h3>
                  <p className="text-xs font-bold text-slate-600 uppercase mb-3">
                    📍 {plan.fromLocation} ➔ {plan.toLocation} ({plan.transportMode.toUpperCase()})
                  </p>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/70 text-xs font-black uppercase mb-4">
                    <span>BUDGET: ₹{plan.budget.toLocaleString()}</span>
                    <span className="text-orange-700">₹{plan.budgetSplit.perPerson.toLocaleString()} / PERSON</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onDeletePlan(plan.id)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all cursor-pointer border border-slate-200"
                    title="Remove saved plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelectPlan(plan)}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold uppercase tracking-wider text-center cursor-pointer shadow-md rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-slate-800"
                  >
                    <span>OPEN DETAILED BLUEPRINT</span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. TRIP NOTES & CHECKLIST SCRATCHPAD */}
      <div className="mb-10 glass-card p-6 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                TRIP NOTES & PACKING CHECKLIST
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase">
                INSTANT AUTO-SAVED PACKING LIST & EMERGENCY LOG
              </p>
            </div>
          </div>
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row items-center gap-2 mb-3">
          <input
            type="text"
            value={newNoteText}
            onChange={(e) => {
              setNewNoteText(e.target.value);
              if (inputError) setInputError(false);
            }}
            placeholder="ADD NEW PACKING ITEM, FLIGHT PNR, OR REMINDER..."
            className={`w-full sm:flex-1 px-4 py-2.5 glass-input text-xs font-medium uppercase placeholder:text-slate-400 transition-all ${
              inputError ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/30' : ''
            }`}
          />
          <select
            value={newNoteCategory}
            onChange={(e) => setNewNoteCategory(e.target.value as NoteItem['category'])}
            className="px-3 py-2.5 glass-input text-xs font-bold uppercase text-slate-700 cursor-pointer"
          >
            <option value="GENERAL">GENERAL</option>
            <option value="PACKING">PACKING</option>
            <option value="DOCS">DOCUMENTS</option>
            <option value="CONTACTS">CONTACTS</option>
          </select>
          <button
            type="submit"
            id="btn-add-note"
            className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 hover:bg-black active:scale-95 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all border border-neutral-700"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>ADD NOTE</span>
          </button>
        </form>

        {/* Note Feedback Toast */}
        <AnimatePresence>
          {noteFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`p-2.5 rounded-xl text-xs font-mono font-bold uppercase text-center mb-3 flex items-center justify-center gap-2 shadow-xs ${
                noteFeedback.includes('⚠️')
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              <span>{noteFeedback}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes Items List */}
        <div className="space-y-2">
          {notes.length === 0 ? (
            <div className="p-6 text-center glass-card border border-dashed border-slate-300 rounded-2xl">
              <p className="text-sm font-black uppercase text-slate-600">NO CHECKLIST NOTES YET</p>
              <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                TYPE A TO-DO ABOVE AND CLICK "+ ADD NOTE" TO BUILD YOUR PERSONAL PACKING LIST & EMERGENCY LOG.
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  note.isCompleted
                    ? 'bg-slate-100/60 border-slate-200/60 text-slate-400'
                    : 'bg-white/80 border-slate-200/80 text-slate-800 shadow-2xs'
                }`}
              >
                <div
                  onClick={() => handleToggleNote(note.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  {note.isCompleted ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className={`text-xs font-bold uppercase truncate ${note.isCompleted ? 'line-through' : ''}`}>
                    {note.text}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-600">
                    {note.category}
                  </span>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. GOOGLE DRIVE QR & PHOTO DROPZONE */}
      <div className="glass-card p-6 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                GOOGLE DRIVE TRIP QR & PHOTO DROP
              </h2>
              <p className="text-xs font-bold text-slate-500 uppercase">
                DROP TRIP IMAGES & SHARE THE QR CODE WITH ALL YOUR FRIENDS
              </p>
            </div>
          </div>

          <button
            id="btn-share-qr-friends"
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 border border-slate-700 self-start sm:self-auto"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>SHARE QR TO FRIENDS</span>
          </button>
        </div>

        {/* Drag and Drop Upload Area */}
        <label className="relative flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-orange-300/80 bg-orange-50/30 hover:bg-orange-50/60 cursor-pointer transition-colors text-center mb-6">
          <Upload className="w-8 h-8 text-orange-500 mb-2 animate-bounce" />
          <span className="text-sm font-black uppercase text-slate-900">
            DRAG & DROP TRIP PHOTOS HERE, OR BROWSE
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase mt-1">
            AUTO-SYNCED TO SHARED GOOGLE DRIVE ALBUM • HIGH QUALITY BACKUP
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>

        {/* Gallery Grid of Uploaded Trip Photos */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
            SHARED ALBUM PHOTOS ({photos.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {photos.length === 0 ? (
              <div className="p-8 text-center glass-card border border-dashed border-slate-300 rounded-2xl col-span-full">
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-black uppercase text-slate-600">NO SHARED PHOTOS YET</p>
                <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                  DRAG & DROP IMAGES ABOVE OR SCAN THE GOOGLE DRIVE QR TO UPLOAD MEMORIES DIRECTLY FROM YOUR PHONE.
                </p>
              </div>
            ) : (
              photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative rounded-2xl overflow-hidden aspect-square border border-white/80 shadow-2xs group"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 text-white">
                    <p className="text-[10px] font-black uppercase truncate">{photo.caption}</p>
                    <p className="text-[9px] font-bold text-white/70">{photo.sizeMb} MB • {photo.uploadedAt}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SHAREABLE GOOGLE DRIVE QR MODAL */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-card p-6 border border-white text-center shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-black uppercase text-slate-900">
                    SCAN TO DUMP & VIEW TRIP IMAGES
                  </span>
                </div>
                <button
                  onClick={() => setIsQrModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-600 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* High-Contrast Interactive QR Code Graphic */}
              <div className="w-56 h-56 mx-auto p-4 rounded-3xl bg-white shadow-lg border-2 border-slate-200 flex flex-col items-center justify-center mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Outer QR Corner Anchors */}
                  <rect x="10" y="10" width="24" height="24" rx="4" fill="#0f172a" />
                  <rect x="14" y="14" width="16" height="16" rx="2" fill="white" />
                  <rect x="18" y="18" width="8" height="8" rx="1" fill="#ea580c" />

                  <rect x="66" y="10" width="24" height="24" rx="4" fill="#0f172a" />
                  <rect x="70" y="14" width="16" height="16" rx="2" fill="white" />
                  <rect x="74" y="18" width="8" height="8" rx="1" fill="#ea580c" />

                  <rect x="10" y="66" width="24" height="24" rx="4" fill="#0f172a" />
                  <rect x="14" y="70" width="16" height="16" rx="2" fill="white" />
                  <rect x="18" y="74" width="8" height="8" rx="1" fill="#ea580c" />

                  {/* QR Matrix Bits */}
                  <rect x="42" y="14" width="6" height="6" fill="#0f172a" />
                  <rect x="52" y="18" width="6" height="6" fill="#0f172a" />
                  <rect x="42" y="32" width="6" height="6" fill="#0f172a" />
                  <rect x="30" y="42" width="6" height="6" fill="#0f172a" />
                  <rect x="62" y="42" width="6" height="6" fill="#0f172a" />
                  <rect x="46" y="46" width="8" height="8" rx="2" fill="#ea580c" />
                  <rect x="38" y="62" width="6" height="6" fill="#0f172a" />
                  <rect x="54" y="68" width="6" height="6" fill="#0f172a" />
                  <rect x="72" y="60" width="6" height="6" fill="#0f172a" />
                  <rect x="80" y="76" width="6" height="6" fill="#0f172a" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 mt-1">
                  SHARED DRIVE VAULT
                </span>
              </div>

              <p className="text-xs font-bold text-slate-700 uppercase mb-4">
                FRIENDS CAN SCAN THIS QR USING THEIR CAMERA TO INSTANTLY OPEN THE SHARED FOLDER AND UPLOAD THEIR TRIP PHOTOS!
              </p>

              {copyStatus && (
                <div className="p-2 mb-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-black uppercase">
                  {copyStatus}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyDriveLink}
                  className="flex-1 py-3 glass-button text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Share2 className="w-4 h-4" />
                  <span>COPY SHARE LINK</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
