import { State } from "homeassistant-typescript";
import { CallServiceParams } from "./call-service-params.ts";
import { HassEntity } from "./hass-events.ts";
import { IBlock } from "./i-block.ts";

export interface ILegoClient {
  loadStates: () => Promise<void>;
  getState: (id: string) => string;
  getEntity: (id: string) => HassEntity;
  getAutomations: () => IBlock<unknown, unknown>[];
  callService: (params: CallServiceParams) => Promise<State[]>;
  registerTrigger: (
    trigger: Record<string, unknown>,
    callback: (event: unknown) => void | Promise<void>,
  ) => Promise<void>;
}
