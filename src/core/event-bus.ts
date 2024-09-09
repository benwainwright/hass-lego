import EventEmitter from "events";
import { HassLegoEvent } from "@types";

const AUTOMATION_EVENT = "AUTOMATION_EVENT";

export class EventBus {
  private bus = new EventEmitter();

  public emit<I, O>(event: HassLegoEvent<I, O>) {
    this.bus.emit(AUTOMATION_EVENT, event);
  }

  public subscribe<I, O>(callback: (event: HassLegoEvent<I, O>) => void) {
    this.bus.on(AUTOMATION_EVENT, callback);
  }
}
