import { EventBus, Block } from "@core";
import { AssertionError } from "@errors";
import { BlockOutput, ILegoClient } from "@types";
import { md5 } from "@utils";

/**
 * @public
 */
export type ConditionPredicate<PO = void, I = void> = (
  client: ILegoClient,
  input?: I,
) =>
  | Promise<boolean>
  | boolean
  | { result: boolean; output: PO }
  | Promise<{ result: boolean; output: PO }>;

/**
 * @public
 */
export interface IfThenElseConditionConfig<
  TO = void,
  EO = void,
  PO = void,
  I = void,
> {
  /**
   * Block name
   */
  readonly name: string;

  /**
   * Unique identifier for this block. Will use a hash of the name if not provided
   */
  readonly id?: string;

  /**
   * The result of this assertion decides which branch to take
   */
  readonly assertion: Block<I, PO>;

  /**
   * Execute this block if the predicate passes
   */
  readonly then: Block<PO, TO>;

  /**
   * Execute this block if the predicate fails
   */
  readonly else: Block<PO, EO>;
}

/**
 * @public
 *
 * Use in combination with an {@link Assertion} block to implement branching logic in your automations.
 * Supply two blocks and execute either one of them depending on the result of the assertion
 */
export class IfThenElseCondition<
  TO = void,
  EO = void,
  PO = void,
  I = void,
> extends Block<I, TO | EO> {
  public override name: string;

  public override typeString = "if-then-else";

  public constructor(
    public readonly config: IfThenElseConditionConfig<TO, EO, PO, I>,
  ) {
    super(config.id ?? md5(config.name), [
      config.assertion,
      config.then,
      config.else,
    ]);
    this.name = this.config.name;
  }

  public override async run(
    client: ILegoClient,
    input: I,
    events?: EventBus,
    triggerId?: string,
  ): Promise<BlockOutput<TO | EO>> {
    const assertionResult = await this.config.assertion.run(client, input);

    if (!assertionResult.continue) {
      return { continue: false };
    }

    if (assertionResult.outputType !== "conditional") {
      throw new AssertionError(
        `Block in the 'assertion' property must return a conditional result`,
      );
    }

    const branchExecutedResult = assertionResult.conditionResult
      ? await this.config.then.run(
          client,
          assertionResult.output,
          events,
          triggerId,
        )
      : await this.config.else.run(
          client,
          assertionResult.output,
          events,
          triggerId,
        );

    return branchExecutedResult;
  }
}

export const when = <TO = void, EO = void, PO = void, I = void>(
  config: IfThenElseConditionConfig<TO, EO, PO, I>,
): Block<I, TO | EO> => {
  return new IfThenElseCondition(config);
};
