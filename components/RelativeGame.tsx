import React, { useState, useEffect } from 'react';
import { RelativeQuestion, RelativeJudgeResponse } from '../types';
import { generateRelativeQuestion, judgeRelativeAnswer } from '../services/geminiService';
import { playClick, playWin, playLose } from '../services/soundService';

interface Props {
  balance: number;
  updateBalance: (amount: number) => void;
  onBack: () => void;
  onGameOver: () => void;
}

export const RelativeGame: React.FC<Props> = ({ balance, updateBalance, onBack, onGameOver }) => {
  const [bet, setBet] = useState<number>(Math.min(100, balance));
  const [step, setStep] = useState<'BET' | 'LOADING_Q' | 'ANSWER' | 'JUDGING' | 'RESULT'>('BET');
  const [question, setQuestion] = useState<RelativeQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<RelativeJudgeResponse | null>(null);

  useEffect(() => {
    if (balance > 0 && bet > balance) setBet(balance);
  }, [balance, bet]);

  const startGame = async () => {
    if (bet > balance || bet <= 0) return;
    playClick();
    setStep('LOADING_Q');
    const q = await generateRelativeQuestion();
    setQuestion(q);
    setStep('ANSWER');
  };

  const submitAnswer = async () => {
    if (!answer.trim() || !question) return;
    playClick();
    setStep('JUDGING');
    const res = await judgeRelativeAnswer(question.description, answer);
    setResult(res);
    setStep('RESULT');

    if (res.isCorrect) {
      updateBalance(bet); // 1:1 payout
      playWin();
    } else {
      updateBalance(-bet);
      playLose();
    }
  };

  const reset = () => {
    playClick();
    if (balance <= 0) {
      onGameOver();
    } else {
      setAnswer('');
      setResult(null);
      setQuestion(null);
      setStep('BET');
      setBet(Math.min(100, balance));
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-red-900 p-4 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <button onClick={() => { playClick(); onBack(); }} className="text-yellow-400 font-bold px-4 py-2 border-2 border-transparent hover:border-yellow-400 rounded-xl transition-all">&larr; 撤退</button>
        <div className="text-yellow-400 font-mono font-bold text-2xl">${balance}</div>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full justify-center overflow-y-auto">
        <h2 className="text-4xl font-bold text-yellow-100 mb-2 text-center font-serif">親戚稱謂大亂鬥</h2>

        {step === 'BET' && (
          <div className="bg-red-800 p-6 rounded-3xl border-4 border-red-700 shadow-xl m-1">
             <p className="text-red-200 text-center mb-6 text-xl">考驗你過年叫人的功力！答對獲得賭金，答錯扣除。</p>
             <div className="mb-6">
                <label className="text-yellow-200 text-xl font-bold mb-2 block">下注金額</label>
                <input 
                  type="range" 
                  min="1" 
                  max={balance} 
                  value={bet} 
                  onChange={(e) => setBet(Number(e.target.value))}
                  className="w-full h-6 bg-red-950 rounded-lg appearance-none cursor-pointer accent-yellow-500 mb-2"
                />
                <div className="text-center text-3xl font-mono text-yellow-400 font-bold">${bet}</div>
             </div>
             <button onClick={startGame} className="w-full bg-yellow-500 text-red-900 font-bold py-4 rounded-2xl text-2xl hover:bg-yellow-400 shadow-lg">開始挑戰</button>
          </div>
        )}

        {step === 'LOADING_Q' && (
          <div className="text-center text-yellow-200 animate-pulse text-2xl font-bold">阿姨正在想題目...</div>
        )}

        {step === 'ANSWER' && question && (
          <div className="bg-red-800 p-6 rounded-3xl border-4 border-red-700 shadow-xl m-1 animate-fade-in">
             <div className="bg-white p-5 rounded-2xl mb-6 shadow-inner text-center">
                <p className="text-gray-500 text-lg mb-1">請問：</p>
                <p className="text-gray-900 text-3xl font-bold leading-relaxed">{question.description}</p>
                <p className="text-gray-500 text-lg mt-2">該怎麼稱呼？</p>
             </div>
             <input 
                 type="text"
                 value={answer}
                 onChange={(e) => setAnswer(e.target.value)}
                 placeholder="例如：表哥、舅媽..."
                 className="w-full bg-red-900 text-white border-2 border-red-600 rounded-2xl p-4 text-2xl text-center focus:border-yellow-500 focus:outline-none mb-6"
             />
             <button 
                onClick={submitAnswer}
                disabled={!answer.trim()}
                className="w-full bg-yellow-500 text-red-900 font-bold py-4 rounded-2xl text-2xl hover:bg-yellow-400 shadow-lg"
             >
               確定
             </button>
          </div>
        )}

        {step === 'JUDGING' && (
          <div className="text-center text-yellow-200 animate-pulse text-2xl font-bold">翻族譜檢查中...</div>
        )}

        {step === 'RESULT' && result && (
          <div className="bg-red-800 p-6 rounded-3xl border-4 border-yellow-500 shadow-2xl animate-scale-in m-1">
             <div className="text-center mb-6">
                <div className="text-8xl mb-2">{result.isCorrect ? '⭕' : '❌'}</div>
                <h3 className={`text-4xl font-bold ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {result.isCorrect ? '答對了！' : '亂叫！'}
                </h3>
             </div>
             
             {!result.isCorrect && (
               <div className="bg-red-950 p-4 rounded-xl mb-6 border border-red-600 text-center">
                 <p className="text-gray-400 text-sm">正確答案應該是</p>
                 <p className="text-yellow-400 text-3xl font-bold mt-1">{result.correctAnswer}</p>
               </div>
             )}

             <p className="text-center text-red-200 text-xl mb-6 italic">"{result.comment}"</p>
             
             <div className="text-center mb-6">
                <p className={`text-3xl font-bold ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {result.isCorrect ? `+$${bet}` : `-$${bet}`}
                </p>
             </div>

             <button onClick={reset} className="w-full bg-yellow-500 text-red-900 font-bold py-4 rounded-2xl text-2xl hover:bg-yellow-400 shadow-lg">
               下一題
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
