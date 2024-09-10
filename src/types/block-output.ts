export type BlockOutput<O> = ContinueOutput<O> | StopOutput;

export interface ContinueOutput<O> {
  continue: true;
  output: O;
}

export interface StopOutput {
  continue: false;
}
