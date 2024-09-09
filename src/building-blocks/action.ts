import { AutomationSequenceEvent } from "@types";
import { LegoClient, EventBus } from "@core";

export class Action<I, O> {
  public constructor(
    public readonly name: string,
    private callback:
      | ((client: LegoClient, input: I) => O)
      | ((client: LegoClient, input: I) => Promise<O>)
  ) {}

  public async execute(
    client: LegoClient,
    events: EventBus,
    input: I,
    parent?: AutomationSequenceEvent<unknown, unknown>
  ): Promise<{ output: O | undefined; success: boolean }> {
    try {
      events.emit({
        type: "action",
        status: "started",
        action: this,
        parent,
      });

      const callbackResult = this.callback(client, input);
      const result =
        callbackResult instanceof Promise
          ? await callbackResult
          : callbackResult;

      events.emit({
        type: "action",
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