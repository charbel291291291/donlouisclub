
import React from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/sound';

interface Button3DProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'gold' | 'dark' | 'outline' | 'danger';
  disabled?: boolean;
}

const Button3D: React.FC<Button3DProps> = ({ children, onClick, className = '', variant = 'gold', disabled = false }) => {
  
  const handleClick = () => {
    if (!disabled && onClick) {
      playSound('click');
      onClick();
    }
  };

  let variantStyles = '';
  let shadowColor = '';

  switch (variant) {
    case 'gold':
      variantStyles = 'bg-gradient-to-b from-[#E5C579] to-[#BF953F] text-black border-t border-[#FFF5D1]/50';
      shadowColor = 'rgba(191, 149, 63, 0.3)';
      break;
    case 'dark':
      variantStyles = 'bg-[#151515] text-white border border-white/10';
      shadowColor = 'rgba(0, 0, 0, 0.8)';
      break;
    case 'outline':
      variantStyles = 'bg-transparent border border-white/10 text-white hover:bg-white/5 backdrop-blur-sm';
      shadowColor = 'rgba(255, 255, 255, 0.05)';
      break;
    case 'danger':
      variantStyles = 'bg-red-950/30 border border-red-500/20 text-red-400';
      shadowColor = 'rgba(220, 38, 38, 0.1)';
      break;
  }

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.97, y: 2 }}
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative px-6 py-4 rounded-xl font-bold tracking-[0.15em] uppercase text-[10px] 
        transition-all duration-300 overflow-hidden
        ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}
        ${variantStyles} ${className}
      `}
      style={{
        boxShadow: disabled ? 'none' : `0 10px 20px -5px ${shadowColor}`,
      }}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </div>
      
      {/* Cinematic sheen */}
      {!disabled && variant === 'gold' && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay" />
      )}
    </motion.button>
  );
};

export default Button3D;
