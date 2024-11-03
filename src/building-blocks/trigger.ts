import { EventBus, LegoClient } from "@core";
import { StateChanged } from "@types";
import { Block } from "./block.ts";
import { BlockOutput } from "src/types/block-output.ts";

/**
 * @alpha
 */
export class Trigger<O> {
  public constructor(
    public readonly name: string,
    public readonly id: string,
    private readonly predicate?: (
      event: StateChanged,
      client: LegoClient,
    ) =>
      | boolean
      | { result: boolean; output: O }
      | Promise<{ result: boolean; output: O }>,
  ) {}

  private async getResult(
    result?:
      | boolean
      | Promise<{ result: boolean; output: O }>
      | { result: boolean; output: O },
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
    parent: Block<unknown, unknown>,
  ): Promise<{ result: boolean; output: O }> {
    const trigger = {
      id: this.id,
      name: this.name,
      type: "trigger",
    };
    try {
      events.emit({
        type: "trigger",
        status: "started",
        block: trigger,
        parent: parent.toJson(),
        name: this.name,
        executeId: triggerId,
        triggerId,
      });
      const result = await this.predicate?.(event, client);
      const finalResult = await this.getResult(result);

      const output: BlockOutput<O> = finalResult.result
        ? {
            outputType: "conditional",
            continue: finalResult.result,
            conditionResult: finalResult.result,
            output: finalResult.output,
          }
        : { continue: false };

      events.emit({
        type: "trigger",
        status: "finished",
        block: trigger,
        executeId: triggerId,
        parent: parent.toJson(),
        name: this.name,
        output,
        triggerId,
      });

      return finalResult;
    } catch (error) {
      if (error instanceof Error) {
        events.emit({
          type: "trigger",
          triggerId,
          parent: parent.toJson(),
          status: "failed",
          block: trigger,
          name: this.name,
          message: error.message,
          error,
          executeId: triggerId,
        });
      }
      throw error;
    }
  }
}
