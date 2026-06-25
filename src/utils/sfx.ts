let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a gentle, organic "lub-dub" double heartbeat thump for a cute creature.
 */
export function playHeartbeat(volume = 0.5) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const playPulse = (time: number, isSecond: boolean) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    const startFreq = isSecond ? 65 : 72;
    const endFreq = 5;
    const duration = 0.12;
    const pulseVol = isSecond ? volume * 0.7 : volume;

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(80, time);
    filter.frequency.setValueAtTime(20, time + duration);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(pulseVol, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  };

  playPulse(now, false);
  playPulse(now + 0.18, true);
}

/**
 * Play a cute, crisp "click-snack" toy shell fracture sound instead of heavy crackling.
 */
export function playCrack(volume = 0.35) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Single crisp transient snap like a cartoon twig snapping
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);

  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  // High-pass sparkle band
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(3500, now);
  filter.Q.setValueAtTime(2, now);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.07);
}

/**
 * Play a pristine music-box chime with a soft, clean bell attack.
 */
export function playDing(volume = 0.3) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const root = 659.25; // E5, sweet and bright
  const ratios = [1.0, 1.5, 2.0]; // Simple, harmonious intervals
  const masterGain = ctx.createGain();
  
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(volume, now + 0.02);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
  masterGain.connect(ctx.destination);

  ratios.forEach((ratio, idx) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(root * ratio, now);

    const decayDuration = 1.0 * (1.0 / (ratio * 0.9));
    oscGain.gain.setValueAtTime(0.2, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + decayDuration);

    osc.connect(oscGain);
    oscGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 1.3);
  });
}

/**
 * Play a delightful bubble "pop" for the creature reveal (clean, bubbly, cute).
 */
export function playPop(volume = 0.45) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Hollow wooden block pop style
  const popOsc = ctx.createOscillator();
  const popGain = ctx.createGain();
  
  popOsc.type = "sine";
  popOsc.frequency.setValueAtTime(260, now);
  popOsc.frequency.exponentialRampToValueAtTime(1100, now + 0.08);

  popGain.gain.setValueAtTime(0, now);
  popGain.gain.linearRampToValueAtTime(volume, now + 0.005);
  popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  // Tiny water drop bubble sweep helper
  const dropOsc = ctx.createOscillator();
  const dropGain = ctx.createGain();
  dropOsc.type = "sine";
  dropOsc.frequency.setValueAtTime(450, now);
  dropOsc.frequency.exponentialRampToValueAtTime(1500, now + 0.06);

  dropGain.gain.setValueAtTime(volume * 0.5, now);
  dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  popOsc.connect(popGain);
  popGain.connect(ctx.destination);

  dropOsc.connect(dropGain);
  dropGain.connect(ctx.destination);

  popOsc.start(now);
  dropOsc.start(now);

  popOsc.stop(now + 0.1);
  dropOsc.stop(now + 0.08);
}
