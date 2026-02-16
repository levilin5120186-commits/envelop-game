import React, { useEffect } from 'react';
import { playLose, playClick } from '../services/soundService';

interface Props {
  onRestart: () => void;
}

export const GameOver: React.FC<Props> = ({ onRestart }) => {
  useEffect(() => {
    // Play sad sound when component mounts
    playLose();
  }, []);

  return (
    <div className="h-[100dvh] w-full bg-black flex flex-col items-center justify-center p-8 text-center overflow-hidden">
      <div className="text-8xl mb-8 animate-bounce">💸 👻 💸</div>
      <h1 className="text-5xl font-bold text-gray-300 mb-6">破產</h1>
      <p className="text-gray-400 mb-10 max-w-2xl text-2xl leading-relaxed font-medium">
        你玩太大了。親戚們對你搖頭，馬兒也帶著錢跑了。
        <br/>明年再接再厲！
      </p>
      
      <button 
        onClick={() => { playClick(); onRestart(); }}
        className="px-10 py-5 bg-red-700 text-white rounded-full font-bold text-2xl hover:bg-red-600 transition-colors border-4 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
      >
        再試一次 (投胎轉世)
      </button>
    </div>
  );
};