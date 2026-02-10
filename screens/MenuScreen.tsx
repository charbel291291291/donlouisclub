
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdminSettings } from '../types';
import { playSound } from '../utils/sound';

interface MenuScreenProps {
  adminSettings: AdminSettings;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ adminSettings }) => {
  useEffect(() => {
    playSound('soft');
  }, []);

  const visibleItems = adminSettings.menuItems.filter(item => !item.isHidden);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#030303] pb-32 px-6 pt-12"
    >
      <header className="mb-12">
        <h1 className="text-3xl font-serif text-white mb-2">Signatures</h1>
        <p className="text-zinc-600 text-[10px] tracking-[0.3em] uppercase">Culinary Excellence</p>
      </header>

      <div className="space-y-8">
        {visibleItems.map((item, idx) => {
          const isHighlighted = item.id === adminSettings.bestMenuItemId;
          const isTodaysPick = isHighlighted && adminSettings.highlightTag === "Today's Pick";

          return (
            <motion.div
              key={item.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative overflow-hidden rounded-[1.5rem] bg-[#0A0A0A] border ${
                isTodaysPick ? 'border-[#BF953F]/40' : 'border-white/5'
              }`}
              onClick={() => playSound('click')}
            >
              <div className="aspect-[16/9] overflow-hidden relative">
                 <motion.img 
                   whileHover={{ scale: 1.05 }}
                   transition={{ duration: 1.5 }}
                   src={item.image} 
                   className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-700" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-90" />
                 
                 {isTodaysPick && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-[#BF953F] text-black text-[8px] font-black uppercase tracking-widest">
                       Selected
                    </div>
                 )}
              </div>

              <div className="p-6 -mt-16 relative z-10">
                 <h3 className={`text-xl font-serif mb-2 ${isTodaysPick ? 'text-gold-metallic' : 'text-white'}`}>{item.nameEn}</h3>
                 <p className="text-xs text-zinc-400 font-light leading-relaxed mb-6">{item.descEn}</p>
                 
                 <div className="flex justify-between items-center border-t border-white/5 pt-4">
                    <p className="text-[10px] font-arabic text-zinc-600">{item.nameAr}</p>
                    <p className="text-sm font-bold text-[#E5C579] font-serif tracking-wider">${item.price}</p>
                 </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-16 text-center opacity-30">
        <div className="w-1 h-8 bg-zinc-800 mx-auto mb-4" />
        <p className="text-[8px] text-zinc-500 uppercase tracking-[0.3em]">Full Menu at Location</p>
      </div>
    </motion.div>
  );
};

export default MenuScreen;
