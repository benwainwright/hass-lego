import { EventBus, LegoClient } from "@core";
import { BlockOutput } from "@types";
import { Trigger } from "./trigger.ts";
import { v4 } from "uuid";

/**
 * @alpha
 */
export abstract class Block<I = void, O = void> {
  public abstract readonly name: string;
  /**
   * There is no reason to actually use this property. It exists as a typescript hack
   * in order to allow the type of a subclass to be inferred from the abstract version
   */
  public inputType: I | undefined;

  /**
   * There is no reason to actually use this property. It exists as a typescript hack
   * in order to allow the type of a subclass to be inferred from the abstract version
   */
  public outputType: O | undefined;

  protected abstract readonly typeString: string;

  protected abstract run(
    client: LegoClient,
    events: EventBus,
    triggerId: string,
    executeId: string,
    input: I
  ): Promise<BlockOutput<O>> | BlockOutput<O>;

  public async execute(
    client: LegoClient,
    events: EventBus,
    input: I,
    triggerId: string,
    parent?: Block<unknown, unknown>,
    triggeredBy?: Trigger<unknown>
  ): Promise<BlockOutput<O> & { success: boolean }> {
    const executeId = v4();
    try {
      events.emit({
        executeId,
        triggerId,
        type: this.typeString,
        status: "started",
        name: this.name,
        block: this,
        triggeredBy,
        parent,
      });
      const result = await this.run(
        client,
        events,
        triggerId,
        executeId,
        input
      );
      events.emit({
        executeId,
        triggerId,
        type: this.typeString,
        status: "finished",
        name: this.name,
        block: this,
        parent,
        ...result,
      });
      return { ...result, success: true };
    } catch (error) {
      if (error instanceof Error) {
        events.emit({
          executeId,
          triggerId,
          type: this.typeString,
          status: "failed",
          block: this,
          name: this.name,
          error,
          parent,
          message: error.message,
        });
        return { continue: false, success: false };
      }
      throw error;
    }
  }
}
