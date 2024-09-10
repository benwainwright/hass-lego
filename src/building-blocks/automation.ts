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
import { v4 } from "uuid";
import { SequenceAbortedError } from "./sequence-aborted-error.ts";

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

        const triggerId = v4();
        const { result, output } = await trigger.doTrigger(
          newEvent,
          client,
          bus,
          triggerId
        );

        if (result) {
          await this.execute(client, bus, output, triggerId, this);
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
