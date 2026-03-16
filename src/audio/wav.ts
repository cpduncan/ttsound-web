export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numCh * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const ab = new ArrayBuffer(totalSize);
  const view = new DataView(ab);
  let offset = 0;

  const writeStr = (s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset++, s.charCodeAt(i));
  };
  const write16 = (v: number) => {
    view.setUint16(offset, v, true);
    offset += 2;
  };
  const write32 = (v: number) => {
    view.setUint32(offset, v, true);
    offset += 4;
  };

  // RIFF header
  writeStr("RIFF");
  write32(totalSize - 8);
  writeStr("WAVE");
  // fmt chunk
  writeStr("fmt ");
  write32(16);
  write16(1);
  write16(numCh);
  write32(sampleRate);
  write32(sampleRate * blockAlign);
  write16(blockAlign);
  write16(8 * bytesPerSample);
  // data chunk
  writeStr("data");
  write32(dataSize);

  // interleave & write samples
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numCh; ch++) channels.push(buffer.getChannelData(ch));

  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      let s = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([ab], { type: "audio/wav" });
}
