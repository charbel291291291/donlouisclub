import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { UserProfile, MembershipTier } from '../types';
import { TIER_CONFIG, SECRET_MENU_ITEM, BRAND_TAGLINE } from '../constants';
import { Wifi, Lock, Crown, Star, Sparkles, ShieldCheck, ChefHat, ScanLine, RotateCcw } from 'lucide-react';
import { playSound } from '../utils/sound';

interface ProfileScreenProps {
  user: UserProfile | null;
  onUpdateUser: (user: UserProfile) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  const points = user?.points || 0;
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const currentTier = useMemo(() => {
    if (points >= 24) return MembershipTier.PLATINUM;
    if (points >= 12) return MembershipTier.GOLD;
    if (points >= 6) return MembershipTier.SILVER;
    return MembershipTier.BRONZE;
  }, [points]);

  const config = TIER_CONFIG[currentTier];

  // --- Progression Calculation ---
  const nextTierDetails = useMemo(() => {
    if (points < 6) return { name: 'Silver', target: 6, prev: 0 };
    if (points < 12) return { name: 'Gold', target: 12, prev: 6 };
    if (points < 24) return { name: 'Platinum', target: 24, prev: 12 };
    return { name: 'Max Status', target: points, prev: 0 };
  }, [points]);

  const progressPercent = useMemo(() => {
    if (points >= 24) return 100;
    const range = nextTierDetails.target - nextTierDetails.prev;
    const currentInTier = points - nextTierDetails.prev;
    return Math.min(100, Math.max(0, (currentInTier / range) * 100));
  }, [points, nextTierDetails]);

