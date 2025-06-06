import { Block } from "@core";
import { ILegoClient, BlockOutput } from "@types";
import { md5 } from "@utils";

/**
 * @alpha
 *
 * Configuration for an assertion object
 */
export interface AssertionConfig<I, O> {
  readonly name: string;
  id?: string;
  readonly predicate: (
    client: ILegoClient,
    input?: I,
  ) =>
    | Promise<boolean>
    | boolean
    | { result: boolean; output: O }
    | Promise<{ result: boolean; output: O }>;
}

export class Assertion<I = void, O = void> extends Block<I, O> {
  public constructor(public config: AssertionConfig<I, O>) {
    super(config.id ?? md5(config.name));
    this.name = this.config.name;
  }
  public readonly name: string;

  public override typeString = "assertion";

  public override async run(
    client: ILegoClient,
    input: I,
  ): Promise<BlockOutput<O>> {
    const callbackResult = this.config.predicate(client, input);

    const result =
      callbackResult instanceof Promise ? await callbackResult : callbackResult;

    return typeof result === "object"
      ? {
          outputType: "conditional",
          continue: true,
          conditionResult: result.result,
          output: result.output,
        }
      : {
          outputType: "conditional",
          continue: true,
          conditionResult: result,
          output: undefined as O,
        };
  }
}

export const assertion = <I = void, O = void>(
  config: AssertionConfig<I, O>,
): Block<I, O> => {
  return new Assertion(config);
};
