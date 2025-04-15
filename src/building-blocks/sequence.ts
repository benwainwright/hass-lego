import { ExecutionMode } from "@types";

import {
  ValidInputOutputSequence,
  BlockRetainType,
  GetSequenceInput,
  GetSequenceOutput,
} from "./valid-input-output-sequence.ts";

import { automation } from "./automation.ts";
import { Block } from "@core";

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
): Block<I, O> => {
  return automation({ name: "Run in sequence", mode, actions });
};
