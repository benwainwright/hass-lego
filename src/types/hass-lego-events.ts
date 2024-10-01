import { Trigger } from "@building-blocks";
import { Event } from "homeassistant-typescript";

interface SerialisedBlock {
  id: string;
  name: string;
  type: string;
}

/**
 * @alpha
 */
export type HassLegoEvent =
  | AutomationRegistered
  | GeneralFailure
  | StateChanged
  | TriggerFailed
  | TriggerFinished
  | TriggerStarted
  | BlockFailed
  | BlockFinished
  | BlockStarted
  | SequenceAborted;

/**
 * @alpha
 */
export interface StateChanged {
  type: "hass-state-changed";
  entity: string;
  hassEvent: Event;
}

interface BaseHassEvent {
  triggerId: string;
  executeId: string;
  name: string;
  block: SerialisedBlock;
}

/**
 * @alpha
 */
export interface AutomationRegistered {
  type: "automation";
  name: string;
  block: SerialisedBlock;
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
export interface BlockStarted extends BaseHassEvent {
  type: string;
  status: "started";
  parent?: SerialisedBlock;
  triggeredBy?: Trigger<unknown>;
}

/**
 * @alpha
 */
export interface BlockFinished<O = unknown> extends BaseHassEvent {
  type: string;
  status: "finished";
  output?: O;
  continue: boolean;
  parent?: SerialisedBlock;
}

/**
 * @alpha
 */
export interface BlockFailed extends BaseHassEvent {
  type: string;
  status: "failed";
  message: string;
  error: Error;
  parent?: SerialisedBlock;
}

export interface SequenceAborted extends BaseHassEvent {
  type: string;
  status: "aborted";
  block: SerialisedBlock;
  name: string;
}

/**
 * @alpha
 */
export interface TriggerStarted {
  type: "trigger";
  status: "started";
  parent?: SerialisedBlock;
  name: string;
  trigger: SerialisedBlock;
}

/**
 * @alpha
 */
export interface TriggerFinished<O = unknown> {
  type: "trigger";
  status: "finished";
  parent?: SerialisedBlock;
  triggerId: string;
  name: string;
  result: O;
  trigger: SerialisedBlock;
}

/**
 * @alpha
 */
export interface TriggerFailed {
  type: "trigger";
  triggerId: string;
  status: "failed";
  parent?: SerialisedBlock;
  name: string;
  trigger: SerialisedBlock;
  message: string;
  error: Error;
}
