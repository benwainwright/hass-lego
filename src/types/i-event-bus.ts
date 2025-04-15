import { HassLegoEvent } from "./hass-lego-events.ts";

export interface IEventBus {
  emit: (event: HassLegoEvent) => void;
  subscribe: (
    callback: (
      event: HassLegoEvent & { id: string; timestamp: string },
    ) => void,
  ) => void;
}
