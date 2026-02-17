import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import { playClick } from '../services/soundService';

interface Props {
  balance: number;
  setView: (view: AppView) => void;
  onRestart: () => void;
  isJustOpened?: boolean;
}

export const Dashboard: React.FC<Props> = ({ balance, setView, onRestart, isJustOpened = false }) => {
  const [showBalance, setShowBalance] = useState(!isJustOpened);

  useEffect(() => {
    if (isJustOpened) {
      // Wait for the envelope flying number to disappear (approx 800ms-1000ms), then fade in
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

  return (
    <div className="h-[100dvh] w-full bg-red-900 p-3 flex flex-col items-center overflow-hidden animate-fade-in">
      <div className="w-full max-w-lg bg-red-800 rounded-2xl p-4 shadow-xl border-4 border-yellow-600 mb-2 text-center shrink-0">
        <h2 className="text-yellow-200 text-lg font-bold mb-1 uppercase tracking-widest">目前資產</h2>
        <div className={`text-4xl font-bold text-yellow-400 font-mono mb-1 transition-opacity duration-1000 ${showBalance ? 'opacity-100' : 'opacity-0'}`}>
          ${balance.toLocaleString()}
        </div>
        <div className="text-red-200 text-base font-medium min-h-[1.5em]">{getCommentary(balance)}</div>
      </div>

      <div className="w-full max-w-lg flex flex-col gap-2 px-1 pb-1 flex-1 min-h-0">
        
        {/* Auntie Game */}
        <button 
          onClick={() => handleNavigate(AppView.GAME_AUNTIE)}
          className="flex-1 bg-red-700 hover:bg-red-600 border-4 border-yellow-500 rounded-xl p-2 flex flex-col items-center justify-center transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg group min-h-[90px]"
        >
          <div className="text-4xl mb-1 group-hover:animate-bounce">👵🏻</div>
          <h3 className="text-xl font-bold text-yellow-100 mb-0">毒舌阿姨的拷問</h3>
          <p className="text-red-100 text-center text-sm leading-relaxed mt-1">
            高風險高報酬 (x5)
          </p>
        </button>

        {/* Dream Game */}
        <button 
          onClick={() => handleNavigate(AppView.GAME_DREAM)}
          className="flex-1 bg-indigo-800 hover:bg-indigo-700 border-4 border-yellow-500 rounded-xl p-2 flex flex-col items-center justify-center transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg group min-h-[90px]"
        >
          <div className="text-4xl mb-1 group-hover:animate-pulse">😴</div>
          <h3 className="text-xl font-bold text-yellow-100 mb-0">新春周公解夢</h3>
          <p className="text-indigo-200 text-center text-sm leading-relaxed mt-1">
            AI 測吉凶 (x0 或 x1.5-3)
          </p>
        </button>

        {/* Dice Game */}
        <button 
          onClick={() => handleNavigate(AppView.GAME_DICE)}
          className="flex-1 bg-amber-800 hover:bg-amber-700 border-4 border-yellow-500 rounded-xl p-2 flex flex-col items-center justify-center transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg group min-h-[90px]"
        >
          <div className="text-4xl mb-1 group-hover:animate-spin">🎲</div>
          <h3 className="text-xl font-bold text-yellow-100 mb-0">馬年骰子樂</h3>
          <p className="text-amber-100 text-center text-sm leading-relaxed mt-1">
            快速對決 (x1.5 - x3)
          </p>
        </button>

        <div className="mt-auto w-full flex flex-col items-center gap-2 shrink-0 pt-2 border-t border-red-800/50">
           <button 
             onClick={handleRestartClick}
             className="w-full bg-red-950 border-2 border-red-500/50 hover:border-yellow-400 hover:bg-red-900 text-red-200 hover:text-yellow-100 py-3 rounded-xl transition-all text-lg font-bold shadow-lg flex items-center justify-center gap-2"
           >
             <span className="text-xl">🔄</span> 放棄重來 (重抽紅包)
           </button>
           <div className="text-center text-red-400 text-xs font-medium">
             警告：餘額可能歸零，小賭怡情，大賭傷身。
           </div>
        </div>
      </div>
    </div>
  );
};