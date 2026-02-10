
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, CheckCircle, RefreshCcw } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { playSound } from '../utils/sound';

interface CashierScreenProps {
  onScanResult: (memberId: string) => Promise<{ success: boolean, member?: any, rewardUnlocked?: boolean }>;
  onExit: () => void;
}

const CashierScreen: React.FC<CashierScreenProps> = ({ onScanResult, onExit }) => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<{ memberName: string, reward: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<any>(null);

  const CORRECT_PIN = "1977";

  const handlePinInput = (digit: string) => {
    playSound('click');
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin === CORRECT_PIN) {
        playSound('success');
        setTimeout(() => setIsAuthenticated(true), 300);
      } else if (newPin.length === 4) {
        playSound('lock');
        setTimeout(() => {
          setPin('');
          setError('Invalid PIN');
          setTimeout(() => setError(null), 2000);
        }, 300);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isScanning && !lastScanResult && !isProcessing) {
      startScanner();
    }
    return () => stopScanner();
  }, [isAuthenticated, isScanning, lastScanResult, isProcessing]);

  const startScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      
      scanner.render(async (decodedText: string) => {
        scanner.clear();
        await handleSuccessfulScan(decodedText);
      }, (err: any) => {});
      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleSuccessfulScan = async (memberId: string) => {
    setIsProcessing(true);
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    playSound('soft');
    
    const result = await onScanResult(memberId);
    setIsProcessing(false);
    
    if (result.success) {
      playSound('success');
      setLastScanResult({
        memberName: result.member.firstName,
        reward: result.rewardUnlocked || false
      });
    } else {
      playSound('lock');
      setError(result.message || "Unknown ID");
      setTimeout(() => { setError(null); startScanner(); }, 2000);
    }
  };

  if (!isAuthenticated) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-[#030303] z-[300] flex flex-col items-center justify-center p-8">
        <button onClick={onExit} className="absolute top-8 right-8 text-zinc-600 hover:text-white"><X /></button>
        <div className="w-16 h-16 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600 mb-12">
          <Lock size={20} />
        </div>
        <div className="flex gap-4 mb-16">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${pin.length > i ? 'bg-white' : 'bg-zinc-800'}`} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-x-8 gap-y-8">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button key={num} onClick={() => handlePinInput(num)} className="w-16 h-16 rounded-full text-2xl font-light text-white active:bg-white/10 transition-colors font-serif">{num}</button>
          ))}
          <div />
          <button onClick={() => handlePinInput('0')} className="w-16 h-16 rounded-full text-2xl font-light text-white active:bg-white/10 transition-colors font-serif">0</button>
          <button onClick={() => setPin('')} className="w-16 h-16 rounded-full flex items-center justify-center text-zinc-600 active:text-white"><RefreshCcw size={20} /></button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-[#030303] z-[300] flex flex-col p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Scanner Active</h2>
        </div>
        <button onClick={onExit} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          {isProcessing ? (
             <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <div className="w-12 h-12 border-2 border-zinc-800 border-t-white rounded-full animate-spin mb-6" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Processing</p>
             </motion.div>
          ) : lastScanResult ? (
            <motion.div key="success" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm bg-[#101010] rounded-[2rem] p-10 text-center border border-white/5">
              <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500">
                <CheckCircle size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-serif text-white mb-2">{lastScanResult.memberName}</h3>
              <p className="text-zinc-500 mb-8 text-[10px] uppercase tracking-widest">Verification Complete</p>
              
              {lastScanResult.reward && (
                <div className="mb-8 p-4 bg-[#BF953F]/10 border border-[#BF953F]/20 rounded-xl">
                  <p className="text-[#BF953F] font-bold text-[10px] uppercase tracking-widest">Reward Unlocked</p>
                </div>
              )}

              <button onClick={() => { setLastScanResult(null); setError(null); }} className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest text-[10px]">Next Member</button>
            </motion.div>
          ) : (
            <div className="w-full max-w-sm aspect-square bg-black border border-zinc-900 rounded-[2rem] overflow-hidden relative shadow-2xl">
               <div id="reader" className="w-full h-full opacity-60 grayscale" />
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border border-white/20 rounded-2xl relative">
                     <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-white" />
                     <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white" />
                     <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-white" />
                     <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-white" />
                  </div>
               </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CashierScreen;
