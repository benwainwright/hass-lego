export type Context = {
  id: string;
  user_id: string | null;
  parent_id: string | null;
};

export type HassEventBase = {
  origin: string;
  time_fired: string;
  context: Context;
};

export type HassEvent = HassEventBase & {
  event_type: string;
  data: { [key: string]: any };
};

export type HassStateChangedEvent = HassEventBase & {
  event_type: "state_changed";
  data: {
    entity_id: string;
    new_state: HassEntity | null;
    old_state: HassEntity | null;
  };
};

export type HassEntityBase = {
  entity_id: string;
  state: string;
  last_changed: string;
  last_updated: string;
  attributes: HassEntityAttributeBase;
  context: Context;
};

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

export type HassEntity = HassEntityBase & {
  attributes: { [key: string]: any };
};
