import React, { useState, useEffect } from 'react';
import { AppView, AuntieResponse } from '../types';
import { AUNTIE_QUESTIONS } from '../constants';
import { judgeResponse } from '../services/geminiService';
import { playClick, playWin, playLose } from '../services/soundService';

interface Props {
  balance: number;
  updateBalance: (amount: number) => void;
  onBack: () => void;
  onGameOver: () => void;
}

export const AuntieGame: React.FC<Props> = ({ balance, updateBalance, onBack, onGameOver }) => {
  const [step, setStep] = useState<'BET' | 'QUESTION' | 'JUDGING' | 'RESULT'>('BET');
  const [bet, setBet] = useState<number>(Math.min(100, balance));
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<AuntieResponse | null>(null);
  
  // Rules UI state
  const [showRules, setShowRules] = useState(false);
  const [hasReadRules, setHasReadRules] = useState(false);
  const [isHighlighting, setIsHighlighting] = useState(false);

  useEffect(() => {
    if (step === 'QUESTION') {
      const q = AUNTIE_QUESTIONS[Math.floor(Math.random() * AUNTIE_QUESTIONS.length)];
      setQuestion(q);
    }
  }, [step]);

  // Safeguard bet amount
  useEffect(() => {
    if (balance > 0 && bet > balance) {
      setBet(balance);
    }
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

  const handleBetSubmit = () => {
    if (bet > balance || bet <= 0) return;
    playClick();
    setStep('QUESTION');
  };

  const handleAnswerSubmit = async () => {
    if (!answer.trim()) return;
    playClick();
    setStep('JUDGING');
    const aiResult = await judgeResponse(question, answer);
    setResult(aiResult);
    
    if (aiResult.isPass) {
      updateBalance(bet * 5); // 5x Payout
      playWin();
    } else {
      updateBalance(-bet);
      playLose();
    }
    setStep('RESULT');
  };

  const resetRound = () => {
    playClick();
    
    if (balance <= 0) {
      onGameOver();
      return;
    }

    setAnswer('');
    setResult(null);
    setStep('BET');
    setBet(prev => Math.min(prev, balance));
  };

  const toggleRules = () => {
    playClick();
    setShowRules(!showRules);
    setHasReadRules(true);
    setIsHighlighting(false);
  };

  const getResultTitle = (score: number) => {
    if (score === 100) return "太神啦！阿姨直接包給你";
    if (score >= 90) return "這孩子嘴真甜！阿姨喜歡";
    if (score >= 80) return "嗯... 還算像句人話";
    if (score >= 60) return "算了，這次就放過你";
    if (score >= 40) return "唉，現在年輕人...";
    if (score >= 20) return "你這是在跟長輩頂嘴嗎？";
    return "出去！別說你認識我！";
  };

  return (
    <div className="h-[100dvh] w-full bg-red-900 p-4 flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <button onClick={() => { playClick(); onBack(); }} className="text-yellow-400 hover:text-white text-xl font-bold px-4 py-2 border-2 border-transparent hover:border-yellow-400 rounded-xl transition-all">&larr; 撤退</button>
        
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

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full justify-center overflow-y-auto">
        <h2 className="text-3xl font-bold text-yellow-100 mb-6 text-center font-serif shrink-0">阿姨的靈魂拷問</h2>

        {step === 'BET' && (
          <div className="bg-red-800 p-6 rounded-3xl border-4 border-red-700 shadow-xl m-1">
            <p className="text-red-100 mb-6 text-center text-xl font-bold">你對你的口才有信心嗎？</p>
            <div className="flex flex-col gap-6">
              <label className="text-yellow-200 text-xl font-bold">下注金額：</label>
              
              <div className="flex flex-col gap-4">
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
                  className="w-full h-4 bg-red-950 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>

              <div className="flex justify-between text-lg text-red-200 font-medium">
                <span>最小: $1</span>
                <span>最大: ${balance}</span>
              </div>
              <button 
                onClick={handleBetSubmit}
                disabled={bet > balance || bet <= 0}
                className="mt-4 bg-yellow-500 text-red-900 font-bold py-4 rounded-2xl text-2xl hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                開始對話
              </button>
            </div>
          </div>
        )}

        {step === 'QUESTION' && (
          <div className="bg-red-800 p-5 rounded-3xl border-4 border-red-700 shadow-xl animate-fade-in m-1 flex flex-col h-full max-h-[75vh]">
            <div className="flex items-start gap-4 mb-4 shrink-0">
              <div className="text-6xl bg-yellow-100 rounded-full p-2 border-4 border-yellow-500 flex-shrink-0">👵🏻</div>
              <div className="bg-white text-black p-5 rounded-r-3xl rounded-bl-3xl shadow-md flex-1 relative">
                <div className="absolute top-0 left-0 -ml-4 mt-6 w-8 h-8 bg-white transform rotate-45"></div>
                <p className="relative z-10 font-bold text-xl leading-relaxed italic text-gray-800">"{question}"</p>
              </div>
            </div>

            <textarea 
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="在這裡輸入你的機智回覆..."
              className="w-full bg-red-900 text-white border-2 border-red-600 rounded-2xl p-4 text-xl focus:border-yellow-500 focus:outline-none placeholder-red-400/70 flex-1 resize-none mb-4"
            />
            
            <button 
              onClick={handleAnswerSubmit}
              disabled={!answer.trim()}
              className="w-full bg-yellow-500 text-red-900 font-bold py-4 rounded-2xl text-2xl hover:bg-yellow-400 disabled:opacity-50 shadow-lg shrink-0"
            >
              回覆並祈禱
            </button>
          </div>
        )}

        {step === 'JUDGING' && (
          <div className="flex-1 flex flex-col items-center justify-center text-yellow-200">
            <div className="text-8xl animate-spin mb-8">🌀</div>
            <p className="animate-pulse text-2xl font-bold">阿姨正在評斷你...</p>
          </div>
        )}

        {step === 'RESULT' && result && (
          <div className="bg-red-800 p-6 rounded-3xl border-4 border-yellow-500 shadow-2xl animate-scale-in m-1 overflow-y-auto">
             <div className="text-center mb-5">
                <div className={`text-7xl mb-3 ${result.isPass ? 'animate-bounce' : 'animate-shake'}`}>
                  {result.isPass ? '🧧' : '💢'}
                </div>
                <h3 className={`text-3xl md:text-4xl font-bold ${result.isPass ? 'text-green-400' : 'text-red-400'}`}>
                  {getResultTitle(result.score)}
                </h3>
                <p className="text-yellow-200 mt-3 font-mono text-2xl">分數：{result.score}/100</p>
             </div>

             <div className="bg-red-900/50 p-5 rounded-2xl mb-5 border-2 border-red-700">
               <p className="text-yellow-100 italic text-xl leading-relaxed">"{result.comment}"</p>
             </div>

             <div className="text-center mb-5">
               <p className="text-gray-300 text-xl mb-1">結果</p>
               <p className={`text-3xl font-bold ${result.isPass ? 'text-green-400' : 'text-red-400'}`}>
                 {result.isPass ? `+$${bet * 5}` : `-$${bet}`}
               </p>
             </div>

             <button 
              onClick={resetRound}
              className="w-full bg-yellow-500 text-red-900 font-bold py-4 rounded-2xl text-2xl hover:bg-yellow-400 shadow-lg"
            >
              再玩一次
            </button>
          </div>
        )}
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={toggleRules}>
          <div 
            className="bg-red-900 border-4 border-yellow-500 rounded-2xl max-w-md w-full p-6 relative shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-yellow-100 mb-4 text-center border-b-2 border-red-800 pb-2">📜 遊戲規則</h3>
            
            <div className="text-red-100 space-y-3 text-lg leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <p>
                <span className="text-yellow-400 font-bold">1. 玩法：</span><br/>
                AI 扮演毒舌阿姨提出過年常見的尷尬問題，你需要輸入回應來應對。
              </p>
              <p>
                <span className="text-yellow-400 font-bold">2. 判定：</span><br/>
                AI 會根據你的回答進行評分（0-100分）。
                <ul className="list-disc list-inside pl-2 mt-1 text-base text-red-300">
                  <li>60分以上：過關 (Pass)</li>
                  <li>60分以下：失敗 (Fail)</li>
                </ul>
              </p>
              <p>
                <span className="text-yellow-400 font-bold">3. 賠率 (<span className="text-green-400">1賠5</span>)：</span><br/>
                阿姨雖然毒舌，但出手大方。獲勝可贏得下注金額的 <span className="text-green-400 font-bold">5倍</span>！失敗則失去下注金額。
              </p>
              <p className="bg-red-950 p-3 rounded-lg border border-red-700 text-sm">
                <span className="text-yellow-500 font-bold">💡 提示：</span>
                阿姨喜歡有禮貌、幽默、機智，或是能夠讓她覺得你有出息的回答。展現你的高情商吧！
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