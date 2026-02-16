import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_BALANCE_MIN, INITIAL_BALANCE_MAX } from '../constants';
import { playFanfare, playClick } from '../services/soundService';

interface Props {
  onOpen: (amount: number) => void;
}

type Phase = 'IDLE' | 'OPENING' | 'ROLLING' | 'REVEALED' | 'EXITING';

export const RedEnvelope: React.FC<Props> = ({ onOpen }) => {
  const [phase, setPhase] = useState<Phase>('IDLE');
  const [displayAmount, setDisplayAmount] = useState(0);
  const finalAmountRef = useRef(0);

  const handleOpen = () => {
    playClick();
    setPhase('OPENING');
    playFanfare();
    
    // Calculate final amount immediately
    finalAmountRef.current = Math.floor(Math.random() * (INITIAL_BALANCE_MAX - INITIAL_BALANCE_MIN + 1)) + INITIAL_BALANCE_MIN;

    // Transition to rolling shortly after button animation starts
    setTimeout(() => {
      setPhase('ROLLING');
    }, 600);
  };

  useEffect(() => {
    if (phase === 'ROLLING') {
      const startTime = Date.now();
      const duration = 1500; // Rolling duration in ms

      const interval = setInterval(() => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        
        if (progress < 1) {
           // Show random numbers
           setDisplayAmount(Math.floor(Math.random() * (INITIAL_BALANCE_MAX - INITIAL_BALANCE_MIN + 1)) + INITIAL_BALANCE_MIN);
        } else {
           // Finished
           clearInterval(interval);
           setDisplayAmount(finalAmountRef.current);
           setPhase('REVEALED');
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'REVEALED') {
      // Show the result for a moment before zooming to dashboard
      const timer = setTimeout(() => {
        setPhase('EXITING');
      }, 2000); 
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'EXITING') {
      // Wait for the exit animation (scale/fade) to complete
      const timer = setTimeout(() => {
        onOpen(finalAmountRef.current);
      }, 800); // Should match CSS transition duration slightly less to prevent blink
      return () => clearTimeout(timer);
    }
  }, [phase, onOpen]);

  return (
    <div className={`flex flex-col items-center justify-center h-[100dvh] w-full bg-red-900 overflow-hidden relative transition-all duration-1000 ease-in-out ${phase === 'EXITING' ? 'scale-[3] opacity-0' : 'scale-100 opacity-100'}`}>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#ffd700 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      {/* Initial Envelope Button */}
      <div className={`transition-all duration-700 transform ${phase !== 'IDLE' ? 'scale-0 opacity-0 absolute' : 'scale-100 opacity-100 relative'}`}>
        <button 
          onClick={handleOpen}
          className="w-72 h-80 bg-red-600 rounded-3xl shadow-2xl border-[5px] border-yellow-400 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:bg-red-500 transition-colors"
          aria-label="開啟紅包"
        >
          {/* Envelope Flap */}
          <div className="absolute top-0 left-0 w-full h-1/3 bg-red-700 rounded-b-full shadow-md transform origin-top group-hover:scale-y-110 transition-transform z-10"></div>
          
          {/* Gold Symbol */}
          <div className="w-28 h-28 bg-yellow-400 rounded-full flex items-center justify-center text-red-700 font-bold text-6xl shadow-inner z-20 border-4 border-yellow-200 mb-5">
            福
          </div>
          
          <div className="mt-4 text-yellow-100 font-serif text-3xl font-bold z-20 drop-shadow-md">點擊開啟</div>
          <div className="mt-2 text-yellow-200 text-xl font-bold z-20 drop-shadow-sm tracking-wider">領取你的紅包</div>
        </button>
      </div>
      
      {/* Rolling / Revealed Content */}
      {(phase === 'ROLLING' || phase === 'REVEALED' || phase === 'EXITING') && (
        <div className={`flex flex-col items-center justify-center z-50 transition-all duration-500 transform ${phase === 'ROLLING' ? 'scale-100' : 'scale-125'}`}>
          <div className="text-8xl mb-6 animate-bounce">🧧</div>
          <div className="text-yellow-200 text-2xl font-bold mb-2 uppercase tracking-widest">恭喜獲得</div>
          <div className={`font-mono font-bold text-yellow-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] transition-all ${phase === 'REVEALED' ? 'text-7xl' : 'text-6xl'}`}>
            ${displayAmount.toLocaleString()}
          </div>
          {phase === 'REVEALED' && (
             <div className="mt-8 text-red-200 text-xl font-bold animate-pulse">
                準備發財...
             </div>
          )}
        </div>
      )}
    </div>
  );
};