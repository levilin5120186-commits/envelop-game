import React, { useState, useEffect } from 'react';
import { DreamResponse } from '../types';
import { interpretDream } from '../services/geminiService';
import { playClick, playWin, playLose, playFanfare } from '../services/soundService';

interface Props {
  balance: number;
  updateBalance: (amount: number) => void;
  onBack: () => void;
  onGameOver: () => void;
}

export const DreamGame: React.FC<Props> = ({ balance, updateBalance, onBack, onGameOver }) => {
  const [bet, setBet] = useState<number>(Math.min(100, balance));
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'ANALYZING' | 'RESULT'>('IDLE');
  const [result, setResult] = useState<DreamResponse | null>(null);

  // Rules UI state
  const [showRules, setShowRules] = useState(false);
  const [hasReadRules, setHasReadRules] = useState(false);
  const [isHighlighting, setIsHighlighting] = useState(false);

  // Auto limit bet
  useEffect(() => {
    if (balance > 0 && bet > balance) setBet(balance);
  }, [balance, bet]);

  // Periodic highlight effect for rules button
  useEffect(() => {
    if (hasReadRules) return;

    const interval = setInterval(() => {
      setIsHighlighting(true);
      // Turn off highlight after animation plays (e.g. 500ms)
      setTimeout(() => setIsHighlighting(false), 800);
    }, 2000); // Trigger every 2 seconds

    return () => clearInterval(interval);
  }, [hasReadRules]);

  const toggleRules = () => {
    playClick();
    setShowRules(!showRules);
    setHasReadRules(true);
    setIsHighlighting(false);
  };

  const handleSubmit = async () => {
    if (!input.trim() || bet > balance || bet <= 0) return;
    playClick();
    setStatus('ANALYZING');
    
    const aiResult = await interpretDream(input);
    setResult(aiResult);
    setStatus('RESULT');

    if (aiResult.type === 'GOOD') {
      const winnings = Math.floor(bet * aiResult.multiplier) - bet; 
      updateBalance(winnings); 
      playFanfare();
    } else {
      updateBalance(-bet);
      playLose();
    }
  };

  const handleReset = () => {
    playClick();
    if (balance <= 0) {
      onGameOver();
    } else {
      setInput('');
      setResult(null);
      setStatus('IDLE');
      setBet(Math.min(100, balance));
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-red-900 flex flex-col overflow-hidden relative">
      <div className="p-4 flex justify-between items-center shrink-0 z-10">
        <button onClick={() => { playClick(); onBack(); }} className="text-yellow-400 font-bold px-4 py-2 border-2 border-transparent hover:border-yellow-400 rounded-xl transition-all">&larr; 撤退</button>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleRules}
            className={`w-8 h-8 rounded-full border-2 font-bold flex items-center justify-center transition-all duration-300 relative
              ${showRules ? 'bg-yellow-500 text-red-900 border-yellow-500' : 'border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-red-900'}
              ${!hasReadRules && isHighlighting ? 'scale-125 shadow-[0_0_15px_rgba(234,179,8,1)] bg-yellow-500/20' : ''}
            `}
            aria-label="遊戲規則"
          >
            ?
          </button>
          <div className="text-yellow-400 font-mono font-bold text-2xl">${balance}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        {/* Use min-h-full to ensure content is centered vertically if small, but scrolls if tall */}
        <div className="min-h-full flex flex-col items-center justify-center max-w-2xl mx-auto p-4 pb-12">
          
          <div className="text-center mb-6 w-full">
            <h2 className="text-4xl font-bold text-yellow-100 mb-2 font-serif">新春周公解夢</h2>
            <p className="text-red-200">輸入你夢到的、看到的、想到的... AI 幫你測財運！</p>
          </div>

          {status === 'IDLE' && (
            <div className="bg-red-800 p-6 rounded-3xl border-4 border-red-700 shadow-xl w-full">
              <div className="mb-6">
                  <label className="text-yellow-200 text-xl font-bold mb-4 block">下注金額</label>
                  
                  <div className="flex flex-col gap-4 mb-2">
                    <input 
                      type="number" 
                      value={bet}
                      onChange={(e) => setBet(Number(e.target.value))}
                      className="bg-red-900 text-yellow-400 border-4 border-yellow-600 rounded-2xl p-4 text-4xl font-mono text-center focus:outline-none focus:ring-4 focus:ring-yellow-500 w-full"
                      max={balance}
                      min={1}
                    />
                    <input 
                      type="range" 
                      min="1" 
                      max={balance} 
                      value={bet} 
                      onChange={(e) => setBet(Number(e.target.value))}
                      className="w-full h-6 bg-red-950 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                  </div>
                  <div className="flex justify-between text-lg text-red-200 font-medium">
                    <span>最小: $1</span>
                    <span>最大: ${balance}</span>
                  </div>
              </div>

              <div className="mb-6">
                <label className="text-yellow-200 text-xl font-bold mb-2 block">你的意象 (夢境/物品)</label>
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="例如：馬桶、前男友、會飛的豬..."
                  className="w-full bg-red-900 text-white border-2 border-red-600 rounded-2xl p-4 text-xl focus:border-yellow-500 focus:outline-none placeholder-red-400/70"
                />
              </div>

              <button 
                  onClick={handleSubmit}
                  disabled={!input.trim() || bet > balance || bet <= 0}
                  className="w-full bg-yellow-500 text-red-900 font-bold py-4 rounded-2xl text-2xl hover:bg-yellow-400 disabled:opacity-50 shadow-lg"
                >
                  解夢 (吉則翻倍，凶則賠光)
                </button>
            </div>
          )}

          {status === 'ANALYZING' && (
            <div className="flex flex-col items-center justify-center text-yellow-200 py-12">
              <div className="text-8xl animate-pulse mb-6">🔮</div>
              <p className="text-2xl font-bold">通靈中...</p>
            </div>
          )}

          {status === 'RESULT' && result && (
            <div className="bg-red-800 p-6 rounded-3xl border-4 border-yellow-500 shadow-2xl animate-scale-in w-full">
              <div className="text-center mb-6">
                <div className="text-9xl mb-4">{result.type === 'GOOD' ? '🐎' : '💀'}</div>
                <h3 className={`text-5xl font-bold ${result.type === 'GOOD' ? 'text-green-400' : 'text-red-400'}`}>
                  {result.type === 'GOOD' ? '大吉！' : '大凶！'}
                </h3>
              </div>

              <div className="bg-red-900/50 p-5 rounded-2xl mb-6 border border-red-700">
                <p className="text-yellow-100 text-xl leading-relaxed font-medium">
                  "{result.explanation}"
                </p>
              </div>

              <div className="text-center mb-6">
                <p className="text-gray-300 text-xl">結果</p>
                {result.type === 'GOOD' ? (
                  <div className="text-green-400 text-3xl font-bold">
                    倍率 x{result.multiplier} <br/> 
                    贏得 ${Math.floor(bet * result.multiplier) - bet}
                  </div>
                ) : (
                  <div className="text-red-400 text-3xl font-bold">
                    輸掉 ${bet}
                  </div>
                )}
              </div>

              <button 
                onClick={handleReset}
                className="w-full bg-yellow-500 text-red-900 font-bold py-4 rounded-2xl text-2xl hover:bg-yellow-400 shadow-lg"
              >
                再測一次
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={toggleRules}>
          <div 
            className="bg-red-900 border-4 border-yellow-500 rounded-2xl max-w-md w-full p-6 relative shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-yellow-100 mb-4 text-center border-b-2 border-red-800 pb-2">📜 周公解夢規則</h3>
            
            <div className="text-red-100 space-y-3 text-lg leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <p>
                <span className="text-yellow-400 font-bold">1. 玩法：</span><br/>
                輸入你夢到的事物（或隨機想到的人事物），AI 大師將根據<span className="text-yellow-300 font-bold">馬年</span>運勢進行解讀。
              </p>
              <p>
                <span className="text-yellow-400 font-bold">2. 判定：</span><br/>
                <ul className="list-disc list-inside pl-2 mt-1 text-base text-red-300">
                  <li><span className="text-green-400 font-bold">大吉</span>：發財預兆，獲得獎金。</li>
                  <li><span className="text-red-400 font-bold">大凶</span>：破財預兆，失去下注金額。</li>
                </ul>
              </p>
              <p>
                <span className="text-yellow-400 font-bold">3. 賠率 (浮動)：</span><br/>
                大吉時，倍率隨機介於 <span className="text-green-400 font-bold">1.5倍 ~ 3.0倍</span> 之間。
              </p>
              <p className="bg-red-950 p-3 rounded-lg border border-red-700 text-sm">
                <span className="text-yellow-500 font-bold">💡 提示：</span>
                周公大師喜歡有創意的輸入，試試看輸入一些奇怪的東西，說不定會有意外的驚喜（或驚嚇）。
              </p>
            </div>

            <button 
              onClick={toggleRules}
              className="w-full mt-6 bg-yellow-600 text-white font-bold py-3 rounded-xl hover:bg-yellow-500 transition-colors"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
};