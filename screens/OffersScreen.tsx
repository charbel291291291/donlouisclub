import React, { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { AdminSettings } from "../types";
import { Timer, Zap, Sparkles } from "lucide-react";
import { playSound } from "../utils/sound";
import { BRAND_INFO } from "../constants";

interface OffersScreenProps {
  adminSettings: AdminSettings;
}

const OffersScreen: React.FC<OffersScreenProps> = ({ adminSettings }) => {
  useEffect(() => {
    playSound("soft");
  }, []);

  const activeOffers = useMemo(() => {
    return adminSettings.offers.filter((o) =>
      adminSettings.activeOfferIds.includes(o.id)
    );
  }, [adminSettings.offers, adminSettings.activeOfferIds]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#030303] pb-32 px-6 pt-12"
    >
      <header className="mb-12 flex flex-col items-center">
        <div className="w-16 h-16 mb-4">
          <img
            src="/assets/logo.png"
            className="w-full h-full object-contain"
            alt="Don Louis Logo"
          />
        </div>
        <h1 className="text-3xl font-serif text-white mb-2">Privileges</h1>
        <p className="text-zinc-600 text-[10px] tracking-[0.3em] uppercase">
          {BRAND_INFO.slogan}
        </p>
      </header>

      <div className="space-y-6">
        {activeOffers.length > 0 ? (
          activeOffers.map((offer, idx) => (
            <motion.div
              key={offer.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: idx * 0.15,
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={() => playSound("click")}
              className={`p-8 rounded-[2rem] border relative overflow-hidden group ${
                offer.type === "latenight"
                  ? "bg-[linear-gradient(135deg,#0F172A_0%,#000000_100%)] border-indigo-500/10"
                  : "bg-[linear-gradient(135deg,#18181b_0%,#000000_100%)] border-white/5"
              }`}
            >
              <div className="absolute inset-0 bg-noise opacity-[0.05]" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                      offer.type === "latenight"
                        ? "bg-indigo-950/20 border-indigo-500/20 text-indigo-400"
                        : "bg-[#BF953F]/10 border-[#BF953F]/20 text-[#BF953F]"
                    }`}
                  >
                    {offer.type === "latenight" ? (
                      <Timer size={20} />
                    ) : (
                      <Zap size={20} />
                    )}
                  </div>
                  <div className="glass px-4 py-1.5 rounded-full border border-white/5">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                      {offer.expiry}
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl font-serif text-white mb-2">
                  {offer.titleEn}
                </h3>
                <p className="text-xs text-zinc-500 font-arabic mb-0 opacity-70">
                  {offer.titleAr}
                </p>
              </div>

              {/* Hover Glow */}
              <div
                className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-[80px] opacity-10 transition-opacity duration-1000 group-hover:opacity-30 ${
                  offer.type === "latenight" ? "bg-indigo-600" : "bg-[#BF953F]"
                }`}
              />
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 opacity-50">
            <div className="w-16 h-16 mx-auto bg-zinc-900/50 rounded-full flex items-center justify-center text-zinc-700 mb-6 border border-zinc-800">
              <Sparkles size={24} />
            </div>
            <p className="text-zinc-600 text-xs tracking-widest uppercase">
              No Active Privileges
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OffersScreen;
