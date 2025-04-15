export { LegoClient } from "@client";

export { EventBus, renderSimpleLog, Block } from "@core";

export type {
  CorsOptions,
  HassLegoEvent,
  StateChanged,
  AutomationRegistered,
  GeneralFailure,
  HassEntity,
  HassStateChangedEvent,
  HassContext,
  HassEntityAttributeBase,
  HassEntityBase,
  HassEvent,
  HassEventBase,
  ContinueOutput,
  StopOutput,
} from "@types";

export { ExecutionMode } from "@types";

export {
  Trigger,
  IfThenElseCondition,
  sequence,
  concurrently,
  Automation,
  Action,
  Assertion,
  ServiceCall,
} from "@building-blocks";

export type {
  AssertionConfig,
  IfThenElseConditionConfig,
  ValidInputOutputSequence,
  GetSequenceInput,
  GetSequenceOutput,
  InputType,
  OutputType,
  OutputTypeKeepPromise,
  GetOutputs,
  GetResults,
  BlockRetainType,
} from "@building-blocks";

export {
  HassLegoError,
  ExecutionAbortedError,
  InitialStatesNotLoadedError,
  EntityDoesNotExistError,
} from "@errors";
