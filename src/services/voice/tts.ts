import * as Speech from 'expo-speech';

export interface SpeakOptions {
  language?: string; // BCP-47, e.g. 'en-US', 'ha' for Hausa
  rate?: number;     // 0.1–2.0, default 1.0
  pitch?: number;    // 0.5–2.0, default 1.0
  onDone?: () => void;
}

// Reads text aloud. Works fully offline via device TTS engine.
// Stops any current speech first, waits a tick, then speaks to avoid
// the Android race condition where stop() arrives after speak().
export function speak(text: string, options: SpeakOptions = {}): void {
  Speech.stop().catch(() => {});
  setTimeout(() => {
    Speech.speak(text, {
      language: options.language ?? 'en-US',
      rate: options.rate ?? 0.85,
      pitch: options.pitch ?? 1.0,
      onDone:    options.onDone,
      onStopped: options.onDone, // treat stopped as done so callers can reset state
      onError:   options.onDone,
    });
  }, 80);
}

export function stopSpeaking(): void {
  Speech.stop().catch(() => {});
}

export function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}
