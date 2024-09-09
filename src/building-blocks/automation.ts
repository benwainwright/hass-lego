import { Action } from "./action.ts";
import { LegoClient, EventBus } from "@core";
import { Trigger } from "./trigger.ts";
import {
  StateChanged,
  ValidInputOutputSequence,
  GetSequenceInput,
  GetSequenceOutput,
} from "@types";

import { Block } from "./block.ts";
import { Assertion } from "./assertion.ts";

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

  public attachTrigger(client: LegoClient, bus: EventBus) {
    if (this.config.trigger) {
      const { trigger } = this.config;
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
          await this.execute(client, bus, output, this, trigger);
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
    parent?: Block<unknown, unknown>,
    triggeredBy?: Trigger<I>
  ): Promise<{ output: O | undefined; success: boolean }> {
    events.emit({
      type: "automation",
      status: "started",
      name: this.config.name,
      automation: this,
      triggeredBy,
      parent,
    });

    const sequence = this.config.actions;

    interface SequenceItemResult<O = any> {
      continue: boolean;
      result: O;
    }

    const result = await [...sequence].reduce<Promise<SequenceItemResult>>(
      async (previousPromise, nextItem) => {
        const lastExecution = await previousPromise;
        if (!lastExecution.continue) {
          return lastExecution;
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

        if (nextItem instanceof Assertion) {
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
        }
        throw new Error("Did not recognise block type");
      },
      Promise.resolve({ continue: true, result: input })
    );

    return { success: true, output: result.result };
  }
}
