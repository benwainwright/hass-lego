import { Queue } from "queue-typescript";
import { Block } from "./block.ts";
import { EventBus, LegoClient } from "@core";
import { BlockOutput } from "@types";
import EventEmitter from "events";

const SEQUENCE_EXECUTOR_FINISHED = "sequence-executor-finished";

export class SequenceExecutor<I, O> {
  private executionQueue: Queue<Block<unknown, unknown>>;
  private bus = new EventEmitter();
  private result: (BlockOutput<O> & { success: boolean }) | undefined;

  public constructor(
    sequence: Block<unknown, unknown>[],
    private client: LegoClient,
    private events: EventBus,
    private input?: I,
    private parent?: Block<unknown, unknown>
  ) {
    this.executionQueue = new Queue(...sequence);
  }

  public async run() {
    let lastResult: (BlockOutput<unknown> & { success: boolean }) | undefined;
    while (this.executionQueue.length > 0) {
      const nextBlock = this.executionQueue.dequeue();
      if (!lastResult || lastResult.continue) {
        const result = await nextBlock.execute(
          this.client,
          this.events,
          lastResult?.output ?? this.input,
          this.parent
        );
        lastResult = result;
      } else {
        this.abort();
      }
    }
    this.result = { ...(lastResult as BlockOutput<O>), success: true };
    this.bus.emit(SEQUENCE_EXECUTOR_FINISHED);
  }

  public async finished() {
    return new Promise<BlockOutput<O> & { success: boolean }>((accept) => {
      if (this.result) {
        accept(this.result);
      } else {
        this.bus.on(SEQUENCE_EXECUTOR_FINISHED, () => {
          if (this.result) {
            accept(this.result);
          }
        });
      }
    });
  }

  public abort() {
    while (this.executionQueue.length > 0) {
      this.executionQueue.dequeue();
    }
  }
}
