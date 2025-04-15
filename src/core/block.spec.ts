import { BlockOutput } from "@types";

import { ILegoClient } from "@types";
import { Block } from "./block.ts";

import { mock } from "vitest-mock-extended";

describe("block.toJson", () => {
  it("returns a serialised version of the block", () => {
    class Foo extends Block {
      public override name = "test-block";

      public override typeString = "foo-type";

      public override run(): BlockOutput<void> | Promise<BlockOutput<void>> {
        throw new Error();
      }
      public constructor() {
        super("foo-id");
      }
    }

    const foo = new Foo();

    expect(foo.toJson()).toEqual({
      type: "foo-type",
      id: "foo-id",
      name: "test-block",
    });
  });
});
describe("block.validate", () => {
  it("does not error", async () => {
    class Foo extends Block {
      public override name = "test-block";

      public override typeString = "foo-type";

      public override run(): BlockOutput<void> | Promise<BlockOutput<void>> {
        throw new Error();
      }
      public constructor() {
        super("foo-id");
      }
    }

    const foo = new Foo();

    const client = mock<ILegoClient>();

    await expect(foo.validate(client)).resolves.not.toThrow();
  });
});
