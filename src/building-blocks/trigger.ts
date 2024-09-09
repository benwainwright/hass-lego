import { EventBus, LegoClient } from "@core";
import { StateChanged } from "@types";

/**
 * @alpha
 */
export class Trigger<O> {
  public constructor(
    public readonly name: string,
    public readonly id: string,
    private readonly predicate?: (
      event: StateChanged,
      client: LegoClient
    ) =>
      | boolean
      | { result: boolean; output: O }
      | Promise<{ result: boolean; output: O }>
  ) {}

  public async doTrigger(
    event: StateChanged,
    client: LegoClient,
    events: EventBus
  ): Promise<{ result: boolean; output: O }> {
    const result = this.predicate?.(event, client);

    if (typeof result === "boolean") {
      return { result, output: undefined as O };
    }

    if (result instanceof Promise) {
      return await result;
    }

    if (result) {
      return result;
    }

    return { result: true, output: undefined as O };
  }
}
