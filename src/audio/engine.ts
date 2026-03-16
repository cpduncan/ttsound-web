import type { Track, Project } from "./types";

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain!: GainNode;
  private playingNodes: Map<
    string,
    { src: AudioBufferSourceNode; gain: GainNode; pan: StereoPannerNode }
  > = new Map();

  get context(): AudioContext {
    if (!this.ctx) this.init();
    return this.ctx!;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 1.0;
    this.masterGain.connect(this.context.destination);
  }

  async decodeFile(file: File): Promise<AudioBuffer> {
    const array = await file.arrayBuffer();
    return await this.context.decodeAudioData(array);
  }

  /** Create a Track from a decoded buffer */
  createTrack(name: string, buffer: AudioBuffer): Track {
    return {
      id: crypto.randomUUID(),
      name,
      buffer,
      gain: 1.0,
      pan: 0,
      muted: false,
      solo: false,
      offsetSec: 0,
    };
  }

  /** Start playback of all tracks, honoring gain/pan/mute/solo and offsets */
  play(project: Project, when: number = 0) {
    if (!this.ctx) this.init();
    if (this.ctx!.state === "suspended") this.ctx!.resume();

    // Solo logic: if any solo, mute others.
    const anySolo = project.tracks.some((t) => t.solo);
    const now = this.context.currentTime + when;

    this.stop(); // stop previous session

    for (const t of project.tracks) {
      if (anySolo && !t.solo) continue;
      if (t.muted) continue;

      const src = this.context.createBufferSource();
      src.buffer = t.buffer;

      const gain = this.context.createGain();
      gain.gain.value = t.gain;

      const pan = this.context.createStereoPanner();
      pan.pan.value = t.pan;

      src.connect(gain).connect(pan).connect(this.masterGain);

      // schedule; you can extend with per-track start/end later
      const startAt = now + Math.max(0, t.offsetSec);
      src.start(startAt);

      this.playingNodes.set(t.id, { src, gain, pan });
    }

    this.masterGain.gain.value = project.masterGain;
  }

  stop() {
    for (const { src } of this.playingNodes.values()) {
      try {
        src.stop();
      } catch {
        /* ignore if already stopped */
      }
    }
    this.playingNodes.clear();
  }

  setTrackGain(trackId: string, value: number) {
    const node = this.playingNodes.get(trackId);
    if (node) node.gain.gain.value = value;
  }

  setTrackPan(trackId: string, value: number) {
    const node = this.playingNodes.get(trackId);
    if (node) node.pan.pan.value = value;
  }

  setMasterGain(value: number) {
    this.masterGain.gain.value = value;
  }

  /** Non-realtime mixdown to WAV via OfflineAudioContext */
  async renderToWav(project: Project): Promise<Blob> {
    const sampleRate = project.sampleRate || this.context.sampleRate;
    const durationSec = project.durationSec;
    const length = Math.ceil(durationSec * sampleRate);

    const offline = new OfflineAudioContext({
      numberOfChannels: 2,
      length,
      sampleRate,
    });

    const master = offline.createGain();
    master.gain.value = project.masterGain;
    master.connect(offline.destination);

    const anySolo = project.tracks.some((t) => t.solo);

    for (const t of project.tracks) {
      if (anySolo && !t.solo) continue;
      if (t.muted) continue;

      const src = offline.createBufferSource();
      src.buffer = t.buffer;

      const gain = offline.createGain();
      gain.gain.value = t.gain;

      const pan = offline.createStereoPanner();
      pan.pan.value = t.pan;

      src.connect(gain).connect(pan).connect(master);

      const offset = Math.max(0, t.offsetSec);
      src.start(offset);
    }

    const rendered = await offline.startRendering();
    const { audioBufferToWavBlob } = await import("./wav");
    return audioBufferToWavBlob(rendered);
  }
}
