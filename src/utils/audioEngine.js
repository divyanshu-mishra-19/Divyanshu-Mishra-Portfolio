// ============================================================================
// AUDIO ENGINE: Real Playback + Web Audio Procedural Nature & Indian Soundscapes
// ============================================================================

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.currentMode = null; // 'file' | 'synth'
    this.audioElement = null;
    this.synthNodes = [];
    this.isPlaying = false;
    this.volume = 0.8;
    this.currentTime = 0;
    this.duration = 180;
    this.timer = null;
    this.listeners = {
      timeUpdate: [],
      stateChange: [],
      ended: []
    };
  }

  // Ensure AudioContext is initialized on user interaction
  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a track: either via HTML5 Audio file or procedural Web Audio synth
  async playTrack(track) {
    this.initContext();
    this.stop();

    this.currentTrack = track;
    this.duration = track.durationSec || 210;
    this.currentTime = 0;

    // Check if this track uses a real audio file URL (e.g. /audio/my-song.mp3 or https://...)
    if (track.fileUrl && !track.useSynth) {
      try {
        await this.playAudioFile(track.fileUrl);
        return;
      } catch (err) {
        // Fall back to procedural audio synthesis and notify listeners
        this.emit('playbackError', { track, message: err?.message || 'File audio unavailable, switching to procedural soundscape' });
      }
    }

    // Otherwise, play via procedural Web Audio synthesizer
    this.playProceduralSynth(track.synthType || 'monsoon-rain');
  }

  // -------------------------------------------------------------
  // HTML5 Audio File Playback (for MP3s, uploaded files, local audio)
  // -------------------------------------------------------------
  playAudioFile(url) {
    return new Promise((resolve, reject) => {
      this.currentMode = 'file';
      if (!this.audioElement) {
        this.audioElement = new Audio();
      }

      this.audioElement.src = url;
      this.audioElement.volume = this.volume;
      this.audioElement.loop = true;

      this.audioElement.onloadedmetadata = () => {
        if (this.audioElement.duration && !isNaN(this.audioElement.duration)) {
          this.duration = this.audioElement.duration;
        }
      };

      this.audioElement.ontimeupdate = () => {
        this.currentTime = this.audioElement.currentTime;
        this.emit('timeUpdate', { currentTime: this.currentTime, duration: this.duration });
      };

      this.audioElement.onended = () => {
        this.emit('ended');
      };

      this.audioElement.play()
        .then(() => {
          this.isPlaying = true;
          this.emit('stateChange', { isPlaying: true });
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  // -------------------------------------------------------------
  // PROCEDURAL WEB AUDIO SYNTHESIZERS (Rain, Forest, Tanpura, Flute, Lo-Fi)
  // -------------------------------------------------------------
  playProceduralSynth(type) {
    this.currentMode = 'synth';
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.clearSynthNodes();

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    masterGain.connect(this.ctx.destination);
    this.synthNodes.push(masterGain);
    this.masterGainNode = masterGain;

    if (type === 'monsoon-rain') {
      this.buildMonsoonRain(masterGain);
    } else if (type === 'forest-river') {
      this.buildForestRiver(masterGain);
    } else if (type === 'ocean-waves') {
      this.buildOceanWaves(masterGain);
    } else if (type === 'hindi-tanpura') {
      this.buildHindiTanpura(masterGain);
    } else if (type === 'hindi-acoustic') {
      this.buildHindiAcoustic(masterGain);
    } else if (type === 'deep-focus-brown') {
      this.buildBrownNoise(masterGain);
    } else {
      this.buildMonsoonRain(masterGain);
    }

    // Start synthetic time ticker
    this.startSynthTicker();
    this.emit('stateChange', { isPlaying: true });
  }

  // 1. Gentle Monsoon Rain with Distant Rolling Thunder
  buildMonsoonRain(output) {
    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const outputData = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    // Pink noise generation
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      outputData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    // Lowpass filter for warm soothing rain
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1400, this.ctx.currentTime);

    // Highpass to eliminate harsh low rumble
    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(250, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    rainSource.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(rainGain);
    rainGain.connect(output);

    rainSource.start();
    this.synthNodes.push(rainSource, lowpass, highpass, rainGain);

    // Periodic gentle water droplet generator
    const dropletInterval = setInterval(() => {
      if (!this.isPlaying || this.currentMode !== 'synth') {
        clearInterval(dropletInterval);
        return;
      }
      try {
        const osc = this.ctx.createOscillator();
        const dropGain = this.ctx.createGain();
        const now = this.ctx.currentTime;
        const startFreq = 1200 + Math.random() * 800;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

        dropGain.gain.setValueAtTime(0.04 + Math.random() * 0.03, now);
        dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(dropGain);
        dropGain.connect(output);

        osc.start(now);
        osc.stop(now + 0.09);
      } catch (e) {
        // Ignore inactive context errors
      }
    }, 380);

    this.synthIntervals = this.synthIntervals || [];
    this.synthIntervals.push(dropletInterval);
  }

  // 2. Himalayan Forest River & Gentle Breeze
  buildForestRiver(output) {
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const left = noiseBuffer.getChannelData(0);
    const right = noiseBuffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      left[i] = (Math.random() * 2 - 1) * 0.2;
      right[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const waterSource = this.ctx.createBufferSource();
    waterSource.buffer = noiseBuffer;
    waterSource.loop = true;

    // Resonant bandpass filter that simulates stream babbling
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(800, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(1.8, this.ctx.currentTime);

    // LFO to modulate stream flow gently
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.25, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(350, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    const riverGain = this.ctx.createGain();
    riverGain.gain.setValueAtTime(0.65, this.ctx.currentTime);

    waterSource.connect(bandpass);
    bandpass.connect(riverGain);
    riverGain.connect(output);

    waterSource.start();
    lfo.start();
    this.synthNodes.push(waterSource, bandpass, lfo, lfoGain, riverGain);
  }

  // 3. Deep Midnight Ocean Waves
  buildOceanWaves(output) {
    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.25;
    }

    const waveSource = this.ctx.createBufferSource();
    waveSource.buffer = noiseBuffer;
    waveSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    // Wave swell LFO
    const swellLfo = this.ctx.createOscillator();
    swellLfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec ocean swell
    const swellGain = this.ctx.createGain();
    swellGain.gain.setValueAtTime(500, this.ctx.currentTime);

    swellLfo.connect(swellGain);
    swellGain.connect(filter.frequency);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.65, this.ctx.currentTime);

    waveSource.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(output);

    waveSource.start();
    swellLfo.start();
    this.synthNodes.push(waveSource, filter, swellLfo, swellGain, waveGain);
  }

  // 4. Authentic Indian Tanpura Drone & Bansuri Bamboo Flute (Raag Bhairavi / Desh)
  buildHindiTanpura(output) {
    // Tanpura string root frequencies (Sa & Pa tuning: C#3 ~ 138.59Hz, G#3 ~ 207.65Hz, C#4 ~ 277.18Hz)
    const pitches = [138.59, 207.65, 277.18, 138.59 * 2];
    const tanpuraGroupGain = this.ctx.createGain();
    tanpuraGroupGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
    tanpuraGroupGain.connect(output);

    pitches.forEach((freq, idx) => {
      // Warm rich saw + triangle blend for acoustic wooden harmonic resonance
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const stringGain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      // Subtle detune creating the authentic shimmering Tanpura "Javari" buzz
      osc1.frequency.setValueAtTime(freq - 0.75, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(freq + 0.75, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100 + (idx * 200), this.ctx.currentTime);
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

      // Slow rhythmic pluck amplitude envelope
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.18 + (idx * 0.04), this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

      stringGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(stringGain.gain);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(stringGain);
      stringGain.connect(tanpuraGroupGain);

      osc1.start();
      osc2.start();
      lfo.start();
      this.synthNodes.push(osc1, osc2, filter, lfo, lfoGain, stringGain);
    });

    // Melodic Bansuri Flute gentle meditative motif generator
    const ragaNotes = [277.18, 311.13, 349.23, 415.30, 466.16, 554.37]; // Sa, Re, Ga, Pa, Dha, Sa (Raag Desh / Bhairavi scale)
    const fluteInterval = setInterval(() => {
      if (!this.isPlaying || this.currentMode !== 'synth') {
        clearInterval(fluteInterval);
        return;
      }
      try {
        const note = ragaNotes[Math.floor(Math.random() * ragaNotes.length)];
        const fluteOsc = this.ctx.createOscillator();
        const fluteGain = this.ctx.createGain();
        const fluteFilter = this.ctx.createBiquadFilter();

        fluteOsc.type = 'sine';
        fluteOsc.frequency.setValueAtTime(note, this.ctx.currentTime);

        // Gentle flute vibrato
        const vibrato = this.ctx.createOscillator();
        vibrato.frequency.setValueAtTime(4.8, this.ctx.currentTime);
        const vibGain = this.ctx.createGain();
        vibGain.gain.setValueAtTime(4.5, this.ctx.currentTime);
        vibrato.connect(vibGain);
        vibGain.connect(fluteOsc.frequency);

        fluteFilter.type = 'lowpass';
        fluteFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);

        const now = this.ctx.currentTime;
        fluteGain.gain.setValueAtTime(0, now);
        fluteGain.gain.linearRampToValueAtTime(0.12, now + 0.4);
        fluteGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

        fluteOsc.connect(fluteFilter);
        fluteFilter.connect(fluteGain);
        fluteGain.connect(output);

        vibrato.start(now);
        fluteOsc.start(now);
        fluteOsc.stop(now + 2.3);
        vibrato.stop(now + 2.3);
      } catch (e) {
        // Safe context cleanup
      }
    }, 2800);

    this.synthIntervals = this.synthIntervals || [];
    this.synthIntervals.push(fluteInterval);
  }

  // 5. Midnight Chai & Hindi Acoustic Lo-Fi (Warm Guitar Arpeggio + Vinyl Crackle)
  buildHindiAcoustic(output) {
    // Vinyl crackle background
    const bufferSize = this.ctx.sampleRate * 2;
    const crackleBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = crackleBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() < 0.003 ? (Math.random() * 2 - 1) * 0.15 : 0;
    }
    const crackleSource = this.ctx.createBufferSource();
    crackleSource.buffer = crackleBuffer;
    crackleSource.loop = true;
    crackleSource.connect(output);
    crackleSource.start();
    this.synthNodes.push(crackleSource);

    // Warm D-major / B-minor acoustic pentatonic chords
    const chordProgression = [
      [146.83, 220.00, 293.66, 369.99], // D maj (D, A, D, F#)
      [123.47, 185.00, 246.94, 293.66], // B min (B, F#, B, D)
      [164.81, 220.00, 261.63, 329.63], // G maj (G, B, D, G)
      [110.00, 164.81, 220.00, 277.18]  // A maj (A, E, A, C#)
    ];

    let chordIdx = 0;
    const strumInterval = setInterval(() => {
      if (!this.isPlaying || this.currentMode !== 'synth') {
        clearInterval(strumInterval);
        return;
      }
      try {
        const chord = chordProgression[chordIdx % chordProgression.length];
        chordIdx++;

        chord.forEach((freq, stringIdx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();
          const now = this.ctx.currentTime + (stringIdx * 0.06); // gentle guitar fingerpicking strum

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1400, now);
          filter.Q.setValueAtTime(1.2, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.09, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(output);

          osc.start(now);
          osc.stop(now + 1.9);
        });
      } catch (e) {
        // Safe error catch
      }
    }, 2000);

    this.synthIntervals = this.synthIntervals || [];
    this.synthIntervals.push(strumInterval);
  }

  // 6. Deep Focus Brown Noise
  buildBrownNoise(output) {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const outputData = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      outputData[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = outputData[i];
      outputData[i] *= 1.8;
    }
    const brownSource = this.ctx.createBufferSource();
    brownSource.buffer = noiseBuffer;
    brownSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.55, this.ctx.currentTime);

    brownSource.connect(filter);
    filter.connect(gain);
    gain.connect(output);

    brownSource.start();
    this.synthNodes.push(brownSource, filter, gain);
  }

  // -------------------------------------------------------------
  // CONTROLS & TIMING
  // -------------------------------------------------------------
  startSynthTicker() {
    this.stopSynthTicker();
    this.timer = setInterval(() => {
      if (this.isPlaying) {
        this.currentTime += 1;
        if (this.currentTime >= this.duration) {
          this.currentTime = 0;
        }
        this.emit('timeUpdate', { currentTime: this.currentTime, duration: this.duration });
      }
    }, 1000);
  }

  stopSynthTicker() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  pause() {
    if (this.currentMode === 'file' && this.audioElement) {
      this.audioElement.pause();
    } else if (this.currentMode === 'synth') {
      this.clearSynthNodes();
      this.stopSynthTicker();
    }
    this.isPlaying = false;
    this.emit('stateChange', { isPlaying: false });
  }

  resume() {
    this.initContext();
    if (this.currentMode === 'file' && this.audioElement) {
      this.audioElement.play()
        .then(() => {
          this.isPlaying = true;
          this.emit('stateChange', { isPlaying: true });
        })
        .catch((err) => {
          this.isPlaying = false;
          this.emit('stateChange', { isPlaying: false });
          this.emit('playbackError', { message: err?.message || 'Playback blocked by browser autoplay policy' });
        });
    } else if (this.currentTrack) {
      this.playProceduralSynth(this.currentTrack.synthType || 'monsoon-rain');
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.clearSynthNodes();
    this.stopSynthTicker();
    this.isPlaying = false;
    this.currentTime = 0;
    this.emit('stateChange', { isPlaying: false });
    this.emit('timeUpdate', { currentTime: 0, duration: this.duration });
  }

  seek(seconds) {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration));
    if (this.currentMode === 'file' && this.audioElement) {
      this.audioElement.currentTime = this.currentTime;
    }
    this.emit('timeUpdate', { currentTime: this.currentTime, duration: this.duration });
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    if (this.masterGainNode && this.ctx) {
      this.masterGainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  clearSynthNodes() {
    if (this.synthIntervals) {
      this.synthIntervals.forEach(id => clearInterval(id));
      this.synthIntervals = [];
    }
    this.synthNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // Ignore already disconnected nodes
      }
    });
    this.synthNodes = [];
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

// Global Singleton Instance
export const audioEngine = new AudioEngine();
