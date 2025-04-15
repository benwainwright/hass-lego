import { Block } from "@core";
import { BlockOutput, ILegoClient, IEventBus } from "@types";
import { md5 } from "@utils";

export class Action<I = void, O = void>
  extends Block<I, O>
  implements Block<I, O>
{
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
    _events?: IEventBus,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _triggerId?: string,
  ): Promise<BlockOutput<O>> {
    const callbackResult = this.config.callback(client, input);
    const result =
      callbackResult instanceof Promise ? await callbackResult : callbackResult;

    return { output: result, continue: true, outputType: "block" };
  }
}

export const action = <I = void, O = void>(config: {
  readonly name: string;
  readonly id?: string;
  callback:
    | ((client: ILegoClient, input: I) => O)
    | ((client: ILegoClient, input: I) => Promise<O>);
}): Block<I, O> => {
  return new Action(config);
};
