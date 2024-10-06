import { Queue } from "queue-typescript";
import { Block } from "./block.ts";
import { EventBus, LegoClient } from "@core";
import { BlockOutput } from "@types";
import EventEmitter from "events";
import { ExecutionAbortedError } from "@errors";
import { v4 } from "uuid";

const EXECUTOR_FINISHED = "executor-finished";
const EXECUTOR_ABORTED = "executor-aborted";

export enum BlockExecutionMode {
  Parallel = "Parallel",
  Sequence = "Sequence",
}

type Output<O> = (BlockOutput<O> & { success: boolean }) | undefined;

export class Executor<I, O> {
  private executionQueue: Queue<{
    executionId: string;
    block: Block<unknown, unknown>;
  }>;
  private bus = new EventEmitter();
  private result: Output<O>[] | undefined;

  private aborted = false;

  public constructor(
    sequence: Block<unknown, unknown>[],
    private client: LegoClient,
    private events: EventBus,
    public triggerId: string,
    private input?: I,
    private executionMode?: BlockExecutionMode,
    private parent?: Block<unknown, unknown>,
  ) {
    const queueItems = sequence.map((item) => ({
      executionId: v4(),
      block: item,
    }));

    this.executionQueue = new Queue(...queueItems);
  }

  private async runPromiseOrRejectWhenAborted<T>(
    promiseFunction: () => Promise<T>,
  ): Promise<T> {
    const result = promiseFunction();
    return await new Promise<T>((accept, reject) => {
      const waitForAbortCallback = () => {
        reject(new ExecutionAbortedError("Sequence was aborted"));
        this.bus.off(EXECUTOR_ABORTED, waitForAbortCallback);
      };

      result
        .then((result) => {
          accept(result);
        })
        .catch((error: unknown) => {
          if (error instanceof Error) {
            reject(error);
          }
        });

      this.bus.on(EXECUTOR_ABORTED, waitForAbortCallback);
    });
  }

  private async executeBlock<Out>(
    executeId: string,
    block: Block<unknown, Out>,
    input: unknown,
  ): Promise<BlockOutput<Out> & { success: boolean }> {
    const eventArgs = {
      executeId,
      triggerId: this.triggerId,
      type: block.typeString,
      name: block.name,
      block: block.toJson(),
      triggeredBy: undefined,
      parent: this.parent?.toJson(),
    };
    try {
      if (this.aborted) {
        throw new ExecutionAbortedError("Sequence was aborted");
      }

      this.events.emit({
        status: "started",
        ...eventArgs,
      });

      const result = await this.runPromiseOrRejectWhenAborted(
        async () =>
          await block.run(this.client, input, this.events, this.triggerId),
      );

      this.events.emit({
        ...result,
        status: "finished",
        output: result,
        ...eventArgs,
      });

      return { ...result, success: true };
    } catch (error) {
      if (error instanceof Error) {
        this.events.emit({
          status: error instanceof ExecutionAbortedError ? "aborted" : "failed",
          error,
          message: error.message,
          ...eventArgs,
        });
        return { continue: false, success: false };
      }
      throw error;
    }
  }

  public async run(): Promise<void> {
    let lastResult: (BlockOutput<unknown> & { success: boolean }) | undefined;
    let resultPromises: Promise<
      (BlockOutput<unknown> & { success: boolean }) | undefined
    >[] = [];
    while (this.executionQueue.length > 0) {
      const { block, executionId } = this.executionQueue.dequeue();

      const lastResultPromise = this.executeBlock(
        executionId,
        block,
        (lastResult?.continue && lastResult.output) ?? this.input,
      );

      resultPromises.push(lastResultPromise);

      if (this.executionMode === BlockExecutionMode.Sequence) {
        lastResult = await lastResultPromise;
        const blockIndicatedToStop = !lastResult.continue;

        const conditionalBlockFailed =
          lastResult.continue &&
          lastResult.outputType === "conditional" &&
          !lastResult.conditionResult;

        if (blockIndicatedToStop || conditionalBlockFailed) {
          this.abort();
        }
      }
    }

    if (this.executionMode === BlockExecutionMode.Parallel) {
      const result = await Promise.all(resultPromises);
      this.result = result as Output<O>[];
    }

    this.result = [{ ...(lastResult as BlockOutput<O>), success: true }];
    this.bus.emit(EXECUTOR_FINISHED);
  }

  public async finished() {
    return new Promise<Output<O>[]>((accept, reject) => {
      if (this.result) {
        accept(this.result);
      } else {
        const finishedCallback = () => {
          this.bus.off(EXECUTOR_FINISHED, finishedCallback);
          if (this.result) {
            accept(this.result);
          } else {
            reject(
              new Error(
                "Sequence finished without a result. This is probably a programming error",
              ),
            );
          }
        };

        const abortedCallback = () => {
          this.bus.off(EXECUTOR_ABORTED, abortedCallback);
          reject(new ExecutionAbortedError(this.parent?.name ?? ""));
        };

        this.bus.on(EXECUTOR_ABORTED, abortedCallback);
        this.bus.on(EXECUTOR_FINISHED, finishedCallback);
      }
    });
  }

  public abort() {
    this.aborted = true;
    this.bus.emit(EXECUTOR_ABORTED);
  }
}
