export interface TrackDTO {
  id: string;
  name: string;
  gain: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  offsetSec: number;
  // Not storing raw audio in JSON; user re-loads files or we add "asset references" later
}

export interface ProjectDTO {
  version: 1;
  masterGain: number;
  tracks: TrackDTO[];
  // Add future fields as needed (tempo, markers, etc.)
}
