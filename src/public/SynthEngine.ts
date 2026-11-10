import { SynthParams } from "./types/SynthParams";
import { DEFAULT_PARAMS } from "./types/SynthParams";

export class SynthEngine {
  private ctx: AudioContext;
  private master_gain: GainNode;
  private params: SynthParams;
  private running: boolean;

  // Private constructor — always fully initialised, no nulls
  private constructor(
    ctx: AudioContext,
    master_gain: GainNode,
    params: Partial<SynthParams>,
  ) {
    this.ctx = ctx;
    this.master_gain = master_gain;
    // A copy, so merging never changes the shared defaults or another engine.
    this.params = structuredClone(DEFAULT_PARAMS);
    this.merge_params(params);
    this.running = false;
  }

  // The only way to create an instance — called from a user gesture
  public static init(params?: Partial<SynthParams>): SynthEngine {
    const ctx = new AudioContext();
    const master_gain = ctx.createGain();
    master_gain.connect(ctx.destination);

    if (params) {
      return new SynthEngine(ctx, master_gain, params);
    } else {
      return new SynthEngine(ctx, master_gain, DEFAULT_PARAMS);
    }
  }

  public async start(params?: Partial<SynthParams>): Promise<void> {
    if (this.running) return;

    this.ctx = new AudioContext();
    this.master_gain = this.ctx.createGain();
    this.master_gain.gain.setValueAtTime(
      this.params.dynamics.masterGain,
      this.ctx.currentTime,
    );
    this.master_gain.connect(this.ctx.destination);

    if (params) {
      this.set_params(params);
    }
    this.running = true;
  }

  public async suspend(): Promise<void> {
    if (this.ctx?.state === "running") {
      await this.ctx.suspend();
      this.running = false;
    }
  }

  public async resume(): Promise<void> {
    if (this.ctx?.state === "suspended") {
      await this.ctx.resume();
      this.running = true;
    }
  }

  // The user-facing setter — single entry point
  set_params(partial: Partial<SynthParams>): void {
    this.merge_params(partial);
  }

  // Connects internal nodes to the output chain
  connect(node: AudioNode): void {}

  private merge_params(partial: Partial<SynthParams>) {
    this.params.envelope = { ...this.params.envelope, ...partial.envelope };
    this.params.filter = { ...this.params.filter, ...partial.filter };
    this.params.lfo = { ...this.params.lfo, ...partial.lfo };
    this.params.reverb = { ...this.params.reverb, ...partial.reverb };
    this.params.delay = { ...this.params.delay, ...partial.delay };
    this.params.timbre = { ...this.params.timbre, ...partial.timbre };
    this.params.scheduler = { ...this.params.scheduler, ...partial.scheduler };
    this.params.pitch = { ...this.params.pitch, ...partial.pitch };
    this.params.dynamics = { ...this.params.dynamics, ...partial.dynamics };
    this.params.spatial = { ...this.params.spatial, ...partial.spatial };
  }
}
