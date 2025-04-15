import { Block } from "@core";

import { Assertion } from "./assertion.ts";
import { IfThenElseCondition } from "./if-then-else-condition.ts";

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
