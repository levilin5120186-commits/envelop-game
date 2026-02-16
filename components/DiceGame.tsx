import React, { useState } from 'react';
import { playClick, playDiceShake, playWin, playLose } from '../services/soundService';

interface Props {
  balance: number;
  updateBalance: (amount: number) => void;
  onBack: () => void;
}

type BetType = 'LOW' | 'HIGH' | 'TRIPLE';

export const DiceGame: React.FC<Props> = ({ balance, updateBalance, onBack }) => {
  const [betAmount, setBetAmount] = useState<number>(Math.min(50, balance));
  const [betType, setBetType] = useState<BetType | null>(null);
  const [dice, setDice] = useState<number[]>([1, 1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [message, setMessage] = useState<string>("請下注！");

  const handleBetType = (type: BetType) => {
    playClick();
    setBetType(type);
  }

  const rollDice = () => {
    if (!betType || betAmount > balance || betAmount <= 0) return;

    playDiceShake();
    setIsRolling(true);
    setMessage("擲骰中...");

    // Animation effect
    let count = 0;
    const interval = setInterval(() => {
      setDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
      count++;
      if (count > 10) {
        clearInterval(interval);
        finalizeRoll();
      }
    }, 100);
  };

  const finalizeRoll = () => {
    const finalDice = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ];
    setDice(finalDice);
    setIsRolling(false);

    const sum = finalDice.reduce((a, b) => a + b, 0);
    const isTriple = finalDice[0] === finalDice[1] && finalDice[1] === finalDice[2];
    
    // Logic: Low (4-10), High (11-17). Triples lose Low/High bets.
    let won = false;
    let multiplier = 0;

    if (betType === 'TRIPLE' && isTriple) {
      won = true;
      multiplier = 10;
    } else if (betType === 'LOW' && sum >= 4 && sum <= 10 && !isTriple) {
      won = true;
      multiplier = 1; 
    } else if (betType === 'HIGH' && sum >= 11 && sum <= 17 && !isTriple) {
      won = true;
      multiplier = 1;
    }

    if (won) {
      const winnings = betAmount * (multiplier === 1 ? 1 : multiplier);
      updateBalance(winnings);
      playWin();
      setMessage(`贏了！ +$${winnings}`);
    } else {
      updateBalance(-betAmount);
      playLose();
      setMessage(`輸了 -$${betAmount}`);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-red-900 p-4 flex flex-col items-center overflow-hidden">
      <div className="w-full flex justify-between items-center mb-4 max-w-2xl shrink-0">
        <button onClick={() => { playClick(); onBack(); }} className="text-yellow-400 hover:text-white text-xl font-bold px-5 py-2 border-2 border-transparent hover:border-yellow-400 rounded-xl transition-all">&larr; 返回</button>
        <div className="text-yellow-400 font-mono font-bold text-2xl">${balance}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl overflow-y-auto">
        <div className="text-center mb-6 shrink-0">
          <h2 className="text-4xl text-yellow-100 font-serif font-bold mb-2">馬年骰子樂</h2>
          <p className="text-red-200 text-xl font-medium">小 (4-10) • 大 (11-17) • 豹子</p>
        </div>

        {/* Dice Display */}
        <div className="flex gap-4 mb-8 shrink-0">
          {dice.map((d, i) => (
            <div key={i} className={`w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform transition-transform border-4 border-gray-200 ${isRolling ? 'rotate-180' : ''}`}>
               <span className={`text-6xl font-bold text-red-600`}>{['⚀','⚁','⚂','⚃','⚄','⚅'][d-1]}</span>
            </div>
          ))}
        </div>

        {/* Message Area */}
        <div className="h-10 mb-6 text-yellow-300 font-bold text-3xl tracking-wide drop-shadow-md shrink-0">{message}</div>

        {/* Controls */}
        <div className="w-full bg-red-800 p-5 rounded-3xl border-4 border-yellow-600/30 shadow-xl shrink-0">
          
          {/* Bet Amount */}
          <div className="mb-5">
            <label className="text-red-100 text-xl font-bold mb-2 block">下注金額</label>
            <input 
              type="number" 
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full bg-red-900 text-yellow-400 border-2 border-red-600 rounded-2xl p-3 text-center text-3xl font-mono focus:outline-none focus:border-yellow-500"
              max={balance}
              min={1}
              disabled={isRolling}
            />
          </div>

          {/* Bet Type Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <button 
              onClick={() => handleBetType('LOW')}
              className={`p-3 rounded-xl border-4 font-bold transition-all text-xl ${betType === 'LOW' ? 'bg-yellow-500 text-red-900 border-yellow-300 scale-105' : 'bg-red-900 text-red-200 border-red-700 hover:border-yellow-600 hover:text-white'}`}
              disabled={isRolling}
            >
              小
              <span className="block text-sm font-normal opacity-75 mt-1">1:1</span>
            </button>
            <button 
              onClick={() => handleBetType('TRIPLE')}
              className={`p-3 rounded-xl border-4 font-bold transition-all text-xl ${betType === 'TRIPLE' ? 'bg-yellow-500 text-red-900 border-yellow-300 scale-105' : 'bg-red-900 text-red-200 border-red-700 hover:border-yellow-600 hover:text-white'}`}
              disabled={isRolling}
            >
              豹子
              <span className="block text-sm font-normal opacity-75 mt-1">10:1</span>
            </button>
            <button 
              onClick={() => handleBetType('HIGH')}
              className={`p-3 rounded-xl border-4 font-bold transition-all text-xl ${betType === 'HIGH' ? 'bg-yellow-500 text-red-900 border-yellow-300 scale-105' : 'bg-red-900 text-red-200 border-red-700 hover:border-yellow-600 hover:text-white'}`}
              disabled={isRolling}
            >
              大
              <span className="block text-sm font-normal opacity-75 mt-1">1:1</span>
            </button>
          </div>

          <button 
            onClick={rollDice}
            disabled={!betType || isRolling || betAmount > balance || betAmount <= 0}
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 text-red-900 font-bold py-4 rounded-2xl text-3xl uppercase tracking-widest shadow-lg hover:shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-transform"
          >
            擲骰
          </button>
        </div>
      </div>
    </div>
  );
};