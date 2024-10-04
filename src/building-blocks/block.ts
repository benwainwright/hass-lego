import { EventBus, LegoClient } from "@core";
import { BlockOutput } from "@types";
import { Trigger } from "./trigger.ts";
import { v4 } from "uuid";

/**
 * @alpha
 */
export abstract class Block<I = void, O = void> {
  public constructor(private _id: string) {}
  public toJson() {
    return {
      type: this.typeString,
      id: this.id,
      name: this.name,
    };
  }

  /**
   * String to identify this particular instance of a block. Must be unique
   */
  public get id(): string {
    return this._id;
  }

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

  /**
   * If defined, this method will be called when the parent automation is registered.
   * If any configuration is invalid, an error should be thrown
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async validate(client: LegoClient): Promise<void> {
    // Noop here
  }

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
    const block = this.toJson();
    try {
      events.emit({
        executeId,
        triggerId,
        type: this.typeString,
        status: "started",
        name: this.name,
        block,
        triggeredBy,
        parent: parent?.toJson(),
      });
      const result = await this.run(
        client,
        events,
        triggerId,
        executeId,
        input
      );

      events.emit({
        ...result,
        executeId,
        triggerId,
        type: this.typeString,
        status: "finished",
        name: this.name,
        output: result,
        block,
        parent: parent?.toJson(),
      });
      return { ...result, success: true };
    } catch (error) {
      if (error instanceof Error) {
        events.emit({
          executeId,
          triggerId,
          type: this.typeString,
          status: "failed",
          block,
          name: this.name,
          error,
          parent: parent?.toJson(),
          message: error.message,
        });
        return { continue: false, success: false };
      }
      throw error;
    }
  }
}
