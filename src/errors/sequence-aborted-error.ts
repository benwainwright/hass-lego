import { HassLegoError } from "./hass-lego-error.ts";

/**
 * @alpha
 */
export class SequenceAbortedError extends HassLegoError {
  public constructor(name: string) {
    
    super(`Sequence '${name}' was aborted`);
  }
}
