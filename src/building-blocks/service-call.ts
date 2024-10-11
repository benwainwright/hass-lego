import { Action } from "./action.ts";
import { CallServiceCommand, State } from "homeassistant-typescript";

/**
 * @alpha
 */
export class ServiceCall extends Action {

  public override typeString = "service-call";

  private response: State[] | undefined;

  public constructor(
    private readonly serviceConfig: {
      name: string;
      params: Omit<CallServiceCommand, "id" | "type">;
    },
  ) {
    super({
      name: serviceConfig.name,
      callback: async (client) => {
        this.response = await client.callService(serviceConfig.params);
      },
    });
  }

  public override toJson() {
    return {
      type: this.typeString,
      id: this.id,
      name: this.name,
      params: this.serviceConfig.params,
      response: this.response,
    };
  }
}
