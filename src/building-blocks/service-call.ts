import { Action } from "./action.ts";
import { CallServiceCommand } from "homeassistant-typescript";
import { Block } from "@core";

class ServiceCall extends Action {
  public override typeString = "service-call";

  public constructor(
    private readonly serviceConfig: {
      name: string;
      params: Omit<CallServiceCommand, "id" | "type">;
    },
  ) {
    super({
      name: serviceConfig.name,
      callback: async (client) => {
        return await client.callService(serviceConfig.params);
      },
    });
  }

  public override toJson() {
    return {
      type: this.typeString,
      id: this.id,
      name: this.name,
      params: this.serviceConfig.params,
    };
  }
}

export const serviceCall = (serviceConfig: {
  name: string;
  params: Omit<CallServiceCommand, "id" | "type">;
}): Block => {
  return new ServiceCall(serviceConfig);
};
