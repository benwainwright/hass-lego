import { HassLegoError } from "./hass-lego-error.ts";

export class AssertionError extends HassLegoError {
  public constructor(details: string) {
    super(details);
  }
}
