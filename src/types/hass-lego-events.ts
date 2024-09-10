import { Automation, Block, Trigger } from "@building-blocks";
import { HassStateChangedEvent } from "./hass-events.ts";

/**
 * @alpha
 */
export type HassLegoEvent<I = unknown, O = unknown> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | AutomationRegistered<any, I, O>
  | GeneralFailure
  | StateChanged
  | TriggerFailed
  | TriggerFinished
  | TriggerStarted
  | BlockFailed<I, O>
  | BlockFinished<I, O>
  | BlockStarted<I, O>;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
export interface BlockStarted<I, O> {
  type: string;
  status: "started";
  block: Block<I, O>;
  name: string;
  parent?: Block<unknown, unknown>;
  triggeredBy?: Trigger<unknown>;
}

/**
 * @alpha
 */
export interface BlockFinished<I, O> {
  type: string;
  status: "finished";
  block: Block<I, O>;
  output?: O;
  continue: boolean;
  name: string;
  parent?: Block<unknown, unknown>;
}

/**
 * @alpha
 */
export interface BlockFailed<I, O> {
  type: string;
  status: "failed";
  block: Block<I, O>;
  message: string;
  name: string;
  error: Error;
  parent?: Block<unknown, unknown>;
}

/**
 * @alpha
 */
export interface TriggerStarted<O = unknown> {
  type: "trigger";
  status: "started";
  parent?: Block<unknown, unknown>;
  name: string;
  trigger: Trigger<O>;
}

/**
 * @alpha
 */
export interface TriggerFinished<O = unknown> {
  type: "trigger";
  status: "finished";
  parent?: Block<unknown, unknown>;
  name: string;
  result: O;
  trigger: Trigger<O>;
}

/**
 * @alpha
 */
export interface TriggerFailed<O = unknown> {
  type: "trigger";
  status: "failed";
  parent?: Block<unknown, unknown>;
  name: string;
  trigger: Trigger<O>;
  message: string;
  error: Error;
}
