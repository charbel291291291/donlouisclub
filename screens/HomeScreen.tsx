
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, AdminSettings, MembershipTier } from '../types';
import { TIER_CONFIG, SOCIAL_PROOF_MESSAGES, BRAND_TAGLINE } from '../constants';
import { Crown, Star, ChevronRight } from 'lucide-react';
import { playSound } from '../utils/sound';

interface HomeScreenProps {
  user: UserProfile | null;
  adminSettings: AdminSettings;
  onScan: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user, adminSettings, onScan }) => {
  const CYCLE_TARGET = 5;
  const visits = user?.visitsInCycle || 0;
  const visitsRemaining = CYCLE_TARGET - visits;
  const progressPercent = (visits / CYCLE_TARGET) * 100;

  const currentTier = useMemo(() => {
    const p = user?.points || 0;
    if (p >= 24) return MembershipTier.PLATINUM;
    if (p >= 12) return MembershipTier.GOLD;
    if (p >= 6) return MembershipTier.SILVER;
    return MembershipTier.BRONZE;
  }, [user?.points]);

  const tierConfig = TIER_CONFIG[currentTier];
  const isNearCompletion = visitsRemaining <= 2 && visitsRemaining > 0;
  const isOneAway = visitsRemaining === 1;
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState({ title: '', body: '' });
  const [proofIndex, setProofIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProofIndex((prev) => (prev + 1) % SOCIAL_PROOF_MESSAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let triggered = false;
    if (isOneAway) {
      setNotificationMessage({ title: "Keep Going", body: "You are 1 visit away from your reward." });
      triggerNotification();
      return;
    }
    // Simple random trigger for brand philosophy
    if (!triggered && Math.random() < 0.2) {
       setNotificationMessage({ title: "Philosophy", body: adminSettings.content.brandTagline || BRAND_TAGLINE });
       triggerNotification();
    }
  }, [isOneAway, adminSettings.content.brandTagline]);

  const triggerNotification = () => {
    const timer = setTimeout(() => {
        setShowNotification(true);
        playSound('soft');
    }, 2500);
    const hideTimer = setTimeout(() => setShowNotification(false), 8000);
    return () => { clearTimeout(timer); clearTimeout(hideTimer); };
  };

  const highlightedItem = useMemo(() => {
    return adminSettings.menuItems.find(i => i.id === adminSettings.bestMenuItemId) || adminSettings.menuItems[0];
  }, [adminSettings.bestMenuItemId, adminSettings.menuItems]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-[#030303] pb-32 px-6 pt-12 relative overflow-x-hidden"
    >
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
      
      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            className="fixed top-6 left-6 right-6 z-[100]"
          >
            <div className="bg-[#111]/90 backdrop-blur-xl border-l-2 border-[#BF953F] p-5 shadow-2xl flex items-center gap-4">
               <div>
                  <p className="text-[#BF953F] text-[9px] font-black uppercase tracking-widest mb-1">{notificationMessage.title}</p>
                  <p className="text-zinc-300 text-[10px] leading-relaxed font-medium">{notificationMessage.body}</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-serif text-white leading-tight mb-2">
            {user?.firstName}
          </h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 w-fit">
             <div className={`w-1.5 h-1.5 rounded-full ${tierConfig.color === '#ffffff' ? 'bg-white' : 'bg-[#BF953F]'} animate-pulse`} />
             <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.2em]">{tierConfig.badge}</p>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md">
          <span className="font-serif text-[#E5C579] text-lg">DL</span>
        </div>
      </header>

      {/* Heavy Metallic Loyalty Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full aspect-[1.9/1] rounded-[2rem] p-8 mb-10 overflow-hidden group shadow-2xl shadow-black"
      >
        <div className="absolute inset-0 bg-[#080808] z-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#151515] to-[#000] z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_50%)] z-0" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent z-0" />
        <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-overlay z-0" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[8px] text-[#BF953F] font-black uppercase tracking-[0.3em] mb-2 opacity-80">Current Cycle</p>
              <h2 className="text-4xl font-serif text-white">{visits} <span className="text-zinc-700 text-xl font-sans font-light">/ {CYCLE_TARGET}</span></h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#BF953F]/10 flex items-center justify-center text-[#BF953F] border border-[#BF953F]/20">
               {visits >= 5 ? <Crown size={18} /> : <Star size={18} />}
            </div>
          </div>

          <div className="space-y-4">
             <div className="h-[2px] w-full bg-zinc-800 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 top-0 h-full bg-[#BF953F] shadow-[0_0_20px_rgba(191,149,63,0.5)]"
                />
             </div>
             
             <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
               <span>{visitsRemaining} to reward</span>
               {isNearCompletion && <span className="text-[#E5C579]">Almost There</span>}
             </div>
          </div>
        </div>
      </motion.div>

      {/* Social Proof */}
      <div className="mb-12 h-4 overflow-hidden relative opacity-60">
        <AnimatePresence mode="wait">
          <motion.div
            key={proofIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="flex items-center gap-3 justify-center"
          >
             <p className="text-[9px] text-zinc-400 tracking-widest uppercase">{SOCIAL_PROOF_MESSAGES[proofIndex]}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hero Section */}
      {highlightedItem && (
        <div className="mb-8">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                 {adminSettings.highlightTag}
              </h3>
           </div>

           <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer" onClick={() => playSound('click')}>
              <motion.img 
                 whileHover={{ scale: 1.03 }}
                 transition={{ duration: 1.2, ease: "easeOut" }}
                 src={highlightedItem.image} 
                 className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90" />
              
              <div className="absolute bottom-0 left-0 p-8 w-full">
                 <h4 className="text-3xl font-serif text-white mb-2">{highlightedItem.nameEn}</h4>
                 <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4 w-3/4 font-light">{highlightedItem.descEn}</p>
                 
                 <div className="flex items-center gap-3 text-[#E5C579] text-[9px] font-bold uppercase tracking-[0.25em]">
                    View <ChevronRight size={10} />
                 </div>
              </div>
           </div>
        </div>
      )}
    </motion.div>
  );
};

export default HomeScreen;
