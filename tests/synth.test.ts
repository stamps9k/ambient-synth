import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SynthEngine } from "../src/public/SynthEngine";
import { DEFAULT_PARAMS, SynthParams } from "../src/public/types/SynthParams";

// Minimal Web Audio stand-in: records the master gain and tracks state.
class FakeAudioContext {
  static created = 0;
  state: "running" | "suspended" = "running";
  currentTime = 0;
  destination = {};
  gains: { gain: { setValueAtTime: ReturnType<typeof vi.fn> } }[] = [];
  constructor() {
    FakeAudioContext.created++;
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention -- Web Audio API name
  createGain() {
    const node = { gain: { setValueAtTime: vi.fn() }, connect: vi.fn() };
    this.gains.push(node);
    return node;
  }
  async suspend() {
    this.state = "suspended";
  }
  async resume() {
    this.state = "running";
  }
}

// params and ctx are private; tests read them through this view.
type Internals = {
  params: SynthParams;
  ctx: FakeAudioContext;
  running: boolean;
};
const internals = (engine: SynthEngine) => engine as unknown as Internals;

const PRISTINE_DEFAULTS = structuredClone(DEFAULT_PARAMS);

beforeEach(() => {
  FakeAudioContext.created = 0;
  vi.stubGlobal("AudioContext", FakeAudioContext);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("DEFAULT_PARAMS", () => {
  // Documented ranges from SynthParams.ts.
  const ranges: [string, number, number, number][] = [
    ["envelope.attack", DEFAULT_PARAMS.envelope.attack, 0.001, 4],
    ["envelope.decay", DEFAULT_PARAMS.envelope.decay, 0.001, 4],
    ["envelope.sustain", DEFAULT_PARAMS.envelope.sustain, 0, 1],
    ["envelope.release", DEFAULT_PARAMS.envelope.release, 0.01, 8],
    ["filter.cutoff", DEFAULT_PARAMS.filter.cutoff, 80, 18000],
    ["filter.resonance", DEFAULT_PARAMS.filter.resonance, 0.1, 20],
    ["lfo.rate", DEFAULT_PARAMS.lfo.rate, 0.01, 10],
    ["lfo.depth", DEFAULT_PARAMS.lfo.depth, 0, 1],
    ["reverb.mix", DEFAULT_PARAMS.reverb.mix, 0, 1],
    ["reverb.size", DEFAULT_PARAMS.reverb.size, 0, 1],
    ["delay.time", DEFAULT_PARAMS.delay.time, 0.05, 2],
    ["delay.feedback", DEFAULT_PARAMS.delay.feedback, 0, 0.9],
    ["delay.mix", DEFAULT_PARAMS.delay.mix, 0, 1],
    ["timbre.harmonicContent", DEFAULT_PARAMS.timbre.harmonicContent, 0, 8],
    ["timbre.noiseFloor", DEFAULT_PARAMS.timbre.noiseFloor, 0, 1],
    ["scheduler.noteDensity", DEFAULT_PARAMS.scheduler.noteDensity, 0.1, 4],
    ["scheduler.noteLength", DEFAULT_PARAMS.scheduler.noteLength, 0.05, 2],
    [
      "scheduler.timingHumanise",
      DEFAULT_PARAMS.scheduler.timingHumanise,
      0,
      80,
    ],
    ["scheduler.phraseLength", DEFAULT_PARAMS.scheduler.phraseLength, 2, 64],
    ["pitch.octaveRange", DEFAULT_PARAMS.pitch.octaveRange, 1, 4],
    ["pitch.chordDensity", DEFAULT_PARAMS.pitch.chordDensity, 1, 4],
    ["pitch.pitchDrift", DEFAULT_PARAMS.pitch.pitchDrift, 0, 50],
    [
      "dynamics.velocityVariance",
      DEFAULT_PARAMS.dynamics.velocityVariance,
      0,
      1,
    ],
    ["dynamics.gainJitter", DEFAULT_PARAMS.dynamics.gainJitter, 0, 1],
    ["dynamics.masterGain", DEFAULT_PARAMS.dynamics.masterGain, 0, 1],
    ["spatial.stereoWidth", DEFAULT_PARAMS.spatial.stereoWidth, 0, 1],
  ];

  it.each(ranges)("%s is within its documented range", (_, value, min, max) => {
    expect(value).toBeGreaterThanOrEqual(min);
    expect(value).toBeLessThanOrEqual(max);
  });
});

describe("SynthEngine params", () => {
  it("starts from the defaults when no params are given", () => {
    expect(internals(SynthEngine.init()).params).toEqual(PRISTINE_DEFAULTS);
  });

  it("merges partial params over the defaults, group by group", () => {
    const engine = SynthEngine.init({
      filter: { cutoff: 500 } as SynthParams["filter"],
    });
    const { params } = internals(engine);
    expect(params.filter.cutoff).toBe(500);
    expect(params.filter.resonance).toBe(PRISTINE_DEFAULTS.filter.resonance);
    expect(params.envelope).toEqual(PRISTINE_DEFAULTS.envelope);
  });

  it("set_params updates only the given fields", () => {
    const engine = SynthEngine.init();
    engine.set_params({ reverb: { mix: 0.9 } as SynthParams["reverb"] });
    const { params } = internals(engine);
    expect(params.reverb).toEqual({ ...PRISTINE_DEFAULTS.reverb, mix: 0.9 });
  });

  it("never modifies DEFAULT_PARAMS", () => {
    const engine = SynthEngine.init({
      dynamics: { masterGain: 0.1 } as SynthParams["dynamics"],
    });
    engine.set_params({ pitch: { scale: "dorian" } as SynthParams["pitch"] });
    expect(DEFAULT_PARAMS).toEqual(PRISTINE_DEFAULTS);
  });

  it("keeps each engine's params separate", () => {
    const a = SynthEngine.init();
    const b = SynthEngine.init();
    a.set_params({ delay: { time: 1.5 } as SynthParams["delay"] });
    expect(internals(b).params.delay.time).toBe(PRISTINE_DEFAULTS.delay.time);
  });
});

describe("SynthEngine lifecycle", () => {
  it("sets the master gain from the params on start", async () => {
    const engine = SynthEngine.init({
      dynamics: { masterGain: 0.25 } as SynthParams["dynamics"],
    });
    await engine.start();
    const ctx = internals(engine).ctx;
    expect(ctx.gains[0].gain.setValueAtTime).toHaveBeenCalledWith(0.25, 0);
    expect(internals(engine).running).toBe(true);
  });

  it("ignores a second start while running", async () => {
    const engine = SynthEngine.init();
    await engine.start();
    const created = FakeAudioContext.created;
    await engine.start();
    expect(FakeAudioContext.created).toBe(created);
  });

  it("suspends and resumes the audio context", async () => {
    const engine = SynthEngine.init();
    await engine.start();
    await engine.suspend();
    expect(internals(engine).ctx.state).toBe("suspended");
    expect(internals(engine).running).toBe(false);
    await engine.resume();
    expect(internals(engine).ctx.state).toBe("running");
    expect(internals(engine).running).toBe(true);
  });
});
