import { HassApi } from "homeassistant-ws";
import { Automation, Block } from "@building-blocks";
import { HassEntity, HassStateChangedEvent } from "@types";
import { EventBus } from "./event-bus.ts";
import { createServer } from "http";
import { Server } from "socket.io";

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

    io.on("connection", (socket) => {
      this.bus.subscribe((event) => {
        if (event.type !== "hass-state-changed") {
          socket.emit("hass-lego-event", event);
        }
      });
    });

    return server;
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
      block: automation,
    });
  }

  public startWebsocket() {}

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
