import { EventBus, LegoClient } from "@core";
import { Block } from "./block.ts";
import { BlockOutput } from "@types";
import { Assertion } from "./assertion.ts";

/**
 * @public
 */
export type ConditionPredicate<PO = void, I = void> = (
  client: LegoClient,
  input?: I
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
  I = void
> {
  /**
   * Block name
   */
  readonly name: string;

  /**
   * The result of this assertion decides which branch to take
   */
  readonly assertion: Assertion<I, PO>;

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
  I = void
> extends Block<I, TO | EO> {
  public override name: string;

  protected override typeString = "if-then-else";

  public constructor(
    public readonly config: IfThenElseConditionConfig<TO, EO, PO, I>
  ) {
    super();
    this.name = this.config.name;
  }
  protected override async run(
    client: LegoClient,
    events: EventBus,
    triggerId: string,
    executeId: string,
    input: I
  ): Promise<BlockOutput<TO | EO>> {
    const assertionResult = await this.config.assertion.execute(
      client,
      events,
      input,
      triggerId,
      this
    );

    if (!assertionResult.continue) {
      return { continue: false };
    }

    const branchExecutedResult =
      assertionResult.type === "conditional" && assertionResult.conditionResult
        ? await this.config.then.execute(
            client,
            events,
            assertionResult.output,
            triggerId,
            this
          )
        : await this.config.else.execute(
            client,
            events,
            assertionResult.output,
            triggerId,
            this
          );

    return branchExecutedResult;
  }
}

/**
 * @public
 *
 * Use in combination with an {@link Assertion} block to implement branching logic in your automations.
 * Supply two blocks and execute either one of them depending on the result of the assertion
 */
export const when = <TO = void, EO = void, PO = void, I = void>(config: {
  assertion: Assertion<I, PO>;
  then: Block<PO, TO>;
  else: Block<PO, EO>;
}) => {
  return new IfThenElseCondition<TO, EO, PO, I>({
    ...config,
    name: "If then else condition",
  });
};
