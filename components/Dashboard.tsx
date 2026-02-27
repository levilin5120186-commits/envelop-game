import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'motion/react';
import { AppView } from '../types';
import { playClick } from '../services/soundService';

interface Props {
  balance: number;
  setView: (view: AppView) => void;
  onRestart: () => void;
  isJustOpened?: boolean;
}

// Rolling Number Component
const RollingNumber = ({ value }: { value: number }) => {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};

// Particle Background Component
const ParticleBackground = () => {
  // Generate random particles
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20, // Start above screen
    size: Math.random() * 20 + 10, // Increased size
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
    rotate: Math.random() * 360,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute text-yellow-500/30" // Increased opacity
          style={{
            left: `${p.x}%`,
            fontSize: `${p.size}px`,
          }}
          initial={{ y: `${p.y}vh`, rotate: 0, opacity: 0 }}
          animate={{
            y: '110vh',
            rotate: p.rotate + 360,
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        >
          {p.id % 2 === 0 ? '🧧' : '💰'}
        </motion.div>
      ))}
      {/* Breathing Glow Effect */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-radial-gradient from-red-800/30 to-transparent rounded-full blur-3xl"
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export const Dashboard: React.FC<Props> = ({ balance, setView, onRestart, isJustOpened = false }) => {
  const [showBalance, setShowBalance] = useState(!isJustOpened);

  useEffect(() => {
    if (isJustOpened) {
      const timer = setTimeout(() => {
        setShowBalance(true);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setShowBalance(true);
    }
  }, [isJustOpened]);
  
  const handleNavigate = (view: AppView) => {
    playClick();
    setView(view);
  };

  const handleRestartClick = () => {
    playClick();
    onRestart();
  };

  const getCommentary = (amount: number) => {
    if (amount < 500) return "連紅包袋都比你有錢...";
    if (amount < 1000) return "這點錢買花生都不夠配酒。";
    if (amount < 5000) return "省著點花啊！";
    if (amount < 10000) return "不錯喔，可以吃頓好的！";
    if (amount < 50000) return "哇塞！發財了！";
    if (amount < 100000) return "土豪！我們做朋友吧！";
    return "財神爺降臨！受我一拜！";
  };

  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // Slowed down from 0.15
        delayChildren: 0.4,   // Increased initial delay
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  } as const;

  return (
    <div className="h-[100dvh] w-full bg-red-900 p-3 flex flex-col items-center overflow-hidden relative">
      <ParticleBackground />
      
      <motion.div 
        className="w-full max-w-lg bg-red-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border-4 border-yellow-600 mb-2 text-center shrink-0 z-10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-yellow-200 text-lg font-bold mb-1 uppercase tracking-widest">目前資產</h2>
        <div className={`text-4xl font-bold text-yellow-400 font-mono mb-1 transition-opacity duration-1000 ${showBalance ? 'opacity-100' : 'opacity-0'}`}>
          $<RollingNumber value={balance} />
        </div>
        <motion.div 
          key={getCommentary(balance)} // Re-animate when text changes
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-200 text-base font-medium min-h-[1.5em]"
        >
          {getCommentary(balance)}
        </motion.div>
      </motion.div>

      <motion.div 
        className="w-full max-w-lg flex flex-col gap-2 px-1 pb-1 flex-1 min-h-0 z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        
        {/* Auntie Game */}
        <motion.button 
          variants={itemVariants}
          whileHover={{ scale: 1.02, backgroundColor: "rgb(185 28 28)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleNavigate(AppView.GAME_AUNTIE)}
          className="flex-1 bg-red-700 border-4 border-yellow-500 rounded-xl p-2 flex flex-col items-center justify-center shadow-lg group min-h-[90px] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <div className="text-4xl mb-1 group-hover:animate-bounce">👵🏻</div>
          <h3 className="text-xl font-bold text-yellow-100 mb-0">毒舌阿姨的拷問</h3>
          <p className="text-red-100 text-center text-sm leading-relaxed mt-1">
            高風險高報酬 (x5)
          </p>
        </motion.button>

        {/* Dream Game */}
        <motion.button 
          variants={itemVariants}
          whileHover={{ scale: 1.02, backgroundColor: "rgb(67 56 202)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleNavigate(AppView.GAME_DREAM)}
          className="flex-1 bg-indigo-800 border-4 border-yellow-500 rounded-xl p-2 flex flex-col items-center justify-center shadow-lg group min-h-[90px] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <div className="text-4xl mb-1 group-hover:animate-pulse">😴</div>
          <h3 className="text-xl font-bold text-yellow-100 mb-0">新春周公解夢</h3>
          <p className="text-indigo-200 text-center text-sm leading-relaxed mt-1">
            AI 測吉凶 (x0 或 x1.5-3)
          </p>
        </motion.button>

        {/* Dice Game */}
        <motion.button 
          variants={itemVariants}
          whileHover={{ scale: 1.02, backgroundColor: "rgb(146 64 14)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleNavigate(AppView.GAME_DICE)}
          className="flex-1 bg-amber-800 border-4 border-yellow-500 rounded-xl p-2 flex flex-col items-center justify-center shadow-lg group min-h-[90px] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <div className="text-4xl mb-1 group-hover:animate-spin">🎲</div>
          <h3 className="text-xl font-bold text-yellow-100 mb-0">馬年骰子樂</h3>
          <p className="text-amber-100 text-center text-sm leading-relaxed mt-1">
            快速對決 (x1.5 - x3)
          </p>
        </motion.button>

        <motion.div 
          variants={itemVariants}
          className="mt-auto w-full flex flex-col items-center gap-2 shrink-0 pt-2 border-t border-red-800/50"
        >
           <button 
             onClick={handleRestartClick}
             className="w-full bg-red-950 border-2 border-red-500/50 hover:border-yellow-400 hover:bg-red-900 text-red-200 hover:text-yellow-100 py-3 rounded-xl transition-all text-lg font-bold shadow-lg flex items-center justify-center gap-2"
           >
             <span className="text-xl">🔄</span> 放棄重來 (重抽紅包)
           </button>
           <div className="text-center text-red-400 text-xs font-medium">
             警告：餘額可能歸零，小賭怡情，大賭傷身。
           </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
