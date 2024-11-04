import { EventBus, Executor, LegoClient } from "@core";
import { Block } from "./block.ts";
import { v4 } from "uuid";

/**
 * @alpha
 */
export class Trigger {
  public constructor(
    public readonly name: string,
    public readonly id: string,
    public readonly trigger: Record<string, unknown>
  ) { }


  public async attachToClient(client: LegoClient, block: Block<unknown, unknown>, events: EventBus) {
    await client.registerTrigger(this.trigger, async (event) => {

      const triggerId = v4();

      const executor = new Executor(
        [block],
        client,
        events,
        triggerId,
        event,
      );

      await executor.runToCompletion()
    })
  }
}
