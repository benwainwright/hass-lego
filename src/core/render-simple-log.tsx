import { render } from "ink";
import { EventBus } from "./event-bus.ts";
import { Show } from "@show";

/**
 * @alpha
 */
export const renderSimpleLog = (bus: EventBus) => {
  render(<Show staticLog events={bus} />);
};
