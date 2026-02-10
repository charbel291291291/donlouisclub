
import React from 'react';
import { motion } from 'framer-motion';
import { History, Shield } from 'lucide-react';

interface InactivityModalProps {
  onClose: () => void;
  userPoints: number;
  userName: string;
}

const InactivityModal: React.FC<InactivityModalProps> = ({ onClose, userPoints, userName }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center px-6"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-sm z-10"
      >
        <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6 text-zinc-500 shadow-xl">
                <History size={24} />
            </div>
            <h2 className="text-2xl font-serif text-white mb-2">Welcome back, {userName}</h2>
            <p className="text-zinc-500 text-sm tracking-wide">It's been a while.</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8 relative overflow-hidden">
            <div className="flex items-center gap-5 relative z-10">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/20">
                    <Shield size={20} fill="currentColor" className="opacity-80" />
                </div>
                <div>
                    <p className="text-amber-500 font-serif text-lg leading-none mb-2">Your progress is waiting...</p>
                    <p className="text-zinc-400 text-xs font-medium">{userPoints} points saved safely in the vault.</p>
                </div>
            </div>
            {/* Subtle pulse to indicate 'alive' status */}
            <motion.div 
                animate={{ opacity: [0, 0.05, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-amber-500 pointer-events-none"
            />
        </div>

        <button 
            onClick={onClose}
            className="w-full bg-white text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
            Continue Journey
        </button>
      </motion.div>
    </motion.div>
  );
};

export default InactivityModal;
