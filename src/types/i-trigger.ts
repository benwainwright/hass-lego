import { IBlock } from "./i-block.ts";
import { IEventBus } from "./i-event-bus.ts";
import { ILegoClient } from "./i-lego-client.ts";

export interface ITrigger {
  attachToClient: (
    client: ILegoClient,
    block: IBlock<unknown, unknown>,
    events: IEventBus,
  ) => Promise<void>;
}
