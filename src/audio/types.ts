export type TrackId = string;

export interface Track {
  id: TrackId;
  name: string;
  buffer: AudioBuffer;
  gain: number; // 0..1
  pan: number; // -1..1
  muted: boolean;
  solo: boolean;
  offsetSec: number; // start offset in the timeline
}

export interface Project {
  sampleRate: number;
  durationSec: number; // computed from longest track
  tracks: Track[];
  masterGain: number; // 0..1
}
