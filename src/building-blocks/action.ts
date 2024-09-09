import { LegoClient, EventBus } from "@core";
import { Block } from "./block.ts";

/**
 * @alpha
 *
 * Represents an action that can take place as part of a sequence of actions
 */
export class Action<I = void, O = void> extends Block<I, O> {
  public readonly name: string;
  public constructor(
    public readonly config: {
      readonly name: string;
      callback:
        | ((client: LegoClient, input: I) => O)
        | ((client: LegoClient, input: I) => Promise<O>);
    }
  ) {
    super();
    this.name = this.config.name;
  }

  public async execute(
    client: LegoClient,
    events: EventBus,
    input: I,
    parent?: Block<unknown, unknown>
  ): Promise<{ output: O | undefined; success: boolean }> {
    try {
      events.emit({
        type: "action",
        status: "started",
        name: this.name,
        action: this,
        parent,
      });

      const callbackResult = this.config.callback(client, input);
      const result =
        callbackResult instanceof Promise
          ? await callbackResult
          : callbackResult;

      events.emit({
        type: "action",
        name: this.name,
        status: "finished",
        action: this,
        result,
        parent,
      });
      return { output: result, success: true };
    } catch (error) {
      if (error instanceof Error) {
        events.emit({
          type: "action",
          status: "failed",
          action: this,
          name: this.name,
          error,
          parent,
          message: error.message,
        });
        return { output: undefined, success: false };
      } else {
        throw error;
      }
    }
  }
}
