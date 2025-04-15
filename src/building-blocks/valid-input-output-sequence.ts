import { Block } from "@core";

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
export type OutputType<T extends Block<unknown, unknown>> =
  Exclude<T["outputType"], undefined> extends Promise<infer T>
    ? T
    : Exclude<T["outputType"], undefined>;

export type OutputTypeKeepPromise<T extends Block<unknown, unknown>> = Exclude<
  T["outputType"],
  undefined
>;

/**
 * @alpha
 */
export type ValidInputOutputSequence<
  I,
  O,
  A extends readonly Block<unknown, unknown>[],
> = A extends readonly [infer Only extends Block<unknown, unknown>]
  ? InputType<Only> extends I
    ? OutputType<Only> extends O
      ? readonly [Only]
      : never
    : never
  : A extends readonly [
        infer First extends Block<unknown, unknown>,
        ...infer Rest extends readonly Block<unknown, unknown>[],
      ]
    ? InputType<First> extends I
      ? readonly [
          First,
          ...ValidInputOutputSequence<OutputType<First>, O, Rest>,
        ]
      : never
    : never;

/**
 * Get all of the outputs of a sequence of blocks
 *
 * @alpha
 */
export type GetOutputs<T extends readonly Block<unknown, unknown>[]> =
  T extends readonly [
    infer First extends Block<unknown, unknown>,
    ...infer Rest extends Block<unknown, unknown>[],
  ]
    ? readonly [OutputType<First>, ...GetOutputs<Rest>]
    : readonly [];

/**
 * Get all of the results of a sequence of blocks
 *
 * @alpha
 */
export type GetResults<T extends readonly Block<unknown, unknown>[]> =
  T extends readonly [
    infer First extends Block<unknown, unknown>,
    ...infer Rest extends Block<unknown, unknown>[],
  ]
    ? readonly [
        { continue: boolean; output: OutputType<First> },
        ...GetOutputs<Rest>,
      ]
    : readonly [];

/**
 * Rehyrdate a sequence of blocks with its in and out types
 */
export type BlockRetainType<A extends readonly Block<unknown, unknown>[]> =
  A extends readonly [
    infer First extends Block<unknown, unknown>,
    ...infer Rest extends readonly Block<unknown, unknown>[],
  ]
    ? readonly [
        Block<InputType<First>, OutputTypeKeepPromise<First>>,
        ...BlockRetainType<Rest>,
      ]
    : readonly [];
