
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Phone, ArrowUpRight, MapPin } from 'lucide-react';
import Button3D from '../components/Button3D';

interface LocationScreenProps {
  onStaffAccess: () => void;
  onAdminAccess: () => void;
}

const LocationScreen: React.FC<LocationScreenProps> = ({ onStaffAccess, onAdminAccess }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#050505] pb-32 relative flex flex-col"
    >
      <div className="flex-1 relative min-h-[50vh]">
        <div className="absolute inset-0">
           <img 
             src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1000"
             alt="Location"
             className="w-full h-full object-cover opacity-60 grayscale-[0.2]"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#050505]" />
        </div>
        
        <div className="absolute top-12 left-6">
           <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white">Open Now</span>
           </div>
        </div>
      </div>

      <div className="px-6 -mt-12 relative z-10">
        <h1 className="text-4xl font-serif text-white mb-1">The Hearth</h1>
        <p className="text-zinc-400 text-xs tracking-widest uppercase mb-8 flex items-center gap-2">
           <MapPin size={12} className="text-[#BF953F]" /> Adonis, Main Road
        </p>

        <div className="glass p-6 rounded-3xl mb-6">
           <div className="flex items-start gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#BF953F]/10 flex items-center justify-center text-[#BF953F] shrink-0">
                 <Clock size={16} />
              </div>
              <div>
                 <h3 className="text-white text-sm font-bold mb-1">Opening Hours</h3>
                 <p className="text-zinc-400 text-xs leading-relaxed">Daily: 11:00 AM — 03:00 AM</p>
                 <p className="text-zinc-500 text-[10px] mt-1">Late night menu active after 10 PM</p>
              </div>
           </div>

           <div className="w-full h-px bg-white/5 mb-6" />

           <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 shrink-0">
                 <Phone size={16} />
              </div>
              <div>
                 <h3 className="text-white text-sm font-bold mb-1">Contact</h3>
                 <p className="text-zinc-400 text-xs">09 123 456</p>
              </div>
           </div>
        </div>

        <Button3D className="w-full mb-8" variant="outline">
           Get Directions
        </Button3D>

        <div className="flex justify-center gap-4 opacity-10 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
           <button onClick={onStaffAccess} className="text-[9px] uppercase tracking-widest font-black text-zinc-500">Staff</button>
           <span className="text-zinc-800">|</span>
           <button onClick={onAdminAccess} className="text-[9px] uppercase tracking-widest font-black text-zinc-500">Admin</button>
        </div>
      </div>
    </motion.div>
  );
};

export default LocationScreen;
