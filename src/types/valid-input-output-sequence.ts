import { Block } from "@building-blocks";

export type GetSequenceInput<T extends ReadonlyArray<any>> =
  T extends readonly [infer First, ...any]
    ? First extends Block<any, any>
      ? InputType<First>
      : never
    : never;

export type GetSequenceOutput<T extends ReadonlyArray<any>> =
  T extends readonly [...any, infer Last]
    ? Last extends Block<any, any>
      ? OutputType<Last>
      : never
    : never;

type InputType<T extends Block<any, any>> = Exclude<T["inputType"], undefined>;
type OutputType<T extends Block<any, any>> = Exclude<
  T["outputType"],
  undefined
> extends Promise<infer T>
  ? T
  : Exclude<T["outputType"], undefined>;

export type ValidInputOutputSequence<
  I,
  O,
  A extends readonly Block<unknown, unknown>[]
> = A extends readonly [infer Only extends Block<any, any>]
  ? InputType<Only> extends I
    ? OutputType<Only> extends O
      ? readonly [Only]
      : never
    : never
  : A extends readonly [
      infer First extends Block<any, any>,
      ...infer Rest extends readonly Block<unknown, unknown>[]
    ]
  ? InputType<First> extends I
    ? readonly [First, ...ValidInputOutputSequence<OutputType<First>, O, Rest>]
    : never
  : never;
