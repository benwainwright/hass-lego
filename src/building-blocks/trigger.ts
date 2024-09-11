import { EventBus, LegoClient } from "@core";
import { StateChanged } from "@types";
import { Block } from "./block.ts";

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

  private async getResult(
    result?:
      | boolean
      | Promise<{ result: boolean; output: O }>
      | { result: boolean; output: O }
  ) {
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

  public async doTrigger(
    event: StateChanged,
    client: LegoClient,
    events: EventBus,
    triggerId: string,
    parent: Block<unknown, unknown>
  ): Promise<{ result: boolean; output: O }> {
    try {
      events.emit({
        type: "trigger",
        status: "started",
        trigger: this,
        parent,
        name: this.name,
        triggerId,
      });
      const result = this.predicate?.(event, client);
      const finalResult = this.getResult(result);

      events.emit({
        type: "trigger",
        status: "finished",
        trigger: this,
        parent,
        name: this.name,
        result: finalResult,
        triggerId,
      });

      return await finalResult;
    } catch (error) {
      if (error instanceof Error) {
        events.emit({
          type: "trigger",
          triggerId,
          parent,
          status: "failed",
          trigger: this,
          name: this.name,
          message: error.message,
          error,
        });
      }
      throw error;
    }
  }
}
