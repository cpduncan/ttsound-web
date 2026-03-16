import { AudioEngine } from "../audio/engine";
import type { Project } from "../audio/types";
import { toDTO, downloadJSON } from "../persistence/io";

const engine = new AudioEngine();

const state: Project = {
  sampleRate: 44100,
  durationSec: 0,
  masterGain: 1,
  tracks: [],
};

const fileInput = document.getElementById("file") as HTMLInputElement;
const btnPlay = document.getElementById("play") as HTMLButtonElement;
const btnStop = document.getElementById("stop") as HTMLButtonElement;
const btnExport = document.getElementById("export") as HTMLButtonElement;
const tracksDiv = document.getElementById("tracks")!;

fileInput.addEventListener("change", async () => {
  if (!fileInput.files) return;
  engine.init();

  for (const file of Array.from(fileInput.files)) {
    const buf = await engine.decodeFile(file);
    const track = engine.createTrack(file.name, buf);
    state.tracks.push(track);
    state.durationSec = Math.max(
      state.durationSec,
      track.offsetSec + track.buffer.duration,
    );
  }
  renderTracks();
});

btnPlay.addEventListener("click", () => engine.play(state));
btnStop.addEventListener("click", () => engine.stop());

btnExport.addEventListener("click", async () => {
  const wav = await engine.renderToWav(state);
  // download WAV
  const a = document.createElement("a");
  a.href = URL.createObjectURL(wav);
  a.download = "mix.wav";
  a.click();
  URL.revokeObjectURL(a.href);

  // also save session JSON (without audio)
  downloadJSON("session.json", toDTO(state));
});

function renderTracks() {
  tracksDiv.innerHTML = "";
  for (const t of state.tracks) {
    const row = document.createElement("div");
    row.style.margin = "0.5rem 0";
    row.innerHTML = `
      <strong>${t.name}</strong>
      <label> Gain <input type="range" min="0" max="1" step="0.01" value="${t.gain}" data-k="gain"></label>
      <label> Pan <input type="range" min="-1" max="1" step="0.01" value="${t.pan}" data-k="pan"></label>
      <label> Offset <input type="number" min="0" step="0.01" value="${t.offsetSec}" data-k="offset"></label>
      <label> Mute <input type="checkbox" ${t.muted ? "checked" : ""} data-k="muted"></label>
      <label> Solo <input type="checkbox" ${t.solo ? "checked" : ""} data-k="solo"></label>
    `;

    row.addEventListener("input", (e) => {
      const el = e.target as HTMLInputElement;
      switch (el.dataset.k) {
        case "gain":
          t.gain = Number(el.value);
          engine.setTrackGain(t.id, t.gain);
          break;
        case "pan":
          t.pan = Number(el.value);
          engine.setTrackPan(t.id, t.pan);
          break;
        case "offset":
          t.offsetSec = Number(el.value);
          break;
        case "muted":
          t.muted = el.checked;
          break;
        case "solo":
          t.solo = el.checked;
          break;
      }
      // recompute project duration for exporter
      state.durationSec = state.tracks.reduce(
        (mx, tr) => Math.max(mx, tr.offsetSec + tr.buffer.duration),
        0,
      );
    });

    tracksDiv.appendChild(row);
  }
}
