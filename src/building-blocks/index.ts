export type { AssertionConfig } from "./assertion.ts";
export type { IfThenElseConditionConfig } from "./if-then-else-condition.ts";

export { Automation, automation } from "./automation.ts";
export { when } from "./if-then-else-condition.ts";
export { action } from "./action.ts"
export { concurrently } from "./execute-concurrently.ts";
export { sequence } from "./sequence.ts";
export { serviceCall } from "./service-call.ts";
export { assertion } from "./assertion.ts";
export { trigger } from "./trigger.ts";

export type {
  ValidInputOutputSequence,
  GetSequenceInput,
  GetSequenceOutput,
  InputType,
  OutputType,
  OutputTypeKeepPromise,
  GetOutputs,
  GetResults,
  BlockRetainType,
} from "./valid-input-output-sequence.ts";
