import { render } from "ink";
import { EventBus } from "./event-bus.ts";
import { Show } from "@show";

/**
 * @alpha
 */
export const renderSimpleLog = (bus: EventBus, staticLog: boolean) => {
  render(<Show events={bus} staticLog={staticLog} />);
};
