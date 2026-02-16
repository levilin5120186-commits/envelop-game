import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import { RedEnvelope } from './components/RedEnvelope';
import { Dashboard } from './components/Dashboard';
import { AuntieGame } from './components/AuntieGame';
import { DiceGame } from './components/DiceGame';
import { GameOver } from './components/GameOver';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [balance, setBalance] = useState<number>(0);

  // Check for game over condition
  useEffect(() => {
    if (view !== AppView.LANDING && view !== AppView.GAME_OVER && balance <= 0) {
      // Small delay to let user see the loss result before switching screen
      const timer = setTimeout(() => {
        setView(AppView.GAME_OVER);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [balance, view]);

  const handleEnvelopeOpen = (amount: number) => {
    setBalance(amount);
    setView(AppView.DASHBOARD);
  };

  const updateBalance = (amount: number) => {
    setBalance(prev => Math.max(0, prev + amount));
  };

  const handleRestart = () => {
    setBalance(0);
    setView(AppView.LANDING);
  };

  return (
    <div className="font-sans antialiased text-gray-900 select-none relative">
      
      {view === AppView.LANDING && (
        <RedEnvelope onOpen={handleEnvelopeOpen} />
      )}
      
      {view === AppView.DASHBOARD && (
        <Dashboard 
          balance={balance} 
          setView={setView} 
          onRestart={handleRestart} 
        />
      )}
      
      {view === AppView.GAME_AUNTIE && (
        <AuntieGame 
          balance={balance} 
          updateBalance={updateBalance} 
          onBack={() => setView(AppView.DASHBOARD)} 
        />
      )}
      
      {view === AppView.GAME_DICE && (
        <DiceGame 
          balance={balance} 
          updateBalance={updateBalance} 
          onBack={() => setView(AppView.DASHBOARD)} 
        />
      )}

      {view === AppView.GAME_OVER && (
        <GameOver onRestart={handleRestart} />
      )}
    </div>
  );
};

export default App;