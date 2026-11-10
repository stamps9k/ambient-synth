import { SynthEngine } from "./public/SynthEngine";
import { SynthParams } from "./public/types/SynthParams";

/**
 * A simple function to check that the library is accessible and working. This can be called from the website to check that the library has been successfully compiled and is ready for use.
 *
 * @returns A string saying everything is ready
 */
export function hello_sound(): string {
  return "Sound library compiled.";
}

/**
 * Initialize the system in preparation of use. Creates the SynthEngine and applies the given parameters.
 *
 * @param params - A set of parameters for the synth. A complete list of parameters is not required, any missing parameters will be filled in with defaults.
 *
 * @returns A SynthEngine instance, which can be used to control the synth. Note that the synth will not start producing sound until the start method is called on the SynthEngine instance.
 */
export function init(params?: Partial<SynthParams>): SynthEngine {
  return SynthEngine.init(params);
}

// #region --- Export items for use by library users ---------------------------

export { SynthParams } from "./public/types/SynthParams";
export { SynthEngine } from "./public/SynthEngine";

// #endregion ------------------------------------------------------------------
