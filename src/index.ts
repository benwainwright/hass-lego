export { LegoClient, EventBus, renderSimpleLog } from "@core";
export type { CorsOptions } from "@core";

export type {
  GetSequenceOutput,
  GetSequenceInput,
  HassLegoEvent,
  StateChanged,
  AutomationRegistered,
  GeneralFailure,
  InputType,
  OutputType,
  HassEntity,
  HassStateChangedEvent,
  HassContext,
  HassEntityAttributeBase,
  HassEntityBase,
  HassEvent,
  HassEventBase,
  ValidInputOutputSequence,
  ContinueOutput,
  StopOutput,
} from "@types";

export { ExecutionMode } from "@types";

export {
  Trigger,
  when,
  IfThenElseCondition,
  sequence,
  concurrently,
  Automation,
  Action,
  Assertion,
  Block,
} from "@building-blocks";

export type {
  AssertionConfig,
  IfThenElseConditionConfig,
} from "@building-blocks";

export {
  HassLegoError,
  SequenceAbortedError,
  InitialStatesNotLoadedError,
  EntityDoesNotExistError,
} from "@errors";
