// Cinematic Web Audio Synthesizer for Top Winners Announcement
// Synthesizes dramatic fanfares, drumrolls, sub-bass drops, cheering, and sparkles
// Zero external audio files required — 100% reliable in any browser!

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.destination = null; // For MediaRecorder stream routing
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      // Create a stream destination for recording
      this.streamDestination = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.connect(this.streamDestination);

      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e);
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  getAudioStreamTrack() {
    if (this.streamDestination && this.streamDestination.stream) {
      return this.streamDestination.stream.getAudioTracks()[0];
    }
    return null;
  }

  // Dramatic Sub-Bass Drop / Impact Boom
  playBoom(intensity = 1.0) {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    // Sub sine oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140 * intensity, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.8);

    gain.gain.setValueAtTime(0.8 * intensity, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 1.25);

    // Filtered noise transient for punch
    this.playNoiseTransient(t, 0.12, 400);
  }

  playNoiseTransient(t, duration = 0.1, cutoff = 800) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  // Whoosh / Riser into reveal
  playWhoosh(duration = 1.2) {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 3.5;
    filter.frequency.setValueAtTime(180, t);
    filter.frequency.exponentialRampToValueAtTime(3200, t + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.45, t + duration * 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  // Suspense Drumroll / Tension Roll
  playDrumroll(duration = 2.0) {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const steps = 30;
    const interval = duration / steps;
    for (let i = 0; i < steps; i++) {
      const stepTime = t + i * interval;
      const vol = 0.05 + 0.35 * Math.pow(i / steps, 2);
      this.playSnareTap(stepTime, vol, 250 + (i / steps) * 200);
    }
  }

  playSnareTap(time, volume, freq) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.04);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.045);
  }

  // Sparkle / Chime shimmer
  playSparkle() {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    const notes = [1046.5, 1318.5, 1567.98, 2093.0, 2637.02]; // C6, E6, G6, C7, E7

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  // Reveal Chords for 5th, 4th, 3rd, 2nd
  playRankRevealChord(rank = 3) {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();
    this.playBoom(0.85);

    const t = this.ctx.currentTime;
    // Base chord frequencies
    let freqs = [196, 246.94, 293.66, 392]; // G major
    if (rank === 2) freqs = [220, 277.18, 329.63, 440, 554.37]; // A major
    if (rank === 3) freqs = [174.61, 220, 261.63, 349.23]; // F major
    if (rank >= 4) freqs = [164.81, 207.65, 246.94, 329.63]; // E major

    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, t);
      filter.frequency.exponentialRampToValueAtTime(2800, t + 0.2);
      filter.frequency.exponentialRampToValueAtTime(800, t + 2.2);

      gain.gain.setValueAtTime(0.12 / freqs.length, t);
      gain.gain.linearRampToValueAtTime(0.25 / freqs.length, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 2.6);
    });

    this.playSparkle();
    this.playApplause(2.5, 0.3);
  }

  // GRAND 1ST PLACE CHAMPION TRIUMPHANT FANFARE
  playChampionFanfare() {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();

    // Epic impact boom
    this.playBoom(1.4);

    const t = this.ctx.currentTime;
    // Triumphant Fanfare Arpeggio: C4, G4, C5, E5, G5, High C6!
    const fanfareNotes = [
      { f: 261.63, start: 0.00, dur: 0.28 }, // C4
      { f: 392.00, start: 0.26, dur: 0.28 }, // G4
      { f: 523.25, start: 0.52, dur: 0.35 }, // C5
      { f: 659.25, start: 0.85, dur: 0.40 }, // E5
      { f: 783.99, start: 1.20, dur: 0.60 }, // G5
      { f: 1046.50, start: 1.70, dur: 2.80 }, // C6 Grand Sustain!
      { f: 523.25, start: 1.70, dur: 2.80 }, // C5 Octave Reinforce
      { f: 659.25, start: 1.70, dur: 2.80 }  // E5 Third
    ];

    fanfareNotes.forEach(note => {
      const startTime = t + note.start;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, startTime);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(note.f * 1.004, startTime); // Rich chorus detune

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, startTime);
      filter.frequency.exponentialRampToValueAtTime(4200, startTime + 0.1);

      gain.gain.setValueAtTime(0.01, startTime);
      gain.gain.linearRampToValueAtTime(0.24, startTime + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc2.start(startTime);
      osc.stop(startTime + note.dur + 0.05);
      osc2.stop(startTime + note.dur + 0.05);
    });

    // Big crowd celebration cheer
    setTimeout(() => {
      this.playApplause(4.5, 0.6);
      this.playSparkle();
    }, 1200);
  }

  // Crowd applause / cheering simulation
  playApplause(duration = 3.0, volume = 0.4) {
    if (this.isMuted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.4);
    gain.gain.setValueAtTime(volume * 0.9, t + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }
}

export const soundEngine = new SoundEngine();
