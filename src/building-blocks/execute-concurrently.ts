import { LegoClient, EventBus } from "@core";
import { BlockOutput, GetOutputs } from "@types";
import { Block } from "./block.ts";

/**
 * @alpha
 */
export class ExecuteConcurrently<
  A extends readonly Block<unknown, unknown>[],
  I = void,
  O = void
> extends Block<I, O> {
  public override name: string;

  protected override typeString = "execute-concurrently";

  public constructor(
    private config: {
      name: string;
      actions: A;
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

    return { continue: true, output: outputs as O };
  }
}

/**
 *
 * @alpha
 */
export const concurrently = <
  A extends readonly Block<unknown, unknown>[],
  I = void,
  O = void
>(
  actions: A
) => {
  return new ExecuteConcurrently<A, I, O>({
    name: "Execute Concurrently",
    actions,
  });
};
