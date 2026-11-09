// src/types/synth-params.ts

// ─── Enums / union types ────────────────────────────────────────────────────

export type OscillatorWaveform = "sine" | "triangle" | "sawtooth" | "square";

export type LfoTarget = "pitch" | "filter" | "amplitude";

export type LfoWaveform =
  | "sine"
  | "triangle"
  | "sawtooth"
  | "square"
  | "sample-and-hold";

export type MusicalScale =
  | "pentatonic-major"
  | "pentatonic-minor"
  | "major"
  | "minor"
  | "dorian"
  | "whole-tone";

// ─── Parameter groups ───────────────────────────────────────────────────────

export interface EnvelopeParams {
  /** Seconds to reach peak gain. Range: 0.001–4.0 */
  attack: number;
  /** Seconds to fall from peak to sustain level. Range: 0.001–4.0 */
  decay: number;
  /** Held gain level (0–1). Range: 0.0–1.0 */
  sustain: number;
  /** Seconds to fade after note off. Range: 0.01–8.0 */
  release: number;
}

export interface FilterParams {
  /** Cutoff frequency in Hz. Range: 80–18000 */
  cutoff: number;
  /** Resonance / Q factor. Range: 0.1–20.0 */
  resonance: number;
}

export interface LfoParams {
  /** Modulation cycles per second. Range: 0.01–10.0 */
  rate: number;
  /** Depth of modulation (0–1). Range: 0.0–1.0 */
  depth: number;
  /** Which parameter the LFO drives */
  target: LfoTarget;
  /** Shape of the LFO waveform */
  waveform: LfoWaveform;
}

export interface ReverbParams {
  /** Dry/wet mix (0 = dry, 1 = fully wet). Range: 0.0–1.0 */
  mix: number;
  /** Simulated room size (0–1). Range: 0.0–1.0 */
  size: number;
}

export interface DelayParams {
  /** Delay time in seconds. Range: 0.05–2.0 */
  time: number;
  /** Feedback amount (0–1, keep below 0.9). Range: 0.0–0.9 */
  feedback: number;
  /** Dry/wet mix (0–1). Range: 0.0–1.0 */
  mix: number;
}

export interface TimbreParams {
  /** Primary oscillator waveform */
  waveform: OscillatorWaveform;
  /** Number of harmonic overtones layered above fundamental. Range: 0–8 */
  harmonicContent: number;
  /** Blend of noise into the signal (0–1). Range: 0.0–1.0 */
  noiseFloor: number;
}

export interface SchedulerParams {
  /** Average notes per beat. Range: 0.1–4.0 */
  noteDensity: number;
  /** Note duration as a fraction of a beat. Range: 0.05–2.0 */
  noteLength: number;
  /** Max timing offset in ms either side of the grid. Range: 0–80 */
  timingHumanise: number;
  /** Beats before the phrase pattern resets. Range: 2–64 */
  phraseLength: number;
}

export interface PitchParams {
  /** Scale to constrain note selection to */
  scale: MusicalScale;
  /** Number of octaves notes can span. Range: 1–4 */
  octaveRange: number;
  /** Max simultaneous notes per event. Range: 1–4 */
  chordDensity: number;
  /** Max pitch drift on sustained notes, in cents. Range: 0–50 */
  pitchDrift: number;
}

export interface DynamicsParams {
  /** Per-note volume randomisation (0–1). Range: 0.0–1.0 */
  velocityVariance: number;
  /** Per-note gain micro-variation (0–1). Range: 0.0–1.0 */
  gainJitter: number;
  /** Master output gain (0–1). Range: 0.0–1.0 */
  masterGain: number;
}

export interface SpatialParams {
  /** Stereo spread (0 = mono, 1 = full stereo). Range: 0.0–1.0 */
  stereoWidth: number;
}

// ─── Root params type ───────────────────────────────────────────────────────

export interface SynthParams {
  envelope: EnvelopeParams;
  filter: FilterParams;
  lfo: LfoParams;
  reverb: ReverbParams;
  delay: DelayParams;
  timbre: TimbreParams;
  scheduler: SchedulerParams;
  pitch: PitchParams;
  dynamics: DynamicsParams;
  spatial: SpatialParams;
}

// ─── Style definition ───────────────────────────────────────────────────────

/** A named anchor point in parameter space that styles are defined as */
export interface SynthStyle {
  name: string;
  params: SynthParams;
}

// ─── Defaults ───────────────────────────────────────────────────────────────

export const DEFAULT_PARAMS: SynthParams = {
  envelope: {
    attack: 0.8,
    decay: 0.5,
    sustain: 0.6,
    release: 1.5,
  },
  filter: {
    cutoff: 3000,
    resonance: 1.0,
  },
  lfo: {
    rate: 0.3,
    depth: 0.15,
    target: "filter",
    waveform: "sine",
  },
  reverb: {
    mix: 0.4,
    size: 0.5,
  },
  delay: {
    time: 0.4,
    feedback: 0.3,
    mix: 0.2,
  },
  timbre: {
    waveform: "triangle",
    harmonicContent: 2,
    noiseFloor: 0.02,
  },
  scheduler: {
    noteDensity: 0.5,
    noteLength: 0.6,
    timingHumanise: 20,
    phraseLength: 8,
  },
  pitch: {
    scale: "pentatonic-major",
    octaveRange: 2,
    chordDensity: 1,
    pitchDrift: 10,
  },
  dynamics: {
    velocityVariance: 0.2,
    gainJitter: 0.05,
    masterGain: 0.7,
  },
  spatial: {
    stereoWidth: 0.5,
  },
};
