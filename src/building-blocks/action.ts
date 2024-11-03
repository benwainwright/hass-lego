import { EventBus, LegoClient } from "@core";
import { Block } from "./block.ts";
import { BlockOutput } from "@types";
import { md5 } from "@utils";

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
      readonly id?: string;
      callback:
      | ((client: LegoClient, input: I) => O)
      | ((client: LegoClient, input: I) => Promise<O>);
    },
  ) {
    super(config.id ?? md5(config.name));
    this.name = this.config.name;
  }

  public override readonly typeString: string = "action";

  public override async run(
    client: LegoClient,
    input: I,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    events?: EventBus,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    triggerId?: string,
  ): Promise<BlockOutput<O>> {
    const callbackResult = this.config.callback(client, input);
    const result =
      callbackResult instanceof Promise ? await callbackResult : callbackResult;

    return { output: result, continue: true, outputType: "block" };
  }
}