  // --- 3D Physics Setup ---
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Springs for smooth tilt
  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 30 });

  // Map mouse position to rotation degrees (Tilt)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);
  
  // Dynamic Glare Position
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareOpacity = useTransform(mouseXSpring, [-0.5, 0, 0.5], [0.1, 0.0, 0.1]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Support both mouse and touch
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleCardClick = () => {
    playSound('click');
    setIsFlipped(!isFlipped);
  };

  // Auto-flip back after 15 seconds if left open
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isFlipped) {
      timer = setTimeout(() => setIsFlipped(false), 15000);
    }
    return () => clearTimeout(timer);
  }, [isFlipped]);

  // --- Tier Specific Animation ---
  const renderTierEffect = () => {
    switch (currentTier) {
      case MembershipTier.PLATINUM:
        return (
          <motion.div 
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-40 mix-blend-overlay"
            style={{ 
              background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 55%, transparent 70%)",
              backgroundSize: "200% 200%"
            }}
          />
        );
      case MembershipTier.GOLD:
        return (
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-amber-500/20 blur-[60px] mix-blend-screen pointer-events-none"
          />
        );
      case MembershipTier.SILVER:
         return (
          <motion.div 
            animate={{ x: ["-150%", "150%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
          />
         );
      case MembershipTier.BRONZE:
      default:
        // Subtle static sheen for Bronze
        return (
           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50" />
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#030303] pb-32 px-6 pt-12 overflow-x-hidden"
    >
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-serif text-white mb-2">Membership</h1>
        <div className="flex items-center justify-center gap-2 text-[9px] text-[#BF953F] uppercase tracking-[0.2em] font-bold">
           <span>Identify</span>
           <div className="w-1 h-1 rounded-full bg-[#BF953F]" />
           <span>Access</span>
        </div>
      </header>

      {/* 3D Card Stage with Floating Animation */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="w-full flex justify-center mb-10 perspective-2000 relative z-20"
      >
        {/* Dynamic Ground Shadow */}
        <motion.div 
           initial={{ opacity: 0.5, scale: 1 }}
           animate={{ 
             opacity: isHovered || isFlipped ? 0.2 : 0.4, 
             scale: isHovered || isFlipped ? 0.85 : 1,
             filter: isHovered || isFlipped ? "blur(20px)" : "blur(12px)" 
           }}
           transition={{ duration: 0.4, ease: "easeOut" }}
           className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[85%] h-8 bg-black rounded-[100%] pointer-events-none z-0"
        />

        {/* Tilt Container */}
        <motion.div
          ref={ref}
          style={{ 
            rotateX, 
            rotateY, 
            transformStyle: "preserve-3d",
          }}
          initial={{ scale: 1.05 }}
          whileHover={{ scale: 1.15, y: -30, z: 40, cursor: 'pointer' }}
          whileTap={{ scale: 0.98, y: 0, z: 0 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => handleMouseLeave()}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleCardClick}
          className="relative w-full aspect-[1.58/1] max-w-[340px] cursor-pointer z-10"
        >
          {/* Flip Container */}
          <motion.div
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} // Cinematic easing
            style={{ transformStyle: "preserve-3d" }}
            className="w-full h-full relative"
          >
            {/* --- FRONT FACE --- */}
            <div 
              className={`absolute inset-0 rounded-[1.5rem] ${config.bg} ${config.border} border shadow-2xl ${config.shadow} overflow-hidden backface-hidden`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Background Layers */}
              <div 
                className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, currentColor 2px, currentColor 4px, transparent 4px, transparent 8px)`,
                  backgroundSize: '100% 100%'
                }}
              />

              {/* Logo Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.15] mix-blend-soft-light pointer-events-none" style={{ transform: 'translateZ(-5px)' }}>
                  <div className="relative w-56 h-56 rounded-full border-[3px] border-white/60 flex flex-col items-center justify-center p-4">
                      <div className="absolute inset-0 border border-white/30 rounded-full scale-[0.92]" />
                      <ChefHat size={64} strokeWidth={1.5} className="text-white mb-2" />
                      <h2 className="font-serif text-3xl text-white font-bold italic tracking-tighter">Don Louis</h2>
                      <div className="w-full h-px bg-white/40 my-1 w-24" />
                      <p className="text-[6px] uppercase tracking-[0.2em] text-white font-bold">Where Food Is An Art</p>
                      <p className="text-[5px] uppercase tracking-widest text-white/80 mt-2">Snack-Bar & Grill</p>
                  </div>
              </div>

              <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay" />
              
              <motion.div 
                style={{ 
                  background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.8) 0%, transparent 60%)`,
                  opacity: glareOpacity
                }}
                className="absolute inset-0 z-30 mix-blend-overlay pointer-events-none"
              />

              {renderTierEffect()}

              {/* Front Content */}
              <div 
                className="relative z-20 h-full p-8 flex flex-col justify-between"
                style={{ transform: "translateZ(20px)" }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-md shadow-inner">
                      <span className={`font-serif text-sm font-bold ${config.textColor}`}>DL</span>
                    </div>
                    <Wifi size={20} className="text-white/40 rotate-90 drop-shadow-md" />
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[7px] text-white/50 uppercase tracking-[0.3em] font-bold mb-1">Tier</p>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 ${
                      currentTier === MembershipTier.PLATINUM ? 'bg-white/10' : 'bg-black/30'
                    }`}>
                      {currentTier === MembershipTier.PLATINUM && <Crown size={10} className="text-white" fill="currentColor" />}
                      {currentTier === MembershipTier.GOLD && <Sparkles size={10} className="text-[#FFD700]" fill="currentColor" />}
                      {currentTier === MembershipTier.SILVER && <ShieldCheck size={10} className="text-slate-300" />}
                      {currentTier === MembershipTier.BRONZE && <Star size={10} className="text-[#ECAE7D]" />}
                      
                      <p className={`text-[9px] font-black tracking-widest uppercase ${config.textColor}`}>{config.badge}</p>
                    </div>
                  </div>
                </div>

                <div className="my-auto transform translate-z-10">
                  <h2 className={`text-3xl font-serif tracking-tight ${config.textColor} drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]`}>
                    {config.nameEn}
                  </h2>
                  <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent mt-2 opacity-50" />
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[7px] text-white/40 uppercase tracking-widest mb-1">Member Name</p>
                    <p className="text-sm font-bold text-white/90 uppercase tracking-wide font-sans drop-shadow-md">
                      {user?.firstName || "Guest"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 mb-1 opacity-50">
                        <ScanLine size={10} className="text-white" />
                        <span className="text-[7px] text-white font-bold uppercase tracking-widest">Tap to Scan</span>
                    </div>
                    <p className="text-xs font-mono text-white/70 tracking-widest drop-shadow-md">
                      {user?.memberId || "----"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* --- BACK FACE (QR CODE) --- */}
            <div 
              className={`absolute inset-0 rounded-[1.5rem] bg-[#0A0A0A] border border-white/10 shadow-2xl overflow-hidden`}
              style={{ 
                backfaceVisibility: 'hidden', 
                transform: 'rotateY(180deg)' // Initially rotated away
              }}
            >
              {/* Back Background Texture */}
              <div 
                className="absolute inset-0 opacity-[0.1]"
                style={{
                  backgroundImage: `radial-gradient(circle at center, #333 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}
              />
              <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay" />
              
              {/* Scan Content */}
              <div className="relative z-20 h-full flex flex-col items-center justify-center p-8">
                
                <div className="text-center mb-6">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 mb-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400">Ready to Scan</p>
                   </div>
                   <h3 className="text-white font-serif text-lg">Cashier Access</h3>
                </div>

                <div className="relative w-40 h-40 bg-white p-3 rounded-2xl shadow-2xl shadow-white/5">
                   <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${user?.memberId}&bgcolor=ffffff&color=000000&margin=0`} 
                      alt="Member QR"
                      className="w-full h-full object-cover mix-blend-multiply" 
                   />
                   
                   {/* Logo Embedded in Center of QR */}
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                         <ChefHat size={20} className="text-black" strokeWidth={2.5} />
                      </div>
                   </div>
                   
                   {/* Scanning Scanline Effect */}
                   <motion.div 
                     animate={{ top: ['0%', '100%', '0%'] }}
                     transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                     className="absolute left-0 right-0 h-[2px] bg-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)] pointer-events-none"
                   />
                </div>

                <div className="mt-6 flex items-center gap-2 opacity-40">
                   <RotateCcw size={10} className="text-zinc-500" />
                   <p className="text-[8px] text-zinc-500 uppercase tracking-widest">Tap to flip back</p>
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Animated Progress Bar */}
      <div className="w-full max-w-[340px] mx-auto mb-12 px-2">
        <div className="flex justify-between items-end mb-3">
           <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
             {points >= 24 ? 'Status' : `Progress to ${nextTierDetails.name}`}
           </p>
           <p className="text-xs font-serif text-[#E5C579]">
             {points} <span className="text-zinc-700 font-sans">/ {points >= 24 ? '∞' : nextTierDetails.target} pts</span>
           </p>
        </div>
        <div className="h-1.5 bg-[#111] rounded-full overflow-hidden border border-white/5 relative">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${progressPercent}%` }}
             transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
             className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#8A6E2F] via-[#BF953F] to-[#FBF5B7] shadow-[0_0_15px_rgba(191,149,63,0.3)]"
           />
        </div>
        {points < 24 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1 }}
            className="text-[8px] text-zinc-500 mt-2 text-right tracking-wider"
          >
             {nextTierDetails.target - points} points to unlock next tier
          </motion.p>
        )}
      </div>

      {/* The Vault */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4 px-1 border-b border-white/5 pb-2">
           <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500">The Vault</h4>
           {currentTier !== MembershipTier.PLATINUM && <Lock size={12} className="text-zinc-700" />}
        </div>
        
        <div className="relative rounded-2xl overflow-hidden bg-[#0A0A0A] border border-zinc-800/50 group shadow-lg">
           {currentTier === MembershipTier.PLATINUM ? (
             <div className="flex flex-row h-28 relative overflow-hidden">
               <motion.div 
                 animate={{ opacity: [0, 0.2, 0] }}
                 transition={{ duration: 3, repeat: Infinity }}
                 className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 pointer-events-none z-10"
               />
               <div className="w-32 h-full relative shrink-0">
                  <img src={SECRET_MENU_ITEM.image} className="w-full h-full object-cover grayscale-[0.2]" />
               </div>
               <div className="p-4 flex flex-col justify-center relative z-20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Crown size={10} className="text-[#FFD700]" fill="currentColor" />
                    <h3 className="text-[#E5C579] font-serif text-sm font-bold">{SECRET_MENU_ITEM.nameEn}</h3>
                  </div>
                  <p className="text-zinc-500 text-[9px] leading-relaxed mb-0">{SECRET_MENU_ITEM.descEn}</p>
               </div>
             </div>
           ) : (
             <div className="relative h-28 w-full flex items-center justify-center overflow-hidden">
                <img src={SECRET_MENU_ITEM.image} className="absolute inset-0 w-full h-full object-cover blur-lg opacity-10" />
                <div className="relative z-10 flex flex-col items-center gap-2">
                   <div className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center backdrop-blur-md">
                     <Lock size={16} className="text-zinc-500" />
                   </div>
                   <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">Locked for {config.nameEn}</p>
                </div>
             </div>
           )}
        </div>
      </div>

      <div className="text-center pb-8 opacity-30">
        <p className="text-[9px] text-zinc-500 font-serif italic">{BRAND_TAGLINE}</p>
      </div>
    </motion.div>
  );
};

export default ProfileScreen;