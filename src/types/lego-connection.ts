import { ILegoClient } from "./i-lego-client.ts"
import { HassConfig } from "homeassistant-typescript"
import { IEventBus } from "./i-event-bus.ts"
import { Server } from "http"

export interface LegoConnection {
  client: ILegoClient,
  socket: Server
  hassConfig: HassConfig
  eventBus: IEventBus
}
