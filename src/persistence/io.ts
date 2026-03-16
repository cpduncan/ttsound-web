import type { Project } from "../audio/types";
import type { ProjectDTO, TrackDTO } from "./dto";

export function toDTO(project: Project): ProjectDTO {
  const tracks: TrackDTO[] = project.tracks.map((t) => ({
    id: t.id,
    name: t.name,
    gain: t.gain,
    pan: t.pan,
    muted: t.muted,
    solo: t.solo,
    offsetSec: t.offsetSec,
  }));
  return { version: 1, masterGain: project.masterGain, tracks };
}

export function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
