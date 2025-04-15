import { Executor, Block } from "@core";
import { ILegoClient, IEventBus } from "@types";
import { v4 } from "uuid";

/**
 * @alpha
 */
export class Trigger {
  public constructor(
    public readonly name: string,
    public readonly id: string,
    public readonly trigger: Record<string, unknown>,
  ) {}

  public async attachToClient(
    client: ILegoClient,
    block: Block<unknown, unknown>,
    events: IEventBus,
  ) {
    await client.registerTrigger(this.trigger, async (event) => {
      const triggerId = v4();

      const executor = new Executor([block], client, events, triggerId, event);

      await executor.run();
    });
  }
}
