
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/sound';

interface ScanSuccessModalProps {
  onClose: () => void;
  points: number;
}

const ScanSuccessModal: React.FC<ScanSuccessModalProps> = ({ onClose, points }) => {
  useEffect(() => {
    playSound('success');
    
    // Luxury Confetti: Gold, White, Black only. Slower decay.
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#BF953F', '#FBF5B7', '#FFFFFF', '#000000'],
      scalar: 1.2,
      shapes: ['circle']
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
    
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center px-6"
    >
      <div className="absolute inset-0 bg-[#030303]/95 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0 }}
        className="relative w-full max-w-sm text-center"
      >
        <div className="w-24 h-24 rounded-full border border-[#BF953F]/30 flex items-center justify-center mx-auto mb-8 bg-gradient-to-b from-[#BF953F]/10 to-transparent shadow-[0_0_40px_rgba(191,149,63,0.15)]">
          <motion.div 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          >
            <Check size={40} className="text-[#BF953F]" strokeWidth={3} />
          </motion.div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-serif text-white mb-2">Authenticated</h2>
          <div className="h-[1px] w-12 bg-[#BF953F]/50 mx-auto mb-6" />
          
          <p className="text-zinc-400 text-xs tracking-[0.2em] uppercase mb-10">Visit Logged Successfully</p>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
            <p className="text-[9px] uppercase text-zinc-500 font-bold tracking-widest mb-1">Status</p>
            <p className="text-xl font-serif text-[#BF953F]">+1 Point</p>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
            <p className="text-[9px] uppercase text-zinc-500 font-bold tracking-widest mb-1">Total</p>
            <p className="text-xl font-serif text-white">{points} pts</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ScanSuccessModal;
