import { Block } from "@building-blocks";

/**
 * Given an array of blocks, get the input type from the first block
 *
 * @alpha
 */
export type GetSequenceInput<T extends ReadonlyArray<any>> =
  T extends readonly [infer First, ...any]
    ? First extends Block<any, any>
      ? InputType<First>
      : never
    : never;

/**
 * Given an array of blocks, get the output type from the last block
 *
 * @alpha
 */
export type GetSequenceOutput<T extends ReadonlyArray<any>> =
  T extends readonly [...any, infer Last]
    ? Last extends Block<any, any>
      ? OutputType<Last>
      : never
    : never;

/**
 * Given a block, extract the input type
 *
 * @alpha
 */
export type InputType<T extends Block<any, any>> = Exclude<
  T["inputType"],
  undefined
>;

/**
 * Given a block, extract the output type
 *
 * @alpha
 */
export type OutputType<T extends Block<any, any>> = Exclude<
  T["outputType"],
  undefined
> extends Promise<infer T>
  ? T
  : Exclude<T["outputType"], undefined>;

/**
 * @alpha
 */
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
