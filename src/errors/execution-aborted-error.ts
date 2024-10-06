import { HassLegoError } from "./hass-lego-error.ts";

/**
 * @alpha
 */
export class ExecutionAbortedError extends HassLegoError {
  public constructor(name: string) {
    super(`Execution '${name}' was aborted`);
  }
}
