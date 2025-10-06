export type AudioEvent = { type: 'play_sound'; id?: string; ts: number };

export interface AudioSink {
  play(id?: string): void;
  events: AudioEvent[];
}

export function createMemoryAudioSink(): AudioSink {
  return {
    events: [],
    play(id?: string) {
      this.events.push({ type: 'play_sound', id, ts: Date.now() });
    },
  };
}

