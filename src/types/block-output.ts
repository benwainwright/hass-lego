export type BlockOutput<O> =
  | ContinueOutput<O>
  | StopOutput
  | ConditionResult<O>;

/**
 * @alpha
 */
export interface ContinueOutput<O> {
  continue: true;
  outputType: "block";
  output: O;
}

export interface ConditionResult<O> {
  continue: true;
  outputType: "conditional";
  conditionResult: boolean;
  output: O;
}

/**
 * @alpha
 */
export interface StopOutput {
  continue: false;
}
