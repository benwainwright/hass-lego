import { HassLegoError } from "./hass-lego-error.ts";

/**
 * @alpha
 */
export class InitialStatesNotLoadedError extends HassLegoError {
  public constructor() {
    super("Initial states were not loaded!");
  }
}
