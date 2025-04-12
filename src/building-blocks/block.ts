import { EventBus, LegoClient } from "@core";
import { BlockOutput } from "@types";

/**
 * @alpha
 */
export abstract class Block<I = void, O = void> {


  public constructor(private _id: string, private children?: Block<unknown, unknown>[]) { }
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

  public async validate(client: LegoClient): Promise<void> {
    await Promise.all(
      this.children?.map(async (action) => {
        await action.validate(client);
      }) ?? [],
    );
  }

  public abstract readonly typeString: string;

  public abstract run(
    client: LegoClient,
    input: I,
    events?: EventBus,
    triggerId?: string,
  ): Promise<BlockOutput<O>> | BlockOutput<O>;
}
