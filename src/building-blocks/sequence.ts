import { ExecutionMode } from "@types";

import {
  ValidInputOutputSequence,
  BlockRetainType,
  GetSequenceInput,
  GetSequenceOutput,
} from "./valid-input-output-sequence.ts";

import { Automation } from "./automation.ts";

/**
 * @alpha
 */
export const sequence = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const A extends readonly any[],
  I = GetSequenceInput<A>,
  O = GetSequenceOutput<A>,
>(
  actions: BlockRetainType<A> & A & ValidInputOutputSequence<I, O, A>,
  mode: ExecutionMode = ExecutionMode.Restart,
) => {
  return new Automation<A, I, O>({ name: "Run in sequence", mode, actions });
};
