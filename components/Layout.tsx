
import React from 'react';
import { motion } from 'framer-motion';
import { Home, UtensilsCrossed, Sparkles, User, MapPin } from 'lucide-react';
import { AppScreen } from '../types';

interface LayoutProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

const Layout: React.FC<LayoutProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { id: AppScreen.HOME, icon: Home, label: 'Club' },
    { id: AppScreen.MENU, icon: UtensilsCrossed, label: 'Menu' },
    { id: AppScreen.OFFERS, icon: Sparkles, label: 'Perks' },
    { id: AppScreen.LOCATION, icon: MapPin, label: 'Visit' },
    { id: AppScreen.PROFILE, icon: User, label: 'Me' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center pb-6">
      <div className="glass-heavy rounded-full px-6 py-4 mx-4 pointer-events-auto shadow-2xl shadow-black/50 border border-white/10 flex items-center gap-8">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center justify-center group"
            >
              <div className={`transition-all duration-500 ${isActive ? 'text-[#E5C579] drop-shadow-[0_0_8px_rgba(229,197,121,0.5)]' : 'text-zinc-600 group-active:text-zinc-400'}`}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              {isActive && (
                <motion.div 
                  layoutId="activeTabDot"
                  className="absolute -bottom-2 w-1 h-1 bg-[#E5C579] rounded-full shadow-[0_0_5px_#E5C579]" 
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Layout;
