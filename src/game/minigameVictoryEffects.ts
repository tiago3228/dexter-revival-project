export function playMinigameVictorySound(): void {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined") return;

  let context: AudioContext;
  try {
    context = new window.AudioContext();
    const startAt = context.currentTime;
    const notes = [
      { frequency: 523.25, delay: 0 },
      { frequency: 659.25, delay: 0.11 },
      { frequency: 783.99, delay: 0.22 },
    ];

    notes.forEach(({ frequency, delay }, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const noteStart = startAt + delay;
      const noteEnd = noteStart + 0.42;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.075, noteStart + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteEnd);

      if (index === notes.length - 1) {
        oscillator.addEventListener("ended", () => {
          void context.close().catch(() => undefined);
        });
      }
    });

    void context.resume().catch(() => undefined);
  } catch {
    // O jogo continua normalmente se áudio estiver bloqueado ou indisponível.
  }
}
