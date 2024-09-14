import { IClient, Event } from "homeassistant-typescript";
import { Automation, Block } from "@building-blocks";
import { HassEntity } from "@types";
import { EventBus } from "./event-bus.ts";
import { createServer } from "http";
import { Server } from "socket.io";
import { EntityDoesNotExistError, InitialStatesNotLoadedError } from "@errors";

/**
 * @alpha
 */
export class LegoClient {
  public states: Map<string, HassEntity> | undefined;

  public constructor(private client: IClient, private bus: EventBus) {}

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

  public getWebsocketServer() {
    const server = createServer((request, response) => {
      response.writeHead(200, { "content-type": "text/plain" });
      response.end("Websocket server is running!");
    });

    const io = new Server(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    const stringifyCircularJSON = (obj: unknown) => {
      const seen = new WeakSet();
      return JSON.stringify(obj, (k, v) => {
        if (v !== null && typeof v === "object") {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          if (seen.has(v)) return;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          seen.add(v);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return v;
      });
    };

    io.on("connection", (socket) => {
      this.bus.subscribe((event) => {
        if (event.type !== "hass-state-changed") {
          socket.emit(
            "hass-lego-event",
            JSON.parse(stringifyCircularJSON(event))
          );
        }
      });
    });

    return server;
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

  public async callService(params: {
    domain: string;
    service: string;
    target?: {
      entity_id?: string | string[];
      area_id?: string | string[];
      device_id?: string | string[];
    };
    data?: Record<string, unknown>;
  }) {
    return await this.client.callService(params);
  }

  public async registerAutomation<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    A extends ReadonlyArray<Block<any, any>>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    I = any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    O = any
  >(automation: Automation<A, I, O>) {
    await automation.attachTrigger(this, this.bus);
    this.bus.emit({
      type: "automation",
      status: "registered",
      name: automation.config.name,
      block: automation,
    });
  }

  public async onStateChanged(id: string, callback: (event: Event) => void) {
    try {
      if (!this.states) {
        throw new Error("Initial states not loaded");
      }

      if (!this.states.has(id)) {
        throw new Error(
          "You tried to subscribe to an entity that doesn't exist"
        );
      }

      await this.client.subscribeToEvents((event: Event) => {
        if (this.states) {
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
