import { Action, Assertion, Automation, Trigger } from "@building-blocks";
import { AutomationSequenceEvent } from "./automation-sequence-event.ts";
import { HassStateChangedEvent } from "./hass-events.ts";

export type HassLegoEvent<I, O> =
  | ActionStarted<I, O>
  | ActionFailed<I, O>
  | ActionFinished<I, O>
  | AssertionStarted<I, O>
  | AssertionFinished<I, O>
  | AssertionFailed<I, O>
  | AutomationFailed<any, I, O>
  | AutomationFinished<any, I, O>
  | AutomationStarted<any, I, O>
  | AutomationRegistered<any, I, O>
  | GeneralFailure
  | StateChanged;

export interface StateChanged {
  type: "hass-state-changed";
  entity: string;
  hassEvent: HassStateChangedEvent;
}

export interface AutomationRegistered<
  A extends ReadonlyArray<AutomationSequenceEvent<any, any>>,
  I = unknown,
  O = unknown
> {
  type: "automation";
  status: "registered";
  name: string;
  automation: Automation<A, I, O>;
}

export interface GeneralFailure {
  type: "generalFailure";
  status: "error";
  message: string;
  error: Error;
}

export interface AutomationStarted<
  A extends ReadonlyArray<AutomationSequenceEvent<any, any>>,
  I = unknown,
  O = unknown
> {
  type: "automation";
  status: "started";
  automation: Automation<A, I, O>;
  triggeredBy?: Trigger;
  name: string;
  parent?: AutomationSequenceEvent<unknown, unknown>;
}

export interface AutomationFinished<
  A extends ReadonlyArray<AutomationSequenceEvent<any, any>>,
  I = unknown,
  O = unknown
> {
  type: "automation";
  status: "finished";
  automation: Automation<A, I, O>;
  result: O;
  name: string;
  parent?: AutomationSequenceEvent<unknown, unknown>;
}

export interface AutomationFailed<
  A extends ReadonlyArray<AutomationSequenceEvent<any, any>>,
  I = unknown,
  O = unknown
> {
  type: "automation";
  status: "failed";
  automation: Automation<A, I, O>;
  message: string;
  name: string;
  error: Error;
  parent?: AutomationSequenceEvent<unknown, unknown>;
}

export interface ActionStarted<I = unknown, O = unknown> {
  type: "action";
  status: "started";
  name: string;
  action: Action<I, O>;
  parent?: AutomationSequenceEvent<unknown, unknown>;
}

export interface ActionFinished<I = unknown, O = unknown> {
  type: "action";
  status: "finished";
  action: Action<I, O>;
  result: O;
  name: string;
  parent?: AutomationSequenceEvent<unknown, unknown>;
}

export interface ActionFailed<I = unknown, O = unknown> {
  type: "action";
  status: "failed";
  parent?: AutomationSequenceEvent<unknown, unknown>;
  action: Action<I, O>;
  message: string;
  name: string;
  error: Error;
}

export interface AssertionStarted<I = unknown, O = unknown> {
  type: "assertion";
  status: "started";
  parent?: AutomationSequenceEvent<unknown, unknown>;
  name: string;
  assertion: Assertion<I, O>;
}

export interface AssertionFinished<I = unknown, O = unknown> {
  type: "assertion";
  status: "finished";
  assertion: Assertion<I, O>;
  parent?: AutomationSequenceEvent<unknown, unknown>;
  name: string;
  result: { result: boolean; output: O };
}

export interface AssertionFailed<I = unknown, O = unknown> {
  type: "assertion";
  status: "failed";
  parent?: AutomationSequenceEvent<unknown, unknown>;
  assertion: Assertion<I, O>;
  name: string;
  message: string;
  error: Error;
}
