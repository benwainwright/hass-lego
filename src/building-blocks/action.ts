import { EventBus, Block } from "@core";
import { BlockOutput, ILegoClient } from "@types";
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
        | ((client: ILegoClient, input: I) => O)
        | ((client: ILegoClient, input: I) => Promise<O>);
    },
  ) {
    super(config.id ?? md5(config.name));
    this.name = this.config.name;
  }

  public override readonly typeString: string = "action";

  public override async run(
    client: ILegoClient,
    input: I,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _events?: EventBus,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _triggerId?: string,
  ): Promise<BlockOutput<O>> {
    const callbackResult = this.config.callback(client, input);
    const result =
      callbackResult instanceof Promise ? await callbackResult : callbackResult;

    return { output: result, continue: true, outputType: "block" };
  }
}
