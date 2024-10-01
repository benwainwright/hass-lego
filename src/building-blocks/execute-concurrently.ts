import { LegoClient, EventBus } from "@core";
import { BlockOutput, GetOutputs } from "@types";
import { Block } from "./block.ts";
import { md5 } from "@utils";

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
    public config: {
      name: string;
      id?: string;
      actions: A;
    }
  ) {
    super(config.id ?? md5(config.name));
    this.name = this.config.name;
  }

  public override async validate(client: LegoClient) {
    await Promise.all(
      this.config.actions.map(async (action) => {
        await action.validate(client);
      })
    );
  }

  protected override async run(
    client: LegoClient,
    events: EventBus,
    triggerId: string,
    executeId: string,
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

    return { continue: true, output: outputs as O, type: "block" };
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
  O = void
>(
  actions: A
): Block<I, O> => {
  return new ExecuteConcurrently<A, I, O>({
    name: "Execute Concurrently",
    actions,
  });
};
