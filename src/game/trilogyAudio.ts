type TrilogySfx = "purchase" | "puzzle-solved";
type TrilogyAmbientChapter = 7 | 8 | 9;

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextConstructor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return null;
  audioContext ??= new AudioContextConstructor();
  return audioContext;
}

export function playTrilogySfx(kind: TrilogySfx, enabled = true) {
  if (!enabled) return;
  const context = getAudioContext();
  if (!context) return;

  void context.resume().catch(() => undefined);
  const now = context.currentTime;
  const notes =
    kind === "purchase"
      ? [
          { frequency: 523.25, delay: 0, duration: 0.07, volume: 0.035 },
          { frequency: 783.99, delay: 0.055, duration: 0.1, volume: 0.025 },
        ]
      : [
          { frequency: 392, delay: 0, duration: 0.08, volume: 0.03 },
          { frequency: 523.25, delay: 0.07, duration: 0.08, volume: 0.035 },
          { frequency: 659.25, delay: 0.14, duration: 0.14, volume: 0.04 },
        ];

  notes.forEach(({ frequency, delay, duration, volume }) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = kind === "purchase" ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, now + delay);
    gain.gain.setValueAtTime(0.0001, now + delay);
    gain.gain.exponentialRampToValueAtTime(volume, now + delay + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now + delay);
    oscillator.stop(now + delay + duration + 0.02);
  });
}

export function startTrilogyAmbient(chapter: TrilogyAmbientChapter, enabled = true) {
  if (!enabled) return () => undefined;
  const context = getAudioContext();
  if (!context) return () => undefined;

  void context.resume().catch(() => undefined);
  const master = context.createGain();
  const pulse = context.createOscillator();
  const pulseGain = context.createGain();
  const drone = context.createOscillator();
  const droneGain = context.createGain();
  const now = context.currentTime;
  const settings =
    chapter === 7
      ? { drone: 55, pulse: 82.41, depth: 0.018, color: "triangle" as OscillatorType }
      : chapter === 8
        ? { drone: 65.41, pulse: 98, depth: 0.014, color: "sine" as OscillatorType }
        : { drone: 43.65, pulse: 174.61, depth: 0.012, color: "sawtooth" as OscillatorType };

  master.gain.value = 0.72;
  drone.type = settings.color;
  drone.frequency.value = settings.drone;
  droneGain.gain.value = 0.018;
  pulse.type = "sine";
  pulse.frequency.value = settings.pulse;
  pulseGain.gain.value = settings.depth;
  pulse.connect(pulseGain);
  pulseGain.connect(master);
  drone.connect(droneGain);
  droneGain.connect(master);
  master.connect(context.destination);
  pulse.start(now);
  drone.start(now);

  const lfo = context.createOscillator();
  const lfoGain = context.createGain();
  lfo.type = "sine";
  lfo.frequency.value = chapter === 9 ? 0.18 : chapter === 8 ? 0.11 : 0.08;
  lfoGain.gain.value = settings.depth * 0.45;
  lfo.connect(lfoGain);
  lfoGain.connect(pulseGain.gain);
  lfo.start(now);

  return () => {
    [pulse, drone, lfo].forEach((source) => {
      try {
        source.stop();
      } catch {
        // O oscilador já pode ter sido encerrado pelo navegador.
      }
      source.disconnect();
    });
    [pulseGain, droneGain, lfoGain, master].forEach((node) => node.disconnect());
  };
}
