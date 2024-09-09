import { LegoClient, EventBus } from "@core";
import { Block } from "./block.ts";

/**
 * @alpha
 *
 * Configuration for an assertion object
 */
export interface AssertionConfig<I, O> {
  readonly name: string;
  readonly predicate: (
    client: LegoClient,
    input?: I
  ) =>
    | boolean
    | { result: boolean; output: O }
    | Promise<{ result: boolean; output: O }>;
}

/**
 * @alpha
 *
 * Given a predicate, decide whether or not to continue executing an automation
 */
export class Assertion<I = void, O = void> extends Block<I, O> {
  public constructor(public config: AssertionConfig<I, O>) {
    super();
    this.name = this.config.name;
  }
  public readonly name: string;

  public async runPredicate(
    client: LegoClient,
    events: EventBus,
    input: I,
    parent?: Block<unknown, unknown>
  ): Promise<{ result: boolean; output: O }> {
    events.emit({
      type: "assertion",
      status: "started",
      assertion: this,
      name: this.config.name,
      parent,
    });

    const callbackResult = this.config.predicate(client, input);
    const result =
      callbackResult instanceof Promise ? await callbackResult : callbackResult;

    const finalResult =
      typeof result === "object" ? result : { result, output: undefined as O };

    events.emit({
      type: "assertion",
      status: "finished",
      name: this.config.name,
      assertion: this,
      result: finalResult,
      parent,
    });

    return finalResult;
  }
}
