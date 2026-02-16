import React from 'react';
import { AppView } from '../types';
import { playClick } from '../services/soundService';

interface Props {
  balance: number;
  setView: (view: AppView) => void;
  onRestart: () => void;
}

export const Dashboard: React.FC<Props> = ({ balance, setView, onRestart }) => {
  
  const handleNavigate = (view: AppView) => {
    playClick();
    setView(view);
  };

  const handleRestartClick = () => {
    playClick();
    // Removed window.confirm to ensure the action triggers immediately
    onRestart();
  };

  return (
    <div className="h-[100dvh] w-full bg-red-900 p-4 flex flex-col items-center overflow-hidden animate-fade-in">
      <div className="w-full max-w-lg bg-red-800 rounded-3xl p-5 shadow-xl border-4 border-yellow-600 mb-4 text-center shrink-0">
        <h2 className="text-yellow-200 text-xl font-bold mb-2 uppercase tracking-widest">目前資產</h2>
        <div className="text-5xl font-bold text-yellow-400 font-mono mb-2">${balance.toLocaleString()}</div>
        <div className="text-red-200 text-lg font-medium">省著點花啊！</div>
      </div>

      <div className="w-full max-w-lg flex flex-col gap-4 overflow-y-auto px-1 pb-4 flex-1">
        <button 
          onClick={() => handleNavigate(AppView.GAME_AUNTIE)}
          className="bg-red-700 hover:bg-red-600 border-4 border-yellow-500 rounded-2xl p-5 flex flex-col items-center transition-all transform hover:scale-[1.02] shadow-lg group shrink-0"
        >
          <div className="text-6xl mb-2 group-hover:animate-bounce">👵🏻</div>
          <h3 className="text-2xl font-bold text-yellow-100 mb-1">毒舌阿姨的拷問</h3>
          <p className="text-red-100 text-center text-lg leading-relaxed">
            你能招架得住嗎？<br/>
            <span className="text-yellow-300 font-bold text-xl">高風險高報酬 (x2)</span>
          </p>
        </button>

        <button 
          onClick={() => handleNavigate(AppView.GAME_DICE)}
          className="bg-red-700 hover:bg-red-600 border-4 border-yellow-500 rounded-2xl p-5 flex flex-col items-center transition-all transform hover:scale-[1.02] shadow-lg group shrink-0"
        >
          <div className="text-6xl mb-2 group-hover:animate-spin">🎲</div>
          <h3 className="text-2xl font-bold text-yellow-100 mb-1">馬年骰子樂</h3>
          <p className="text-red-100 text-center text-lg leading-relaxed">
            一擲定乾坤！<br/>
            <span className="text-yellow-300 font-bold text-xl">快速對決 (x1.5 - x3)</span>
          </p>
        </button>

        <div className="mt-auto w-full flex flex-col items-center gap-3 shrink-0 pt-2 border-t border-red-800/50">
           <button 
             onClick={handleRestartClick}
             className="flex items-center gap-2 text-red-300 hover:text-yellow-200 hover:bg-red-800/50 px-4 py-2 rounded-full transition-colors text-sm font-medium"
           >
             <span>🔄</span> 放棄重來 (重抽紅包)
           </button>
           <div className="text-center text-red-400 text-xs font-medium">
             警告：餘額可能歸零，小賭怡情，大賭傷身。
           </div>
        </div>
      </div>
    </div>
  );
};