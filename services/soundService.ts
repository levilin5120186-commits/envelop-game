// Simple synthesizer using Web Audio API to avoid external asset dependencies
let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

const ensureContext = () => {
  const ctx = getContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
};

// --- Traditional SFX Generators ---

// 1. Click: Traditional "Bangzi" (Wood block) / Crisp Bamboo sound
export const playClick = () => {
  try {
    const ctx = ensureContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // High pitch, very short decay for "wood" feel
    osc.type = 'sine'; 
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

// 2. Win: "Coin Drop" / Pentatonic Cascade
export const playWin = () => {
  try {
    const ctx = ensureContext();
    const t = ctx.currentTime;
    
    // Pentatonic Scale High Notes (G5, A5, C6, D6, E6, G6)
    const notes = [783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98];
    
    // Play a rapid sequence
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.08); 
      
      // Coin "ting" envelope
      gain.gain.setValueAtTime(0, t + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.1, t + i * 0.08 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.5);
    });
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

// 3. Lose: "Wah-Wah-Wah" (Comical Fail)
export const playLose = () => {
  try {
    const ctx = ensureContext();
    const t = ctx.currentTime;

    const playWah = (startTime: number, startFreq: number, endFreq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(startFreq, startTime);
      osc.frequency.linearRampToValueAtTime(endFreq, startTime + 0.4);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    };

    playWah(t, 392.00, 369.99); // G -> F#
    playWah(t + 0.4, 369.99, 349.23); // F# -> F
    playWah(t + 0.8, 349.23, 261.63); // F -> C (Long slide)
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

// 4. Fanfare: Firecrackers + Gong
export const playFanfare = () => {
  try {
    const ctx = ensureContext();
    const t = ctx.currentTime;

    // --- Gong Sound (Low frequency complex tone) ---
    const gongFreqs = [150, 200, 250]; 
    gongFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 0 ? 'sine' : 'square';
      osc.frequency.setValueAtTime(freq, t);
      
      // Pitch drop
      osc.frequency.exponentialRampToValueAtTime(freq * 0.95, t + 2.0);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3 / (i + 1), t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

      // Lowpass filter to dampen harshness
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, t);
      filter.frequency.exponentialRampToValueAtTime(100, t + 2.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 2.5);
    });

    // --- Firecrackers (Bursts of Noise) ---
    const createFirecracker = (time: number) => {
      const bufferSize = ctx.sampleRate * 0.1; 
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.8;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, time);
      noiseGain.gain.linearRampToValueAtTime(0.8, time + 0.01);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      
      // Highpass for snap
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 600;

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(time);
    };

    // Burst sequence
    for (let i = 0; i < 15; i++) {
      const delay = Math.random() * 1.5; 
      createFirecracker(t + delay);
    }
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

// 5. Dice Shake: Rattling inside a cup
export const playDiceShake = () => {
  try {
    const ctx = ensureContext();
    
    const bufferSize = ctx.sampleRate * 0.3; 
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // White noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass'; 
    filter.frequency.value = 1000;
    filter.Q.value = 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  } catch (e) {
    console.error("Audio play failed", e);
  }
};