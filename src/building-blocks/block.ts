import { EventBus, LegoClient } from "@core";
import { BlockOutput } from "@types";
import { Trigger } from "./trigger.ts";

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
    input: I
  ): Promise<BlockOutput<O>> | BlockOutput<O>;

  public async execute(
    client: LegoClient,
    events: EventBus,
    input: I,
    parent?: Block<unknown, unknown>,
    triggeredBy?: Trigger<unknown>
  ): Promise<BlockOutput<O> & { success: boolean }> {
    try {
      events.emit({
        type: this.typeString,
        status: "started",
        name: this.name,
        block: this,
        triggeredBy,
        parent,
      });
      const result = await this.run(client, events, input);
      events.emit({
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
