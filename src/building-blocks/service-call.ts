import { Action } from "./action.ts";
import {
  CallServiceCommand,
  CallServiceResponse,
} from "homeassistant-typescript";

/**
  * @alpha
  */
export class ServiceCall extends Action {
  private target: CallServiceCommand["target"];

  public override typeString = "service-call";

  private response: CallServiceResponse | undefined;

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
