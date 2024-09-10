import { Queue } from "queue-typescript";
import { LegoClient, EventBus } from "@core";
import { Trigger } from "./trigger.ts";
import {
  StateChanged,
  ValidInputOutputSequence,
  GetSequenceInput,
  GetSequenceOutput,
  BlockOutput,
  ExecutionMode,
} from "@types";

import { Block } from "./block.ts";
import { SequenceExecutor } from "./sequence-executer.ts";

/**
 * @alpha
 */
export class Automation<
  A extends readonly Block<unknown, unknown>[],
  I = GetSequenceInput<A>,
  O = GetSequenceOutput<A>
> extends Block<I, O> {
  private executionQueue = new Queue<SequenceExecutor<I, O>>();
  public readonly name: string;
  public constructor(
    public config: {
      name: string;
      actions: A & ValidInputOutputSequence<I, O, A>;
      trigger?: Trigger<I>;
      mode?: ExecutionMode;
    }
  ) {
    super();
    this.name = this.config.name;
    void this.startLoop();
  }

  protected override typeString = "automation";

  private async startLoop() {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      while (this.executionQueue.length > 0) {
        const executor = this.executionQueue.dequeue();
        await executor.run();
      }
      await new Promise((accept) => setTimeout(accept, 100));
    }
  }

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

  private abortAll() {
    while (this.executionQueue.length > 0) {
      const executor = this.executionQueue.dequeue();
      executor.abort();
    }
  }

  protected override async run(
    client: LegoClient,
    events: EventBus,
    input?: I
  ): Promise<BlockOutput<O>> {
    const executor = new SequenceExecutor<I, O>(
      [...this.config.actions],
      client,
      events,
      input,
      this
    );
    const mode = this.config.mode ?? ExecutionMode.Restart;
    switch (mode) {
      case ExecutionMode.Restart:
        this.abortAll();
        this.executionQueue.enqueue(executor);
        break;

      case ExecutionMode.Queue:
        this.executionQueue.enqueue(executor);
        break;

      case ExecutionMode.Parallel:
        await executor.run();
        break;
    }
    return await executor.finished();
  }
}
