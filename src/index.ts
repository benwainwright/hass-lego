export { getConnection } from "@client";

export type {
  CorsOptions,
  ConnectionArgs,
  LegoConnection,
  ILegoClient,
  IEventBus,
  CallServiceParams,
  HassLegoEvent,
} from "@types";

export {
  when,
  action,
  concurrently,
  sequence,
  serviceCall,
  assertion,
  trigger,
  automation
} from "@building-blocks";
