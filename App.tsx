import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import { RedEnvelope } from './components/RedEnvelope';
import { Dashboard } from './components/Dashboard';
import { AuntieGame } from './components/AuntieGame';
import { DiceGame } from './components/DiceGame';
import { DreamGame } from './components/DreamGame';
import { GameOver } from './components/GameOver';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [balance, setBalance] = useState<number>(0);
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [isJustOpened, setIsJustOpened] = useState(false);

  // Check for game over condition
  useEffect(() => {
    // We skip the auto-check for AuntieGame and DreamGame (if we want to show result first)
    // Actually, AuntieGame handles it manually. Dream also show results first.
    if (view === AppView.GAME_AUNTIE || view === AppView.GAME_DREAM) return;

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
    setIsJustOpened(true);
    // Reveal dashboard immediately behind the envelope
    setView(AppView.DASHBOARD);
  };

  const handleEnvelopeComplete = () => {
    // Remove envelope after animation finishes
    setShowEnvelope(false);
    // Reset the just opened flag after animation completes
    setIsJustOpened(false);
  };

  const updateBalance = (amount: number) => {
    setBalance(prev => Math.max(0, prev + amount));
  };

  const handleRestart = () => {
    setBalance(0);
    setShowEnvelope(true);
    setIsJustOpened(false);
    setView(AppView.LANDING);
  };

  return (
    <div className="font-sans antialiased text-gray-900 select-none relative h-[100dvh] w-full overflow-hidden bg-red-900">
      
      {view === AppView.DASHBOARD && (
        <Dashboard 
          balance={balance} 
          setView={setView} 
          onRestart={handleRestart}
          isJustOpened={isJustOpened}
        />
      )}
      
      {view === AppView.GAME_AUNTIE && (
        <AuntieGame 
          balance={balance} 
          updateBalance={updateBalance} 
          onBack={() => setView(AppView.DASHBOARD)} 
          onGameOver={() => setView(AppView.GAME_OVER)}
        />
      )}
      
      {view === AppView.GAME_DREAM && (
        <DreamGame 
          balance={balance} 
          updateBalance={updateBalance} 
          onBack={() => setView(AppView.DASHBOARD)} 
          onGameOver={() => setView(AppView.GAME_OVER)}
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

      {/* Red Envelope Overlay */}
      {showEnvelope && (
        <RedEnvelope 
          onOpen={handleEnvelopeOpen} 
          onComplete={handleEnvelopeComplete}
        />
      )}
    </div>
  );
};

export default App;