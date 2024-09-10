import { HassApi } from "homeassistant-ws";
import { Automation, Block } from "@building-blocks";
import { StateChanged, HassEntity, HassStateChangedEvent } from "@types";
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
  public async callService<T>(
    domain: string,
    service: string,
    extraArgs?: Record<string, unknown>,
    options?: {
      returnResponse?: boolean;
    }
  ): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.client.callService(domain, service, extraArgs, options);
  }

  public addAutomationTrigger<
    A extends ReadonlyArray<Block<unknown, unknown>>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    I = any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    O = any
  >(id: string, automation: Automation<A, I, O>) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.onStateChanged(id, async (event: HassStateChangedEvent) => {
      const change: StateChanged = {
        type: "hass-state-changed",
        entity: event.data.entity_id,
        hassEvent: event,
      };
      this.bus.emit(change);
      await automation.execute(this, this.bus);
    });
  }

  public registerAutomation<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    A extends ReadonlyArray<Block<any, any>>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    I = any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    O = any
  >(automation: Automation<A, I, O>) {
    automation.attachTrigger(this, this.bus);
    this.bus.emit({
      type: "automation",
      status: "registered",
      name: automation.config.name,
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
