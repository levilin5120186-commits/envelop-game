// Using HTML5 Audio for high-quality sound effects
// Assets sourced from free-to-use libraries (Mixkit) as placeholders for Envato-style assets

const SOUND_URLS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Crisp UI Pop
  win: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Jackpot/Coins
  lose: 'https://assets.mixkit.co/active_storage/sfx/890/890-preview.mp3', // Retro Lose/Fail
  fanfare: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3', // Bonus Earned / Success
  dice: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3', // Dice throw
};

// Cache Audio objects to prevent reloading on every click
const audioCache: Record<string, HTMLAudioElement> = {};

const loadSound = (key: keyof typeof SOUND_URLS) => {
  if (!audioCache[key]) {
    audioCache[key] = new Audio(SOUND_URLS[key]);
    // Pre-configure volume or other properties if needed
    audioCache[key].volume = 0.6; 
    audioCache[key].load();
  }
  return audioCache[key];
};

// Preload all sounds immediately
Object.keys(SOUND_URLS).forEach((key) => loadSound(key as keyof typeof SOUND_URLS));

const playSound = (key: keyof typeof SOUND_URLS) => {
  const audio = loadSound(key);
  // Clone node allows overlapping sounds (e.g., clicking fast)
  // or simply reset currentTime. For game sounds, cloning or resetting is good.
  // Resetting is simpler for memory, but cloning is better for rapid fire.
  // Let's stick to simple reset for this app to avoid resource leaks.
  
  // Create a one-off clone for overlapping sounds (like rapid clicking)
  if (key === 'click') {
     const clone = audio.cloneNode() as HTMLAudioElement;
     clone.volume = 0.6;
     clone.play().catch(e => console.warn("Audio play blocked:", e));
  } else {
     // For longer sounds like Win/Fanfare, restart them
     audio.currentTime = 0;
     audio.play().catch(e => console.warn("Audio play blocked:", e));
  }
};

export const playClick = () => playSound('click');
export const playWin = () => playSound('win');
export const playLose = () => playSound('lose');
export const playFanfare = () => playSound('fanfare');
export const playDiceShake = () => playSound('dice');
