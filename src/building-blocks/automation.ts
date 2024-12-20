import { Queue } from "queue-typescript";

import { LegoClient, EventBus, Executor, BlockExecutionMode } from "@core";

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
import { ExecutionAbortedError } from "@errors";
import { md5 } from "@utils";

/**
 * @alpha
 */
export class Automation<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const A extends readonly any[],
  I = GetSequenceInput<A>,
  O = GetSequenceOutput<A>,
> extends Block<I, O> {
  private executionQueue = new Queue<Executor<I, O>>();
  public readonly name: string;
  public constructor(
    public config: {
      name: string;
      id?: string;
      actions: BlockRetainType<A> & A & ValidInputOutputSequence<I, O, A>;
      trigger?: Trigger | Trigger[];
      mode?: ExecutionMode;
    },
  ) {
    super(config.id ?? md5(config.name));
    this.name = this.config.name;
    void this.startLoop();
  }

  public override typeString = "automation";

  public override async validate(client: LegoClient) {
    await Promise.all(
      this.config.actions.map(async (action) => {
        await action.validate(client);
      }),
    );
  }

  private async startLoop() {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      while (this.executionQueue.length > 0) {
        try {
          const executor = this.executionQueue.front;
          await executor.runToCompletion()
          this.executionQueue.dequeue();
        } catch (error) {
          if (!(error instanceof ExecutionAbortedError)) {
            throw error;
          }
        }
      }
      await new Promise((accept) => setTimeout(accept, 1));
    }
  }

  private abortAll() {
    while (this.executionQueue.length > 0) {
      const executor = this.executionQueue.dequeue();
      executor.abort();
    }
  }

  public override async run(
    client: LegoClient,
    input?: I,
    events?: EventBus,
    triggerId?: string,
  ): Promise<BlockOutput<O>> {
    if (!events) {
      throw new Error("You must supply an event bus");
    }

    if (!triggerId) {
      throw new Error("You must supply a trigger id");
    }

    try {
      const executor = new Executor<I, O>(
        [...this.config.actions],
        client,
        events,
        triggerId,
        input,
        BlockExecutionMode.Sequence,
        this,
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
      const intResult = await executor.finished()
      const [result] = intResult

      if (!result) {
        throw new Error(
          "Sequence exector resolved but didn't return anything. This is probably a programming error",
        );
      }
      return result;
    } catch (error) {
      if (error instanceof ExecutionAbortedError) {
        return { continue: false };
      }
      throw error;
    }
  }
}
