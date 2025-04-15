import { IClient, Event, TriggerEventMessage } from "homeassistant-typescript";
import { Automation } from "@building-blocks";
import { HassEntity, IEventBus } from "@types";
import { Block } from "@core";
import { EntityDoesNotExistError, InitialStatesNotLoadedError } from "@errors";
import { ILegoClient } from "src/types/i-lego-client.ts";
import { CallServiceParams } from "src/core/lego-client.ts";

/**
 * @alpha
 */
export class LegoClient implements ILegoClient {
  private states: Map<string, HassEntity> | undefined;
  private _automations: Block<unknown, unknown>[] = [];

  public constructor(
    private client: IClient,
    private bus: IEventBus,
  ) { }

  /**
   * Load all available states from home assistant. This will reset the state cache -
   * call this if you need to remove non existant entities from cache
   */
  public async loadStates() {
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
      throw new InitialStatesNotLoadedError();
    }
    const state = this.states.get(id);
    if (!state) {
      throw new EntityDoesNotExistError(id);
    }
    return state;
  }

  public getAutomations(): Block<unknown, unknown>[] {
    return this._automations;
  }

  public async registerTrigger(
    trigger: Record<string, unknown>,
    callback: (event: unknown) => void | Promise<void>,
  ) {
    await this.client.registerTrigger(trigger, callback);
  }

  public async callService(params: CallServiceParams) {
    return await this.client.callService(params);
  }

  public async registerAutomation<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    A extends ReadonlyArray<any>,
  >(automation: Automation<A, unknown, unknown>) {
    this._automations.push(automation);
    const { trigger } = automation.config;

    await automation.validate(this);

    const triggers = Array.isArray(trigger) ? trigger : [trigger];

    await Promise.all(
      triggers.map(async (item) => {
        await item?.attachToClient(this, automation, this.bus);
      }),
    );

    this.bus.emit({
      type: "automation",
      status: "registered",
      name: automation.config.name,
      block: automation.toJson(),
    });
  }

  public async onStateChanged(id: string, callback: (event: Event) => void) {
    try {
      if (!this.states) {
        throw new Error("Initial states not loaded");
      }

      if (!this.states.has(id)) {
        throw new Error(
          "You tried to subscribe to an entity that doesn't exist",
        );
      }

      await this.client.subscribeToEvents(
        (event: Event | TriggerEventMessage["event"]) => {
          if (this.states && "data" in event) {
            this.states.set(event.data.entity_id, event.data.new_state);
          }
          if ("data" in event && event.data.entity_id === id) {
            callback(event);
          }
        },
      );
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
