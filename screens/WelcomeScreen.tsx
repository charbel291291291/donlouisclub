
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button3D from '../components/Button3D';
import { SOCIAL_LINKS, BRAND_TAGLINE } from '../constants';

interface WelcomeScreenProps {
  onJoin: (name: string, phone: string, followed: boolean) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [followed, setFollowed] = useState(false);

  const handleJoin = () => {
    if (name && phone) {
      onJoin(name, phone, followed);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-8 relative overflow-hidden"
    >
      {/* Atmospheric Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(60,40,20,0.4),transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-1/2 bg-[radial-gradient(circle_at_100%_100%,rgba(30,30,40,0.5),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-[0.03]" />

      <div className="relative z-10 w-full max-w-sm">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <div className="w-16 h-16 border border-[#BF953F]/20 rounded-2xl mx-auto mb-6 flex items-center justify-center rotate-3 backdrop-blur-md bg-white/5 shadow-2xl">
             <span className="text-2xl font-serif text-[#E5C579]">DL</span>
          </div>
          <h1 className="text-3xl font-serif text-white mb-2">The Club</h1>
          <p className="text-zinc-500 text-xs tracking-[0.2em] uppercase">Join the inner circle</p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="group">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-2 transition-colors group-focus-within:text-[#BF953F]">First Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b border-zinc-800 py-3 text-lg text-white placeholder-zinc-800 focus:border-[#BF953F] outline-none transition-all font-serif"
              placeholder="Your Name"
            />
          </div>

          <div className="group">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-2 transition-colors group-focus-within:text-[#BF953F]">WhatsApp</label>
            <input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent border-b border-zinc-800 py-3 text-lg text-white placeholder-zinc-800 focus:border-[#BF953F] outline-none transition-all font-serif"
              placeholder="03 000 000"
            />
          </div>

          <div 
            onClick={() => {
              window.open(SOCIAL_LINKS.instagram, '_blank');
              setFollowed(true);
            }}
            className={`p-5 rounded-xl border cursor-pointer transition-all flex items-center gap-4 group ${
              followed ? 'bg-[#BF953F]/10 border-[#BF953F]/30' : 'bg-white/5 border-white/5 hover:border-white/10'
            }`}
          >
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
              followed ? 'bg-[#BF953F] border-[#BF953F] text-black' : 'border-zinc-700 text-zinc-700 group-hover:border-zinc-500'
            }`}>
              {followed ? <span className="text-xs font-bold">✓</span> : <span className="text-[10px]">+</span>}
            </div>
            <div className="flex-1">
              <p className={`text-xs font-bold uppercase tracking-wide mb-0.5 ${followed ? 'text-[#E5C579]' : 'text-zinc-300'}`}>Follow Instagram</p>
              <p className="text-[10px] text-zinc-600">+1 Point Bonus</p>
            </div>
          </div>

          <div className="pt-4">
            <Button3D 
              onClick={handleJoin} 
              className="w-full"
              variant={name && phone ? 'gold' : 'dark'}
              disabled={!name || !phone}
            >
              Access Membership
            </Button3D>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 left-0 right-0 text-center pointer-events-none"
      >
        <p className="text-[10px] text-zinc-500 font-serif italic tracking-wider">{BRAND_TAGLINE}</p>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeScreen;
