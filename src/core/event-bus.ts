import EventEmitter from "events";
import { HassLegoEvent } from "@types";
import { v4 } from "uuid";

const AUTOMATION_EVENT = "AUTOMATION_EVENT";

/**
 * @alpha
 */
export class EventBus {
  private bus = new EventEmitter();

  public emit<I, O>(event: HassLegoEvent<I, O>) {
    this.bus.emit(AUTOMATION_EVENT, {
      ...event,
      id: v4(),
      timestamp: new Date().toISOString(),
    });
  }

  public subscribe<I, O>(
    callback: (
      event: HassLegoEvent<I, O> & { id: string; timestamp: string }
    ) => void
  ) {
    this.bus.on(AUTOMATION_EVENT, callback);
  }
}
