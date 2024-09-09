import { Action } from "./action.ts";
import { LegoClient, EventBus } from "@core";
import { Trigger } from "./trigger.ts";
import { AutomationSequenceEvent, StateChanged } from "@types";
import { ValidInputOutputSequence } from "../types/valid-input-output-sequence.ts";

export class Automation<
  A extends ReadonlyArray<AutomationSequenceEvent<any, any>>,
  I = any,
  O = any
> {
  public constructor(
    public readonly name: string,
    private config:
      | {
          trigger?: Trigger;
          actions: ValidInputOutputSequence<I, O, A>;
        }
      | ValidInputOutputSequence<I, O, A>
  ) {}

  public attachTrigger(client: LegoClient, bus: EventBus) {
    if (
      !Array.isArray(this.config) &&
      "trigger" in this.config &&
      this.config.trigger
    ) {
      const { trigger } = this.config;
      client.onStateChanged(trigger.id, async (event) => {
        const newEvent: StateChanged = {
          entity: event.data.entity_id,
          hassEvent: event,
        };
        if (!trigger.predicate || trigger.predicate(newEvent)) {
          await this.execute(client, bus, undefined, this, trigger);
        }
      });
    } else {
      throw new Error("Automation has no trigger so cannot be attached");
    }
  }

  public async execute(
    client: LegoClient,
    events: EventBus,
    input?: I,
    parent?: AutomationSequenceEvent<unknown, unknown>,
    triggeredBy?: Trigger
  ): Promise<{ output: O | undefined; success: boolean }> {
    events.emit({
      type: "automation",
      status: "started",
      automation: this,
      triggeredBy,
    });
    const sequence =
      "actions" in this.config ? this.config.actions : this.config;

    interface SequenceItemResult<O = any> {
      continue: boolean;
      result: O;
    }

    const result = await [...sequence].reduce<Promise<SequenceItemResult>>(
      async (previousPromise, nextItem) => {
        const lastExecution = await previousPromise;
        if (!lastExecution.continue) {
          return { continue: false, result: "" };
        }

        if (nextItem instanceof Action || nextItem instanceof Automation) {
          return {
            result: await nextItem.execute(
              client,
              events,
              lastExecution.result,
              this
            ),
            continue: true,
          };
        }
        const predicateResult = await nextItem.runPredicate(
          client,
          events,
          lastExecution.result,
          this
        );
        return {
          continue: predicateResult.result,
          result: predicateResult.output,
        };
      },
      Promise.resolve({ continue: true, result: input })
    );

    return { success: true, output: result.result };
  }
}
