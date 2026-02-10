
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/sound';
import { SplashSettings } from '../types';

interface SplashScreenProps {
  settings?: SplashSettings;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ settings }) => {
  useEffect(() => {
    if (settings?.soundEnabled) {
      const timer = setTimeout(() => playSound('soft'), 500);
      return () => clearTimeout(timer);
    }
  }, [settings]);

  // Default true if undefined to maintain backward compatibility during transitions
  const animate = settings?.animate ?? true;

  // Animation variants based on settings
  const logoVariants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: animate ? 2 : 0 } }
    },
    glow: {
      hidden: { opacity: 0, scale: 0.8, filter: 'blur(10px)' },
      visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: animate ? 1.5 : 0 } }
    },
    cinematic: {
      hidden: { opacity: 0, scale: 0.9, y: 10 },
      visible: { opacity: 1, scale: 1, y: 0, transition: { duration: animate ? 1.5 : 0, ease: [0.22, 1, 0.36, 1] } }
    }
  };

  const style = settings?.animationStyle || 'cinematic';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: animate ? 1 : 0.2 }}
      className="fixed inset-0 z-[100] bg-[#030303] flex flex-col items-center justify-center overflow-hidden"
    >
      {settings?.backgroundImage ? (
        <div className="absolute inset-0 z-0">
          <img src={settings.backgroundImage} className="w-full h-full object-cover opacity-40" alt="Background" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/80 to-transparent" />
        </div>
      ) : (
        <>
          <div className="absolute inset-0 bg-noise opacity-[0.03]" />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: animate ? 2 : 0 }}
            className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--gold-base)_0%,transparent_60%)] opacity-10 pointer-events-none"
          />
        </>
      )}

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <motion.div
          variants={logoVariants[style]}
          initial="hidden"
          animate="visible"
          className="w-24 h-24 border border-[var(--gold-base)]/20 rounded-full flex items-center justify-center mb-8 relative"
        >
          {style === 'cinematic' && animate && (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-t border-[var(--gold-base)]/40 opacity-70"
            />
          )}
          {style === 'cinematic' && !animate && (
            <div className="absolute inset-0 rounded-full border-t border-[var(--gold-base)]/40 opacity-70 rotate-45" />
          )}
          <span className="font-serif text-3xl text-[var(--gold-base)]">DL</span>
        </motion.div>

        {/* Text Reveal */}
        <motion.div className="overflow-hidden mb-3">
            <motion.h1 
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              transition={{ duration: animate ? 1.2 : 0, delay: animate ? 0.3 : 0, ease: [0.22, 1, 0.36, 1] }}
              className="text-2xl font-serif text-white uppercase tracking-widest"
            >
              Don Louis
            </motion.h1>
        </motion.div>

        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 40, opacity: 1 }}
          transition={{ duration: animate ? 1 : 0, delay: animate ? 0.8 : 0, ease: "easeOut" }}
          className="h-[1px] bg-[var(--gold-base)]/40 mb-4"
        />

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: animate ? 1.5 : 0, delay: animate ? 1 : 0 }}
          className="text-[8px] uppercase tracking-[0.6em] text-[var(--gold-base)]"
        >
          Private Club
        </motion.p>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
