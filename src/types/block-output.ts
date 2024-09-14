export type BlockOutput<O> =
  | ContinueOutput<O>
  | StopOutput
  | ConditionResult<O>;

/**
 * @alpha
 */
export interface ContinueOutput<O> {
  continue: true;
  type: "block";
  output: O;
}

export interface ConditionResult<O> {
  continue: true;
  type: "conditional";
  conditionResult: boolean;
  output: O;
}

/**
 * @alpha
 */
export interface StopOutput {
  continue: false;
}
