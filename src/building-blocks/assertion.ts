import { AutomationSequenceEvent } from "@types";
import { LegoClient, EventBus } from "@core";
import { Block } from "./block.ts";

interface AssertionPredicate<I, O> {
  (client: LegoClient): { result: boolean; output: O } | boolean;
  (client: LegoClient): Promise<{ result: boolean; output: O } | boolean>;
}

interface AssertionConfig<I, O> {
  readonly name: string;
  readonly predicate: (
    client: LegoClient
  ) =>
    | boolean
    | { result: boolean; output: O }
    | Promise<{ result: boolean; output: O }>;
}

/**
 * @alpha
 */
export class Assertion<I = void, O = void> extends Block<I, O> {
  public constructor(private config: AssertionConfig<I, O>) {
    super();
  }

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

    const callbackResult = this.config.predicate(client);
    const result =
      callbackResult instanceof Promise ? await callbackResult : callbackResult;

    const finalResult =
      typeof result === "object" ? result : { result, output: undefined as O };

    events.emit({
      type: "assertion",
      status: "finished",
      assertion: this,
      result: finalResult,
      parent,
    });

    return finalResult;
  }
}

const ass = new Assertion({ name: "test", predicate: (client) => true });
