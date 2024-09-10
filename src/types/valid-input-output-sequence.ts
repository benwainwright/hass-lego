import { Block } from "@building-blocks";

/**
 * Given an array of blocks, get the input type from the first block
 *
 * @alpha
 */
export type GetSequenceInput<T extends ReadonlyArray<unknown>> =
  T extends readonly [infer First, ...unknown[]]
    ? First extends Block<unknown, unknown>
      ? InputType<First>
      : never
    : never;

/**
 * Given an array of blocks, get the output type from the last block
 *
 * @alpha
 */
export type GetSequenceOutput<T extends ReadonlyArray<unknown>> =
  T extends readonly [...unknown[], infer Last]
    ? Last extends Block<unknown, unknown>
      ? OutputType<Last>
      : never
    : never;

/**
 * Given a block, extract the input type
 *
 * @alpha
 */
export type InputType<T extends Block<unknown, unknown>> = Exclude<
  T["inputType"],
  undefined
>;

/**
 * Given a block, extract the output type
 *
 * @alpha
 */
export type OutputType<T extends Block<unknown, unknown>> = Exclude<
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
> = A extends readonly [infer Only extends Block<unknown, unknown>]
  ? InputType<Only> extends I
    ? OutputType<Only> extends O
      ? readonly [Only]
      : never
    : never
  : A extends readonly [
      infer First extends Block<unknown, unknown>,
      ...infer Rest extends readonly Block<unknown, unknown>[]
    ]
  ? InputType<First> extends I
    ? readonly [First, ...ValidInputOutputSequence<OutputType<First>, O, Rest>]
    : never
  : never;
