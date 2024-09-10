import { HassLegoEvent } from "@types";

export const getIndexString = (event: HassLegoEvent) => {
  if ("name" in event) {
    return `${event.name}-${event.status}-${event.type}`;
  }
};
