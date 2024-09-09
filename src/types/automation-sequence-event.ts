import { Action, Assertion, Automation } from "@building-blocks";

export type AutomationSequenceEvent<I, O> =
  | Action<I, O>
  | Assertion<I, O>
  | Automation<any, I, O>;
