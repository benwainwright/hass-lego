import { GetOutputs } from "./valid-input-output-sequence.ts";

import { EventBus, BlockExecutionMode, Executor, Block } from "@core";
import { BlockOutput, ILegoClient } from "@types";
import { md5 } from "@utils";

/**
 * @alpha
 */
export class ExecuteConcurrently<
  A extends readonly Block<unknown, unknown>[],
  I = void,
  O = void,
> extends Block<I, O> {
  public override name: string;

  public override readonly typeString = "execute-concurrently";

  public constructor(
    public config: {
      name: string;
      id?: string;
      actions: A;
    },
  ) {
    super(config.id ?? md5(config.name));
    this.name = this.config.name;
  }

  public override async validate(client: ILegoClient) {
    await Promise.all(
      this.config.actions.map(async (action) => {
        await action.validate(client);
      }),
    );
  }

  public override async run(
    client: ILegoClient,
    input: I,
    events?: EventBus,
    triggerId?: string,
  ): Promise<BlockOutput<O>> {
    if (!events) {
      throw new Error("Must configure an event bus");
    }

    if (!triggerId) {
      throw new Error("Must pass a triggerId");
    }

    const executor = new Executor<I, O>(
      [...this.config.actions],
      client,
      events,
      triggerId,
      input,
      BlockExecutionMode.Parallel,
      this,
    );

    void executor.run();

    const results = await executor.finished();

    const failed = results.find((result) => !result?.continue);

    if (failed) {
      return { continue: false };
    }

    const successes = results.flatMap((result) =>
      result?.success && result.continue ? [result] : [],
    );

    const outputs = successes.map(
      (success) => success.output,
    ) as unknown as GetOutputs<A>;

    return { continue: true, output: outputs as O, outputType: "block" };
  }
}

/**
 *
 * @alpha
 */
export const concurrently = <
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  A extends readonly Block<unknown, unknown>[],
  I = void,
  O = void,
>(
  actions: A,
): Block<I, O> => {
  return new ExecuteConcurrently<A, I, O>({
    name: "Execute Concurrently",
    actions,
  });
};
