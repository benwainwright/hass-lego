import { HassLegoEvent } from "@types";

export const getIndexString = (event: HassLegoEvent<unknown, unknown>) => {
  if ("name" in event) {
    return `${event.name}-${event.status}-${event.type}`;
  }
};
