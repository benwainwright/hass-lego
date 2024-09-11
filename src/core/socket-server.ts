import { createServer } from "http";
import { EventBus } from "./event-bus.ts";
import { Server } from "socket.io";

export class LegoSocket {
  public constructor(private bus: EventBus) {}

}
