/**
 * @alpha
 */
export type HassContext = {
  id: string;
  user_id: string | null;
  parent_id: string | null;
};

/**
 * @alpha
 */
export type HassEventBase = {
  origin: string;
  time_fired: string;
  context: HassContext;
};

/**
 * @alpha
 */
export type HassEvent = HassEventBase & {
  event_type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: { [key: string]: any };
};

/**
 * @alpha
 */
export type HassStateChangedEvent = HassEventBase & {
  event_type: "state_changed";
  data: {
    entity_id: string;
    new_state: HassEntity | null;
    old_state: HassEntity | null;
  };
};

/**
 * @alpha
 */
export type HassEntityBase = {
  entity_id: string;
  state: string;
  last_changed: string;
  last_updated: string;
  attributes: HassEntityAttributeBase;
  context: HassContext;
};

/**
 * @alpha
 */
export type HassEntityAttributeBase = {
  friendly_name?: string;
  unit_of_measurement?: string;
  icon?: string;
  entity_picture?: string;
  supported_features?: number;
  hidden?: boolean;
  assumed_state?: boolean;
  device_class?: string;
  state_class?: string;
  restored?: boolean;
};

/**
 * @alpha
 */
export type HassEntity = HassEntityBase & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: { [key: string]: any };
};
