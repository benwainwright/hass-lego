import { Action } from "./action.ts";
import { CallServiceCommand } from "homeassistant-typescript";

export class ServiceCall extends Action {
  private target: CallServiceCommand["target"];

  public constructor(config: {
    name: string;
    params: Omit<CallServiceCommand, "id" | "type">;
  }) {
    super({
      name: config.name,
      callback: (client) => {
        return client.callService(config.params);
      },
    });

    this.target = config.params.target;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  override async validate() {}
}
