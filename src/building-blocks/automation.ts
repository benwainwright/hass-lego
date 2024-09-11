import { Queue } from "queue-typescript";
import { LegoClient, EventBus } from "@core";
import { Trigger } from "./trigger.ts";
import {
  StateChanged,
  GetSequenceInput,
  GetSequenceOutput,
  BlockOutput,
  ExecutionMode,
  BlockRetainType,
  ValidInputOutputSequence,
} from "@types";

import { Block } from "./block.ts";
import { SequenceExecutor } from "./sequence-executer.ts";
import { v4 } from "uuid";
import { SequenceAbortedError } from "@errors";

/**
 * @alpha
 */
export class Automation<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const A extends readonly any[],
  I = GetSequenceInput<A>,
  O = GetSequenceOutput<A>
> extends Block<I, O> {
  private executionQueue = new Queue<SequenceExecutor<I, O>>();
  public readonly name: string;
  public constructor(
    public config: {
      name: string;
      actions: BlockRetainType<A> & A & ValidInputOutputSequence<I, O, A>;
      trigger?: Trigger<I> | Trigger<I>[];
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
        try {
          const executor = this.executionQueue.front;
          void executor.run();
          await executor.finished();
          this.executionQueue.dequeue();
        } catch (error) {
          if (!(error instanceof SequenceAbortedError)) {
            throw error;
          }
        }
      }
      await new Promise((accept) => setTimeout(accept, 100));
    }
  }
  
  private getTriggers

  public attachTrigger(client: LegoClient, bus: EventBus) {
    const triggers = !this.config.trigger
      ? undefined
      : Array.isArray(this.config.trigger)
      ? this.config.trigger
      : [this.config.trigger];

    if (triggers && triggers.length > 0) {
      triggers.forEach((thisTrigger) => {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        client.onStateChanged(thisTrigger.id, async (event) => {
          const newEvent: StateChanged = {
            entity: event.data.entity_id,
            hassEvent: event,
            type: "hass-state-changed",
          };

          const triggerId = v4();
          const { result, output } = await thisTrigger.doTrigger(
            newEvent,
            client,
            bus,
            triggerId
          );

          if (result) {
            await this.execute(client, bus, output, triggerId, this);
          }
        });
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
    triggerId: string,
    input?: I
  ): Promise<BlockOutput<O>> {
    try {
      const executor = new SequenceExecutor<I, O>(
        [...this.config.actions],
        client,
        events,
        this,
        triggerId,
        input
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
    } catch (error) {
      if (error instanceof SequenceAbortedError) {
        return { continue: false };
      }
      throw error;
    }
  }
}
