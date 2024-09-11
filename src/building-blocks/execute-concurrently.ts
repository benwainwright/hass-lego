import { LegoClient, EventBus } from "@core";
import { BlockOutput, GetOutputs } from "@types";
import { Block } from "./block.ts";

type MergeStrategyCallback<A extends readonly Block<unknown, unknown>[], O> = (
  ...inputs: GetOutputs<A>
) => O;

/**
 * @alpha
 */
export class ExecuteConcurrently<
  I,
  O,
  A extends readonly Block<unknown, unknown>[]
> extends Block<I, O> {
  public override name: string;

  protected override typeString = "execute-concurrently";

  public constructor(
    private config: {
      name: string;
      actions: A;
      mergeStrategy?: MergeStrategyCallback<A, O>;
    }
  ) {
    super();
    this.name = this.config.name;
  }

  protected override async run(
    client: LegoClient,
    events: EventBus,
    triggerId: string,
    input: I
  ): Promise<BlockOutput<O>> {
    const results = await Promise.all(
      this.config.actions.map((action) =>
        action.execute(client, events, input, triggerId, this)
      )
    );

    const failed = results.find((result) => !result.continue);

    if (failed) {
      return { continue: false };
    }

    const successes = results.flatMap((result) =>
      result.success && result.continue ? [result] : []
    );

    const outputs = successes.map(
      (success) => success.output
    ) as unknown as GetOutputs<A>;

    const finalOutputs = this.config.mergeStrategy
      ? this.config.mergeStrategy(...outputs)
      : undefined;

    return { continue: true, output: finalOutputs as O };
  }
}

/**
 *
 * @alpha
 */
export const concurrently = <
  I,
  O,
  A extends readonly Block<unknown, unknown>[]
>(
  actions: A,
  mergeStrategy?: MergeStrategyCallback<A, O>
) => {
  return new ExecuteConcurrently<I, O, A>({
    name: "Execute Concurrently",
    actions,
    mergeStrategy,
  });
};
