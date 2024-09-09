import {
  Action,
  Assertion,
  Automation,
  Block,
  Trigger,
} from "@building-blocks";
import { HassStateChangedEvent } from "./hass-events.ts";

/**
 * @alpha
 */
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

/**
 * @alpha
 */
export interface StateChanged {
  type: "hass-state-changed";
  entity: string;
  hassEvent: HassStateChangedEvent;
}

/**
 * @alpha
 */
export interface AutomationRegistered<
  A extends ReadonlyArray<Block<any, any>>,
  I = unknown,
  O = unknown
> {
  type: "automation";
  status: "registered";
  name: string;
  automation: Automation<A, I, O>;
}

/**
 * @alpha
 */
export interface GeneralFailure {
  type: "generalFailure";
  status: "error";
  message: string;
  error: Error;
}

/**
 * @alpha
 */
export interface AutomationStarted<
  A extends ReadonlyArray<Block<any, any>>,
  I = unknown,
  O = unknown
> {
  type: "automation";
  status: "started";
  automation: Automation<A, I, O>;
  triggeredBy?: Trigger<unknown>;
  name: string;
  parent?: Block<unknown, unknown>;
}

/**
 * @alpha
 */
export interface AutomationFinished<
  A extends ReadonlyArray<Block<any, any>>,
  I = unknown,
  O = unknown
> {
  type: "automation";
  status: "finished";
  automation: Automation<A, I, O>;
  result: O;
  name: string;
  parent?: Block<unknown, unknown>;
}

/**
 * @alpha
 */
export interface AutomationFailed<
  A extends ReadonlyArray<Block<any, any>>,
  I = unknown,
  O = unknown
> {
  type: "automation";
  status: "failed";
  automation: Automation<A, I, O>;
  message: string;
  name: string;
  error: Error;
  parent?: Block<unknown, unknown>;
}

/**
 * @alpha
 */
export interface ActionStarted<I = unknown, O = unknown> {
  type: "action";
  status: "started";
  name: string;
  action: Action<I, O>;
  parent?: Block<unknown, unknown>;
}

/**
 * @alpha
 */
export interface ActionFinished<I = unknown, O = unknown> {
  type: "action";
  status: "finished";
  action: Action<I, O>;
  result: O;
  name: string;
  parent?: Block<unknown, unknown>;
}

/**
 * @alpha
 */
export interface ActionFailed<I = unknown, O = unknown> {
  type: "action";
  status: "failed";
  parent?: Block<unknown, unknown>;
  action: Action<I, O>;
  message: string;
  name: string;
  error: Error;
}

/**
 * @alpha
 */
export interface AssertionStarted<I = unknown, O = unknown> {
  type: "assertion";
  status: "started";
  parent?: Block<unknown, unknown>;
  name: string;
  assertion: Assertion<I, O>;
}

/**
 * @alpha
 */
export interface AssertionFinished<I = unknown, O = unknown> {
  type: "assertion";
  status: "finished";
  assertion: Assertion<I, O>;
  parent?: Block<unknown, unknown>;
  name: string;
  result: { result: boolean; output: O };
}

/**
 * @alpha
 */
export interface AssertionFailed<I = unknown, O = unknown> {
  type: "assertion";
  status: "failed";
  parent?: Block<unknown, unknown>;
  assertion: Assertion<I, O>;
  name: string;
  message: string;
  error: Error;
}
