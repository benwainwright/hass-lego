import { ExecutionAbortedError } from "@errors";
import { Runnable } from "@types";
import { Queue } from "queue-typescript";

export class RunQueue {
  private queue = new Queue<Runnable>();

  public constructor() {
    void this.startLoop();
  }

  public enqueue(runnable: Runnable) {
    this.queue.enqueue(runnable);
  }

  public abortAll() {
    while (this.queue.length > 0) {
      const runnable = this.queue.dequeue();
      runnable.abort();
    }
  }

  private async startLoop() {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while (true) {
      while (this.queue.length > 0) {
        try {
          const runnable = this.queue.front;
          await runnable.run();
          this.queue.dequeue();
        } catch (error) {
          if (!(error instanceof ExecutionAbortedError)) {
            throw error;
          }
        }
      }

      await this.wait();
    }
  }

  private async wait() {
    await new Promise((accept) => setTimeout(accept, 1));
  }
}
