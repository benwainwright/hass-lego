export type BlockOutput<O> = ContinueOutput<O> | StopOutput;

/**
 * @alpha
 */
export interface ContinueOutput<O> {
  continue: true;
  output: O;
}

/**
 * @alpha
 */
export interface StopOutput {
  continue: false;
}
