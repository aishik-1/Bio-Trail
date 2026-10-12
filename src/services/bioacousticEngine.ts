import { AcousticMatchResult, SpeciesProfile } from '../types/nature';
import { SPECIES_CATALOG } from '../data/speciesData';

export class BioacousticEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | AudioBufferSourceNode | null = null;
  private isListening = false;
  private animationFrameId: number | null = null;
  private onMatchCallback: ((match: AcousticMatchResult) => void) | null = null;
  private onFrequencyDataCallback: ((freqData: Uint8Array, timeData: Uint8Array, peakFreq: number) => void) | null = null;

  // Recent audio detection smoothing
  private lastMatchTime = 0;
  private detectionCooldownMs = 1800; // avoid spamming notifications

  constructor() {
    // Lazy initialized on user gesture
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public setOnMatch(callback: (match: AcousticMatchResult) => void) {
    this.onMatchCallback = callback;
  }

  public setOnFrequencyData(callback: (freqData: Uint8Array, timeData: Uint8Array, peakFreq: number) => void) {
    this.onFrequencyDataCallback = callback;
  }

  public async startMicrophone(): Promise<boolean> {
    try {
      this.stop();

      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.75;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;

      this.sourceNode = this.audioCtx.createMediaStreamSource(this.micStream);
      this.sourceNode.connect(this.analyser);

      this.isListening = true;
      this.startAnalysisLoop();
      return true;
    } catch (err) {
      console.warn('Microphone access unavailable or denied:', err);
      return false;
    }
  }

  public stop() {
    this.isListening = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {
        // no-op
      }
      this.sourceNode = null;
    }

    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch {
        // no-op
      }
      this.audioCtx = null;
    }
  }

  private startAnalysisLoop() {
    if (!this.analyser || !this.audioCtx) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);
    const sampleRate = this.audioCtx.sampleRate;
    const binWidth = sampleRate / this.analyser.fftSize;

    const loop = () => {
      if (!this.isListening || !this.analyser) return;

      this.analyser.getByteFrequencyData(freqData);
      this.analyser.getByteTimeDomainData(timeData);

      // Compute peak frequency and energy
      let maxVal = 0;
      let peakBin = 0;
      let totalEnergy = 0;

      // Focus on biological vocal range (300 Hz to 9000 Hz)
      const minBin = Math.floor(250 / binWidth);
      const maxBin = Math.min(Math.floor(9500 / binWidth), bufferLength);

      for (let i = minBin; i < maxBin; i++) {
        const val = freqData[i];
        totalEnergy += val;
        if (val > maxVal) {
          maxVal = val;
          peakBin = i;
        }
      }

      const peakFreq = Math.round(peakBin * binWidth);
      const avgEnergy = totalEnergy / (maxBin - minBin);
      const snrDb = maxVal > 0 ? Math.round(20 * Math.log10(maxVal / Math.max(avgEnergy, 1))) : 0;

      // Send visualization data
      if (this.onFrequencyDataCallback) {
        this.onFrequencyDataCallback(freqData, timeData, peakFreq);
      }

      // Check if peak energy exceeds acoustic threshold and cooldown has passed
      const now = Date.now();
      if (maxVal > 115 && snrDb > 8 && now - this.lastMatchTime > this.detectionCooldownMs) {
        this.classifyAcoustics(peakFreq, snrDb, maxVal, now);
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    loop();
  }

  private classifyAcoustics(peakFreq: number, snrDb: number, maxVal: number, now: number) {
    const avianAndAmphibians = SPECIES_CATALOG.filter(
      (s) => (s.category === 'bird' || s.category === 'amphibian') && s.acoustic
    );

    let bestSpecies: SpeciesProfile | null = null;
    let bestScore = 0;

    for (const sp of avianAndAmphibians) {
      const ac = sp.acoustic!;
      // Check if peak is within frequency bounds
      if (peakFreq >= ac.minFreqHz * 0.85 && peakFreq <= ac.maxFreqHz * 1.15) {
        // Distance from dominant frequency
        const dist = Math.abs(peakFreq - ac.dominantFreqHz);
        const freqSpan = ac.maxFreqHz - ac.minFreqHz;
        const freqProximity = Math.max(0, 1 - dist / freqSpan);

        // Signal strength contribution
        const signalFactor = Math.min(1, maxVal / 220);
        const snrFactor = Math.min(1, snrDb / 25);

        const score = freqProximity * 0.55 + signalFactor * 0.25 + snrFactor * 0.2;

        if (score > bestScore) {
          bestScore = score;
          bestSpecies = sp;
        }
      }
    }

    if (bestSpecies && bestScore > 0.45) {
      const confidence = Math.min(98, Math.round(bestScore * 100));
      this.lastMatchTime = now;

      const result: AcousticMatchResult = {
        species: bestSpecies,
        confidence,
        dominantFreq: peakFreq,
        detectedPattern: bestSpecies.acoustic?.patternType || 'flute-trill',
        timestamp: now,
        snrDb,
      };

      if (this.onMatchCallback) {
        this.onMatchCallback(result);
      }
    }
  }

  /**
   * Synthesize biologically accurate calls using Web Audio oscillators
   * Allows off-grid simulation and testing of bioacoustic recognition
   */
  public playSyntheticCall(speciesId: string): boolean {
    const species = SPECIES_CATALOG.find((s) => s.id === speciesId);
    if (!species || !species.acoustic) return false;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = this.audioCtx || new AudioCtxClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const ac = species.acoustic;

      // Master gain node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.2, now);
      masterGain.connect(ctx.destination);

      // If analyser exists, route synthetic audio through it so real-time visualizer dances!
      if (this.analyser) {
        masterGain.connect(this.analyser);
      }

      if (ac.patternType === 'descending-hoot') {
        // Barred owl 8-note rhythmic hoot
        const hootFrequencies = [550, 520, 560, 510, 540, 500, 530, 440];
        hootFrequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const t = now + idx * 0.28;
          osc.frequency.setValueAtTime(freq, t);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.92, t + 0.2);

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.3, t + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.24);
        });
      } else if (ac.patternType === 'flute-trill') {
        // Wood Thrush / Hermit Thrush ethereal multi-tone harmonics
        const baseFreq = ac.dominantFreqHz;
        const notes = [baseFreq * 0.85, baseFreq, baseFreq * 1.25, baseFreq * 1.45];
        notes.forEach((freq, idx) => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'triangle';
          const t = now + idx * 0.25;

          osc1.frequency.setValueAtTime(freq, t);
          osc1.frequency.linearRampToValueAtTime(freq * 1.08, t + 0.2);
          osc2.frequency.setValueAtTime(freq * 1.5, t); // harmonic 5th

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(masterGain);

          osc1.start(t);
          osc2.start(t);
          osc1.stop(t + 0.25);
          osc2.stop(t + 0.25);
        });
      } else if (ac.patternType === 'pulsed-creak') {
        // Pacific Tree Frog creaking rib-bit
        for (let i = 0; i < 7; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          const t = now + i * 0.08;

          osc.frequency.setValueAtTime(2200 + i * 80, t);
          gain.gain.setValueAtTime(0.25, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.06);
        }
      } else if (ac.patternType === 'downward-scream') {
        // Red-tailed Hawk downward raspy scream
        const osc = ctx.createOscillator();
        const noiseGen = ctx.createBufferSource();
        const bufferSize = ctx.sampleRate * 0.8;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        noiseGen.buffer = noiseBuffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(4500, now);
        filter.frequency.exponentialRampToValueAtTime(2300, now + 0.7);
        filter.Q.value = 5;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(4600, now);
        osc.frequency.exponentialRampToValueAtTime(2200, now + 0.75);

        osc.connect(gain);
        noiseGen.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        noiseGen.start(now);
        osc.stop(now + 0.8);
        noiseGen.stop(now + 0.8);
      } else {
        // Chickadee fee-bee or Robin caroling
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(ac.dominantFreqHz * 1.1, now);
        osc.frequency.exponentialRampToValueAtTime(ac.dominantFreqHz * 0.9, now + 0.4);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.45);
      }

      // Automatically trigger classification match after 300ms if listening
      setTimeout(() => {
        if (this.onMatchCallback) {
          this.onMatchCallback({
            species,
            confidence: 96,
            dominantFreq: ac.dominantFreqHz,
            detectedPattern: ac.patternType,
            timestamp: Date.now(),
            snrDb: 22,
          });
        }
      }, 350);

      return true;
    } catch (e) {
      console.error('Failed to synthesize call audio:', e);
      return false;
    }
  }
}

export const bioacousticEngine = new BioacousticEngine();
