import { mock } from "vitest-mock-extended";
import { when } from "vitest-when";

type AnyFunction = (...args: never[]) => unknown;

export const mockFromConstructor = <C extends AnyFunction>(
  constructor: C,
  ...args: Parameters<C>
) => {
  const mockThing = mock<ReturnType<C>>();
  when<C>(constructor)
    .calledWith(...args)
    .thenReturn(mockThing);
  return mockThing;
};
