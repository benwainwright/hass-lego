import { HassApi } from "homeassistant-ws";
import { Automation } from "@building-blocks";
import {
  StateChanged,
  HassLegoEvent,
  HassEntity,
  HassStateChangedEvent,
  AutomationSequenceEvent,
} from "@types";
import { EventBus } from "./event-bus.ts";

/**
 * @alpha
 */
export class LegoClient {
  public states: Map<string, HassEntity> | undefined;

  public constructor(private client: HassApi, private bus: EventBus) {}

  public async init() {
    const states = (await this.client.getStates()) as HassEntity[];
    const statesMap = new Map<string, HassEntity>();
    states.forEach((state) => statesMap.set(state.entity_id, state));
    this.states = statesMap;
  }

  public getState(id: string) {
    return this.getEntity(id).state;
  }

  public getEntity(id: string) {
    if (!this.states) {
      throw new Error("Initial states not loaded");
    }
    const state = this.states.get(id);
    if (!state) {
      throw new Error(`Entity ${id} doesn't exist!`);
    }
    return state;
  }
  public async callService<T, A>(
    domain: string,
    service: string,
    extraArgs?: A,
    options?: {
      returnResponse?: boolean;
    }
  ): Promise<T> {
    return await this.client.callService(domain, service, extraArgs, options);
  }

  public addAutomationTrigger<
    A extends ReadonlyArray<AutomationSequenceEvent<any, any>>,
    I = any,
    O = any
  >(id: string, automation: Automation<A, I, O>) {
    this.onStateChanged(id, async (event: HassStateChangedEvent) => {
      const change: StateChanged = {
        entity: event.data.entity_id,
        hassEvent: event,
      };
      this.bus.emit(change);
      await automation.execute(this, this.bus);
    });
  }

  public registerAutomation<
    A extends ReadonlyArray<AutomationSequenceEvent<any, any>>,
    I = any,
    O = any
  >(automation: Automation<A, I, O>) {
    automation.attachTrigger(this, this.bus);
    this.bus.emit({
      type: "automation",
      status: "registered",
      automation,
    });
  }

  public onStateChanged(
    id: string,
    callback: (event: HassStateChangedEvent) => void
  ) {
    try {
      if (!this.states) {
        throw new Error("Initial states not loaded");
      }

      if (!this.states.has(id)) {
        throw new Error(
          "You tried to subscribe to an entity that doesn't exist"
        );
      }

      this.client.on("state_changed", (event: HassStateChangedEvent) => {
        if (event.data.new_state && this.states) {
          this.states.set(event.data.entity_id, event.data.new_state);
        }
        if (event.data.entity_id === id) {
          callback(event);
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        this.bus.emit({
          type: "generalFailure",
          message: error.message,
          status: "error",
          error,
        });
      }
    }
  }
}