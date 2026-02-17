import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_BALANCE_MIN, INITIAL_BALANCE_MAX } from '../constants';
import { playFanfare, playClick } from '../services/soundService';

interface Props {
  onOpen: (amount: number) => void;
  onComplete?: () => void;
}

type Phase = 'IDLE' | 'OPENING' | 'ROLLING' | 'REVEALED' | 'EXITING';

const CoinRain = () => {
  // Generate stable random values for coins
  const [coins] = useState(() => Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 1 + Math.random() * 1.5,
    emoji: Math.random() > 0.5 ? '💰' : '🧧'
  })));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {coins.map(c => (
        <div 
          key={c.id}
          className="absolute top-[-50px] text-3xl animate-drop"
          style={{ 
            left: `${c.left}%`, 
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`
          }}
        >
          {c.emoji}
        </div>
      ))}
    </div>
  );
};

export const RedEnvelope: React.FC<Props> = ({ onOpen, onComplete }) => {
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
           setDisplayAmount(Math.floor(Math.random() * (INITIAL_BALANCE_MAX - INITIAL_BALANCE_MIN + 1)) + INITIAL_BALANCE_MIN);
        } else {
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
        // Trigger the state update in Parent to show Dashboard behind us
        onOpen(finalAmountRef.current);
        setPhase('EXITING');
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [phase, onOpen]);

  useEffect(() => {
    if (phase === 'EXITING') {
      // Wait for the exit animation (fly to top) to complete
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1200); 
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  return (
    // Fixed container. z-50 ensures it stays on top of Dashboard.
    <div className={`fixed inset-0 w-full h-[100dvh] flex flex-col items-center justify-center z-50 transition-colors duration-1000 ${phase === 'EXITING' ? 'bg-transparent pointer-events-none' : 'bg-red-900'}`}>
      
      {/* Background Pattern */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${phase === 'EXITING' ? 'opacity-0' : 'opacity-10'}`} 
        style={{ backgroundImage: 'radial-gradient(#ffd700 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      ></div>

      {/* Coin Rain Effect during Revealed and Exiting phases */}
      {(phase === 'REVEALED' || phase === 'EXITING') && <CoinRain />}

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">

        {/* Initial Envelope Button */}
        <div className={`transition-all duration-700 transform absolute ${phase !== 'IDLE' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
          <button 
            onClick={handleOpen}
            className="w-72 h-80 bg-red-600 rounded-3xl shadow-2xl border-[5px] border-yellow-400 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:bg-red-500 transition-colors"
            aria-label="開啟紅包"
          >
            <div className="absolute top-0 left-0 w-full h-1/3 bg-red-700 rounded-b-full shadow-md transform origin-top group-hover:scale-y-110 transition-transform z-10"></div>
            <div className="w-28 h-28 bg-yellow-400 rounded-full flex items-center justify-center text-red-700 font-bold text-6xl shadow-inner z-20 border-4 border-yellow-200 mb-5">
              福
            </div>
            <div className="mt-4 text-yellow-100 font-serif text-3xl font-bold z-20 drop-shadow-md">點擊開啟</div>
          </button>
        </div>
        
        {/* Rolling / Revealed Content */}
        {(phase === 'ROLLING' || phase === 'REVEALED' || phase === 'EXITING') && (
          <div className="flex flex-col items-center justify-center w-full">
            {/* Elements that fade out during exit */}
            <div className={`transition-opacity duration-500 flex flex-col items-center ${phase === 'EXITING' ? 'opacity-0' : 'opacity-100'}`}>
              <div className="text-8xl mb-6 animate-bounce">🧧</div>
              <div className="text-yellow-200 text-2xl font-bold mb-2 uppercase tracking-widest">恭喜獲得</div>
            </div>

            {/* The Number that Morphs */}
            <div 
              className={`font-mono font-bold text-yellow-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] transition-all duration-1000 ease-in-out
                ${phase === 'EXITING' 
                  ? 'translate-y-[-38vh] scale-[0.45] opacity-0'  // Added opacity-0 to fade out while flying
                  : (phase === 'REVEALED' ? 'scale-125 text-7xl' : 'scale-100 text-6xl')
                }
              `}
            >
              ${displayAmount.toLocaleString()}
            </div>

            {/* Footer message */}
            <div className={`mt-8 text-red-200 text-xl font-bold animate-pulse transition-opacity duration-500 ${phase === 'EXITING' ? 'opacity-0' : 'opacity-100'}`}>
               {phase === 'REVEALED' && "準備發財..."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};