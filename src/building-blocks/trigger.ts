import { EventBus } from "@core";
import { StateChanged } from "@types";

/**
 * @alpha
 */
export class Trigger {
  public constructor(
    public readonly name: string,
    public readonly id: string,
    public readonly predicate?: (event: StateChanged) => boolean
  ) {}

  public doTrigger(event: StateChanged, events: EventBus): boolean {
    return this.predicate ? this.predicate(event) : true;
  }
}
