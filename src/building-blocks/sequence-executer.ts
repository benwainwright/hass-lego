import { Queue } from "queue-typescript";
import { Block } from "./block.ts";
import { EventBus, LegoClient } from "@core";
import { BlockOutput } from "@types";
import EventEmitter from "events";
import { SequenceAbortedError } from "@errors";

const SEQUENCE_EXECUTOR_FINISHED = "sequence-executor-finished";
const SEQUENCE_EXECUTOR_ABORTED = "sequence-executor-aborted";

export class SequenceExecutor<I, O> {
  private executionQueue: Queue<Block<unknown, unknown>>;
  private bus = new EventEmitter();
  private result: (BlockOutput<O> & { success: boolean }) | undefined;

  public constructor(
    sequence: Block<unknown, unknown>[],
    private client: LegoClient,
    private events: EventBus,
    private parent: Block<unknown, unknown>,
    public triggerId: string,
    public executeId: string,
    private input?: I
  ) {
    this.executionQueue = new Queue(...sequence);
  }

  public async run() {
    let lastResult: (BlockOutput<unknown> & { success: boolean }) | undefined;
    while (this.executionQueue.length > 0) {
      const nextBlock = this.executionQueue.dequeue();
      if (
        !lastResult ||
        (lastResult.continue &&
          lastResult.type === "conditional" &&
          lastResult.conditionResult) ||
        (lastResult.continue && lastResult.type !== "conditional")
      ) {
        const result = await nextBlock.execute(
          this.client,
          this.events,
          lastResult?.output ?? this.input,
          this.triggerId,
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
    return new Promise<BlockOutput<O> & { success: boolean }>(
      (accept, reject) => {
        if (this.result) {
          accept(this.result);
        } else {
          const finishedCallback = () => {
            this.bus.off(SEQUENCE_EXECUTOR_FINISHED, finishedCallback);
            if (this.result) {
              accept(this.result);
            } else {
              reject(
                new Error(
                  "Sequence finished without a result. This is probably a programming error"
                )
              );
            }
          };

          const abortedCallback = () => {
            this.bus.off(SEQUENCE_EXECUTOR_ABORTED, abortedCallback);
            reject(new SequenceAbortedError(this.parent.name));
          };

          this.bus.on(SEQUENCE_EXECUTOR_ABORTED, abortedCallback);
          this.bus.on(SEQUENCE_EXECUTOR_FINISHED, finishedCallback);
        }
      }
    );
  }

  public abort() {
    while (this.executionQueue.length > 0) {
      this.executionQueue.dequeue();
    }
    this.bus.emit(SEQUENCE_EXECUTOR_ABORTED);
    this.events.emit({
      triggerId: this.triggerId,
      executeId: this.executeId,
      type: "automation",
      status: "aborted",
      block: this.parent.toJson(),
      name: this.parent.name,
    });
  }
}
