import { Action, Block } from "@building-blocks";
import { LegoClient } from "@core";

type AddPromisesToVoids<T> = T extends void ? void | Promise<void> : T;

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

interface Which {
  entity_id?: string;
  area_id?: string;
}

const switchLight = async (
  client: LegoClient,
  onOrOff: "on" | "off",
  target: Which
) => {
  const action = onOrOff === "on" ? "turn_on" : "turn_off";

  await client.callService("light", action, target);
};

export const turnLivingRoomLightsOn = new Action(
  "Turn living room lights on",
  async (client) => {
    await switchLight(client, "on", { area_id: "living_room" });
  }
);
// expands object types one level deep
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// expands object types recursively
type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;

const oneAction = new Action("This thing", (client, input: string) => {
  console.log("something");
  return "string";
});

const twoAction = new Action("This thing", async (client, input: string) => {
  console.log("something");
  return 2;
});

const threeAction = new Action("This thing", async (client, input: number) => {
  console.log("something");
});

const fourAction = new Action("This thing", (client) => {
  console.log("something");
  return 2;
});

type Baz = ValidInputOutputSequence<
  string,
  number,
  readonly [
    typeof oneAction,
    typeof twoAction,
    typeof threeAction,
    typeof fourAction
  ]
>;

type Foo = typeof oneAction;

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
