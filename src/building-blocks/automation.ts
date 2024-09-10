import { LegoClient, EventBus } from "@core";
import { Trigger } from "./trigger.ts";
import {
  StateChanged,
  ValidInputOutputSequence,
  GetSequenceInput,
  GetSequenceOutput,
  BlockOutput,
} from "@types";

import { Block } from "./block.ts";

/**
 * @alpha
 */
export class Automation<
  A extends readonly Block<unknown, unknown>[],
  I = GetSequenceInput<A>,
  O = GetSequenceOutput<A>
> extends Block<I, O> {
  public readonly name: string;
  public constructor(
    public config: {
      name: string;
      actions: A & ValidInputOutputSequence<I, O, A>;
      trigger?: Trigger<I>;
    }
  ) {
    super();
    this.name = this.config.name;
  }

  protected override typeString = "automation";

  public attachTrigger(client: LegoClient, bus: EventBus) {
    if (this.config.trigger) {
      const { trigger } = this.config;
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      client.onStateChanged(trigger.id, async (event) => {
        const newEvent: StateChanged = {
          entity: event.data.entity_id,
          hassEvent: event,
          type: "hass-state-changed",
        };

        const { result, output } = await trigger.doTrigger(
          newEvent,
          client,
          bus
        );

        if (result) {
          await this.execute(client, bus, output, this);
        }
      });
    } else {
      throw new Error("Automation has no trigger so cannot be attached");
    }
  }

  protected override async run(
    client: LegoClient,
    events: EventBus,
    input?: I
  ): Promise<BlockOutput<O>> {
    const result = await [...this.config.actions].reduce<
      Promise<BlockOutput<unknown>>
    >(async (previousPromise, nextItem) => {
      const lastExecution = await previousPromise;
      if (!lastExecution.continue) {
        return lastExecution;
      }
      const result = nextItem.execute(
        client,
        events,
        lastExecution.output,
        this
      );
      return result;
    }, Promise.resolve({ continue: true, output: input }));

    return result as BlockOutput<O>;
  }
}
