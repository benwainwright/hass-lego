import { ITrigger } from "./i-trigger.ts";
import { Event } from "homeassistant-typescript";
import { BlockOutput } from "./block-output.ts";

export interface SerialisedBlock {
  id: string;
  name: string;
  type: string;
  params?: Record<string, unknown>;
}

/**
 * @alpha
 */
export type HassLegoEvent =
  | AutomationRegistered
  | GeneralFailure
  | StateChanged
  | BlockFailed
  | BlockFinished
  | BlockPending
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
  triggeredBy?: ITrigger;
}

/**
 * @alpha
 */
export interface BlockFinished<O = unknown> extends BaseHassEvent {
  type: string;
  status: "finished";
  output: BlockOutput<O>;
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

/**
 * @alpha
 */
export interface BlockPending extends BaseHassEvent {
  type: string;
  status: "pending";
  parent?: SerialisedBlock;
  triggeredBy?: ITrigger;
}

export interface SequenceAborted extends BaseHassEvent {
  type: string;
  status: "aborted";
  block: SerialisedBlock;
  name: string;
}
