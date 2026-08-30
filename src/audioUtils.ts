import { getFromStorage, saveToStorage } from './utils';

export const STORE_DONT_PUSH_CONFIG = 'ohknee.dontpush.audio.v1';

export interface DontPushAudioConfig {
  sourceType: 'preset' | 'url' | 'custom';
  audioUrl?: string; // custom URL or data URL
  presetName?: 'siren' | 'bruh' | 'airhorn' | 'laser' | 'glitch';
  volume: number; // 0 to 1
  label: string;
}

export const DEFAULT_AUDIO_CONFIG: DontPushAudioConfig = {
  sourceType: 'preset',
  presetName: 'siren',
  volume: 0.85,
  label: 'Emergency Alarm & Siren',
};

// Web Audio API Synthesizer for instant built-in sound without external dependencies
function playSynthesizedSound(preset: string, volume: number = 0.85) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);

    if (preset === 'airhorn') {
      // Fun fanfare chord
      const freqs = [330, 440, 554, 660];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.95, now + 0.4);

        g.gain.setValueAtTime(0.2, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.7 + idx * 0.1);

        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.8);
      });
    } else if (preset === 'bruh') {
      // Low sub bass boom drop
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.8);

      g.gain.setValueAtTime(0.9, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(g);
      g.connect(masterGain);
      osc.start(now);
      osc.stop(now + 1.0);
    } else if (preset === 'laser') {
      // Sci-fi laser zap
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

      g.gain.setValueAtTime(0.8, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(g);
      g.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (preset === 'glitch') {
      // High-pitched computer glitch burst
      for (let i = 0; i < 6; i++) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i % 2 === 0 ? 'square' : 'sawtooth';
        osc.frequency.setValueAtTime(300 + Math.random() * 800, now + i * 0.05);

        g.gain.setValueAtTime(0.4, now + i * 0.05);
        g.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.06);

        osc.connect(g);
        g.connect(masterGain);
        osc.start(now + i * 0.05);
        osc.stop(now + (i + 1) * 0.07);
      }
    } else {
      // Default: Emergency Siren & Alarm Wailing
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';

      // 4-second oscillating siren pitch
      for (let i = 0; i < 4; i++) {
        osc.frequency.setValueAtTime(500, now + i * 0.8);
        osc.frequency.linearRampToValueAtTime(950, now + i * 0.8 + 0.4);
        osc.frequency.linearRampToValueAtTime(500, now + (i + 1) * 0.8);
      }

      g.gain.setValueAtTime(0.4, now);
      g.gain.linearRampToValueAtTime(0.4, now + 3.0);
      g.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

      osc.connect(g);
      g.connect(masterGain);
      osc.start(now);
      osc.stop(now + 3.9);
    }
  } catch (err) {
    console.warn('Web Audio synthesis failed:', err);
  }
}

// Interactive sound effects for Wii avatar wheel and chat micro-sounds
export function playWiiTick(pitchMultiplier: number = 1): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440 * pitchMultiplier, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880 * pitchMultiplier, ctx.currentTime + 0.03);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // ignore
  }
}

export function playWiiVictoryChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    // Classic 2000s 4-note victory flourish: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.5);
    });
  } catch {
    // ignore
  }
}

export function playCustomChatSound(soundType?: string): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (soundType === 'wii' || soundType === 'sound-wii-chime') {
      [587.33, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.1, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.28);
      });
    } else if (soundType === '8bit' || soundType === 'sound-retro-8bit') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (soundType === 'cash' || soundType === 'sound-cash') {
      [987.77, 1318.51, 1567.98].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.09, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.32);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  } catch {
    // ignore
  }
}

// Global active audio ref to allow stopping or overlapping
let currentPlayingAudio: HTMLAudioElement | null = null;

export function playDontPushAudio(config?: DontPushAudioConfig): void {
  const currentConfig = config || getFromStorage<DontPushAudioConfig>(STORE_DONT_PUSH_CONFIG, DEFAULT_AUDIO_CONFIG);
  const volume = typeof currentConfig.volume === 'number' ? Math.max(0, Math.min(1, currentConfig.volume)) : 0.85;

  if (currentConfig.sourceType === 'custom' || currentConfig.sourceType === 'url') {
    if (currentConfig.audioUrl) {
      try {
        if (currentPlayingAudio) {
          currentPlayingAudio.pause();
          currentPlayingAudio.currentTime = 0;
        }
        const audio = new Audio(currentConfig.audioUrl);
        audio.volume = volume;
        currentPlayingAudio = audio;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Audio URL playback failed, falling back to synthesizer:', err);
            playSynthesizedSound(currentConfig.presetName || 'siren', volume);
          });
        }
        return;
      } catch (err) {
        console.warn('Audio player instantiation error:', err);
      }
    }
  }

  // Fallback to synthetic web audio sound
  playSynthesizedSound(currentConfig.presetName || 'siren', volume);
}
