import { AutomationSequenceEvent } from "@types";

export type ValidInputOutputSequence<
  I,
  O,
  E extends ReadonlyArray<AutomationSequenceEvent<any, any>>
> = E extends readonly [infer Item extends AutomationSequenceEvent<I, O>]
  ? ReadonlyArray<Item>
  : E extends readonly [
      infer First extends AutomationSequenceEvent<I, O>,
      ...infer Rest extends ReadonlyArray<AutomationSequenceEvent<any, any>>
    ]
  ? First extends AutomationSequenceEvent<I, infer Out>
    ? readonly [
        First,
        ...ValidInputOutputSequence<ValidInputType<Out>, O, Rest>
      ]
    : never
  : never;

type ValidInputType<T> = T extends unknown ? void : T;
