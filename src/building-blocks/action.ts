import { LegoClient, EventBus } from "@core";
import { Block } from "./block.ts";
import { BlockOutput } from "@types";

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

  protected override typeString = "action";

  public override async run(
    client: LegoClient,
    events: EventBus,
    triggerId: string,
    input: I
  ): Promise<BlockOutput<O>> {
    const callbackResult = this.config.callback(client, input);
    const result =
      callbackResult instanceof Promise ? await callbackResult : callbackResult;

    return { output: result, continue: true };
  }
}
