import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X, Fingerprint, RefreshCcw } from "lucide-react";
import { BRAND_INFO } from "../constants";

interface AdminAuthScreenProps {
  onSuccess: () => void;
  onExit: () => void;
}

const AdminAuthScreen: React.FC<AdminAuthScreenProps> = ({
  onSuccess,
  onExit,
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const ADMIN_PIN = "9696";

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin === ADMIN_PIN) {
        if (window.navigator.vibrate) window.navigator.vibrate([50, 30, 50]);
        setTimeout(() => onSuccess(), 300);
      } else if (newPin.length === 4) {
        setError(true);
        if (window.navigator.vibrate) window.navigator.vibrate(200);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 800);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-zinc-950 z-[500] flex flex-col items-center justify-center p-8 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.1)_0%,transparent_70%)]" />
      </div>

      <button
        onClick={onExit}
        className="absolute top-8 right-8 text-gray-600 active:text-white transition-colors"
      >
        <X size={28} />
      </button>

      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
          <img
            src="/assets/logo.png"
            className="w-12 h-12 object-contain"
            alt="Don Louis Logo"
          />
        </div>
        <h2 className="text-3xl font-serif mb-2 text-white">
          {BRAND_INFO.fullName}
        </h2>
        <p className="text-amber-500 text-[10px] mb-4 uppercase tracking-[0.4em] font-black">
          Admin Access
        </p>
      </div>

      <div className="flex gap-6 mb-16">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={pin.length > i ? { scale: [1, 1.2, 1] } : {}}
            className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
              pin.length > i
                ? "bg-amber-500 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                : "border-zinc-800"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 max-w-[300px] w-full">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
          <button
            key={num}
            onClick={() => handlePinInput(num)}
            className="aspect-square rounded-full bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center text-2xl font-bold active:bg-amber-500 active:text-black active:border-amber-500 transition-all duration-100"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          onClick={() => handlePinInput("0")}
          className="aspect-square rounded-full bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center text-2xl font-bold active:bg-amber-500 active:text-black transition-all"
        >
          0
        </button>
        <button
          onClick={() => setPin("")}
          className="aspect-square rounded-full flex items-center justify-center text-zinc-700 active:text-white"
        >
          <RefreshCcw size={24} />
        </button>
      </div>

      <div className="mt-16 flex items-center gap-2 text-red-500/40 text-[9px] uppercase tracking-widest font-bold">
        <ShieldAlert size={12} />
        {BRAND_INFO.slogan}
      </div>
    </motion.div>
  );
};

export default AdminAuthScreen;
