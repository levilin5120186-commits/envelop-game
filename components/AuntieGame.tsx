import React, { useState, useEffect } from 'react';
import { AppView, AuntieResponse } from '../types';
import { AUNTIE_QUESTIONS } from '../constants';
import { judgeResponse } from '../services/geminiService';
import { playClick, playWin, playLose } from '../services/soundService';

interface Props {
  balance: number;
  updateBalance: (amount: number) => void;
  onBack: () => void;
}

export const AuntieGame: React.FC<Props> = ({ balance, updateBalance, onBack }) => {
  const [step, setStep] = useState<'BET' | 'QUESTION' | 'JUDGING' | 'RESULT'>('BET');
  const [bet, setBet] = useState<number>(Math.min(100, balance));
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<AuntieResponse | null>(null);

  useEffect(() => {
    if (step === 'QUESTION') {
      const q = AUNTIE_QUESTIONS[Math.floor(Math.random() * AUNTIE_QUESTIONS.length)];
      setQuestion(q);
    }
  }, [step]);

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
      updateBalance(bet);
      playWin();
    } else {
      updateBalance(-bet);
      playLose();
    }
    setStep('RESULT');
  };

  const resetRound = () => {
    playClick();
    setAnswer('');
    setResult(null);
    setStep('BET');
    if (balance <= 0) {
        setBet(0); 
    } else {
        setBet(Math.min(100, balance));
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-red-900 p-4 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <button onClick={() => { playClick(); onBack(); }} className="text-yellow-400 hover:text-white text-xl font-bold px-4 py-2 border-2 border-transparent hover:border-yellow-400 rounded-xl transition-all">&larr; 撤退</button>
        <div className="text-yellow-400 font-mono font-bold text-2xl">${balance}</div>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full justify-center overflow-y-auto">
        <h2 className="text-3xl font-bold text-yellow-100 mb-6 text-center font-serif shrink-0">阿姨的靈魂拷問</h2>

        {step === 'BET' && (
          <div className="bg-red-800 p-6 rounded-3xl border-4 border-red-700 shadow-xl m-1">
            <p className="text-red-100 mb-6 text-center text-xl font-bold">你對你的口才有信心嗎？</p>
            <div className="flex flex-col gap-6">
              <label className="text-yellow-200 text-xl font-bold">下注金額：</label>
              <input 
                type="number" 
                value={bet}
                onChange={(e) => setBet(Number(e.target.value))}
                className="bg-red-900 text-yellow-400 border-4 border-yellow-600 rounded-2xl p-4 text-4xl font-mono text-center focus:outline-none focus:ring-4 focus:ring-yellow-500"
                max={balance}
                min={1}
              />
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
                <h3 className={`text-4xl font-bold ${result.isPass ? 'text-green-400' : 'text-red-400'}`}>
                  {result.isPass ? '過關！' : '太讓人失望了！'}
                </h3>
                <p className="text-yellow-200 mt-3 font-mono text-2xl">分數：{result.score}/100</p>
             </div>

             <div className="bg-red-900/50 p-5 rounded-2xl mb-5 border-2 border-red-700">
               <p className="text-yellow-100 italic text-xl leading-relaxed">"{result.comment}"</p>
             </div>

             <div className="text-center mb-5">
               <p className="text-gray-300 text-xl mb-1">結果</p>
               <p className={`text-3xl font-bold ${result.isPass ? 'text-green-400' : 'text-red-400'}`}>
                 {result.isPass ? `+$${bet}` : `-$${bet}`}
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
    </div>
  );
};