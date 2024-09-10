import { LegoClient, EventBus } from "@core";
import { Block } from "./block.ts";
import { BlockOutput } from "@types";

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

  protected override typeString = "assertion";

  public override async run(
    client: LegoClient,
    events: EventBus,
    triggerId: string,
    input: I
  ): Promise<BlockOutput<O>> {
    const callbackResult = this.config.predicate(client, input);
    const result =
      callbackResult instanceof Promise ? await callbackResult : callbackResult;

    const finalResult =
      typeof result === "object"
        ? { continue: result.result, output: result.output }
        : { continue: result, output: undefined as O };

    return finalResult;
  }
}
