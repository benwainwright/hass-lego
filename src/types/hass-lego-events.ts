import { Block, Trigger } from "@building-blocks";
import { Event } from "homeassistant-typescript";

/**
 * @alpha
 */
export type HassLegoEvent<I = unknown, O = unknown> =
  | AutomationRegistered<I, O>
  | GeneralFailure
  | StateChanged
  | TriggerFailed
  | TriggerFinished
  | TriggerStarted
  | BlockFailed<I, O>
  | BlockFinished<I, O>
  | BlockStarted<I, O>
  | SequenceAborted<I, O>;

/**
 * @alpha
 */
export interface StateChanged {
  type: "hass-state-changed";
  entity: string;
  hassEvent: Event;
}

interface BaseHassEvent<I = unknown, O = unknown> {
  triggerId: string;
  executeId: string;
  name: string;
  block: Block<I, O>;
}

/**
 * @alpha
 */
export interface AutomationRegistered<I = unknown, O = unknown> {
  type: "automation";
  name: string;
  block: Block<I, O>;
  status: "registered";
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
export interface BlockStarted<I, O> extends BaseHassEvent<I, O> {
  type: string;
  status: "started";
  parent?: Block<unknown, unknown>;
  triggeredBy?: Trigger<unknown>;
}

/**
 * @alpha
 */
export interface BlockFinished<I, O> extends BaseHassEvent<I, O> {
  type: string;
  status: "finished";
  output?: O;
  continue: boolean;
  parent?: Block<unknown, unknown>;
}

/**
 * @alpha
 */
export interface BlockFailed<I, O> extends BaseHassEvent<I, O> {
  type: string;
  status: "failed";
  message: string;
  error: Error;
  parent?: Block<unknown, unknown>;
}

export interface SequenceAborted<I, O> extends BaseHassEvent<I, O> {
  type: string;
  status: "aborted";
  block: Block<I, O>;
  name: string;
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
  triggerId: string;
  name: string;
  result: O;
  trigger: Trigger<O>;
}

/**
 * @alpha
 */
export interface TriggerFailed<O = unknown> {
  type: "trigger";
  triggerId: string;
  status: "failed";
  parent?: Block<unknown, unknown>;
  name: string;
  trigger: Trigger<O>;
  message: string;
  error: Error;
}
