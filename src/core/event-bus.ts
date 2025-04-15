import EventEmitter from "events";
import { HassLegoEvent, IEventBus } from "@types";
import { v4 } from "uuid";

const AUTOMATION_EVENT = "AUTOMATION_EVENT";

/**
 * @alpha
 */
export class EventBus implements IEventBus {
  private bus = new EventEmitter();

  public emit(event: HassLegoEvent) {
    this.bus.emit(AUTOMATION_EVENT, {
      ...event,
      id: v4(),
      timestamp: new Date().toISOString(),
    });
  }

  public subscribe(
    callback: (
      event: HassLegoEvent & { id: string; timestamp: string },
    ) => void,
  ) {
    this.bus.on(AUTOMATION_EVENT, callback);
  }
}
