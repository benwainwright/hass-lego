import { AutomationSequenceEvent } from "@types";
import { LegoClient, EventBus } from "@core";

export class Assertion<I, O> {
  public constructor(
    public readonly name: string,
    private readonly predicate:
      | ((client: LegoClient) => { result: boolean; output: O })
      | ((client: LegoClient) => Promise<{ result: boolean; output: O }>)
  ) {}

  public async runPredicate(
    client: LegoClient,
    events: EventBus,
    input: I,
    parent?: AutomationSequenceEvent<unknown, unknown>
  ): Promise<{ result: boolean; output: O }> {
    events.emit({
      type: "assertion",
      status: "started",
      assertion: this,
      parent,
    });

    const callbackResult = this.predicate(client);
    const result =
      callbackResult instanceof Promise ? await callbackResult : callbackResult;

    events.emit({
      type: "assertion",
      status: "finished",
      assertion: this,
      result,
      parent,
    });

    return result;
  }
}
