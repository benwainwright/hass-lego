import { mock } from "vitest-mock-extended";
import { Action } from "./action.ts";
import { automation } from "./automation.ts";
import { Block } from "@core"
import { ITrigger } from "@types";

describe("the automation class", () => {
  it("should correctly type the sequence when there is only one item and that item has inputs and outputs", () => {
    const oneAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: (_client, input: string) => {
        const foo = 3;
        return foo;
      },
    });

    const foo = automation({
      name: "this automation",
      actions: [oneAction] as const,
    });

    expectTypeOf(foo).toExtend<
      Block<string, number>
    >();
  });

  it("should correctly type the sequence when there is only one item and that item has no inputs and outputs", () => {
    const oneAction = new Action({
      name: "This thing",
      callback: () => {
        console.log("something");
      },
    });

    const foo = automation({
      name: "this automation",
      actions: [oneAction],
    });

    expectTypeOf(foo).toExtend<
      Block
    >();
  });

  it("should correctly type the sequence when there is only one item that has an input but no outputs", () => {
    const oneAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: (client, input: string) => {
        console.log("something");
      },
    });

    const foo = automation({
      name: "this automation",
      actions: [oneAction],
    });

    expectTypeOf(foo).toExtend<
      Block<string>
    >();
  });

  it("should correctly type the sequence when there is only one item that has an output but no inputs", () => {
    const oneAction = new Action({
      name: "This thing",
      callback: () => {
        console.log("something");
        return 2;
      },
    });

    const foo = automation({
      name: "this automation",
      actions: [oneAction],
    });

    expectTypeOf(foo).toExtend<
      Block<void, number>
    >();
  });

  it("should correctly type the sequence when there is two items that have no inputs and outputs", () => {
    const oneAction = new Action({
      name: "This thing",
      callback: () => {
        console.log("something");
      },
    });

    const twoAction = new Action({
      name: "This thing",
      callback: () => {
        console.log("something");
      },
    });

    const foo = automation({
      name: "this automation",
      actions: [oneAction, twoAction],
    });

    expectTypeOf(foo).toExtend<
      Block
    >();
  });

  it("should correctly type the start of the sequence when there is two items but the one at the start has an input", () => {
    const oneAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: (client, input: string) => {
        console.log("something");
      },
    });

    const twoAction = new Action({
      name: "This thing",
      callback: () => {
        console.log("something");
      },
    });

    const foo = automation({
      name: "this automation",
      actions: [oneAction, twoAction],
    });

    expectTypeOf(foo).toExtend<
      Block<string>
    >();
  });

  it("should correctly type the start of the sequence when there is two items but the one at the end has an output", () => {
    const oneAction = new Action({
      name: "This thing",
      callback: () => {
        console.log("something");
      },
    });

    const twoAction = new Action({
      name: "This thing",
      callback: () => {
        console.log("something");
        return 2;
      },
    });

    const foo = automation({
      name: "this automation",
      actions: [oneAction, twoAction],
    });

    expectTypeOf(foo).toExtend<
      Block<void, number>
    >();
  });

  it("should correctly type the start of the sequence when there is two items and the one at the start has an input and the one at the end has an output", () => {
    const oneAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: (client, input: string) => {
        console.log("something");
      },
    });

    const twoAction = new Action({
      name: "This thing",
      callback: () => {
        console.log("something");
        return 2;
      },
    });

    const foo = automation({
      name: "this automation",
      actions: [oneAction, twoAction],
    });

    expectTypeOf(foo).toExtend<
      Block<string, number>
    >();
  });

  it("should correctly type the start and end of the sequence when there is four items ", () => {
    const oneAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: (client, input: string) => {
        console.log("something");
      },
    });

    const twoAction = new Action({
      name: "This thing",
      callback: () => {
        console.log("something");
      },
    });

    const threeAction = new Action({
      name: "This thing",
      callback: () => {
        console.log("something");
      },
    });

    const fourAction = new Action({
      name: "This thing",
      callback: () => {
        console.log("something");
        return 2;
      },
    });

    const foo = automation({
      name: "this automation",
      actions: [oneAction, twoAction, threeAction, fourAction] as const,
    });

    expectTypeOf(foo).toExtend<
      Block<
        string,
        number
      >
    >();
  });

  it("should correctly type the object when the types of the actions link together", () => {
    const oneAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: (client, input: string) => {
        console.log("something");
        return "string";
      },
    });

    const twoAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: (client, input: string) => {
        console.log("something");
        return 2;
      },
    });

    const threeAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: (client, inpput: number) => {
        console.log("something");
      },
    });

    const fourAction = new Action({
      name: "This thing",
      callback: () => {
        console.log("something");
        return 2;
      },
    });

    const foo = automation({
      name: "this automation",
      actions: [oneAction, twoAction, threeAction, fourAction],
    });

    expectTypeOf(foo).toExtend<
      Block<
        string,
        number
      >
    >();
  });

  it("should still correctly link up type even if some of the return types are wrapped in promises", () => {
    const oneAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: (client, input: string) => {
        console.log("something");
        return "string";
      },
    });

    const twoAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
      callback: async (client, input: string) => {
        console.log("something");
        return 2;
      },
    });

    const threeAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: (client, input: number) => {
        console.log("something");
      },
    });

    const fourAction = new Action({
      name: "This thing",
      callback: () => {
        console.log("something");
        return 2;
      },
    });

    const foo = automation({
      name: "this automation",
      actions: [oneAction, twoAction, threeAction, fourAction],
    });

    expectTypeOf(foo).toExtend<
      Block<
        string,
        number
      >
    >();
  });

  it("If the trigger has an output, set that to the automation input", () => {
    const oneAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: (client, input: number) => {
        console.log("something");
        return "string";
      },
    });

    const twoAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: (client, input: string) => {
        console.log("something");
        return 2;
      },
    });

    const threeAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: (client, input: number) => {
        console.log("something");
      },
    });

    const trigger = mock<ITrigger>();

    const foo = automation({
      trigger,
      name: "this automation",
      actions: [oneAction, twoAction, threeAction] as const,
    });

    expectTypeOf(foo).toExtend<
      Block<
        number
      >
    >();
  });

  it("should produce an error when the types don't link up", () => {
    const oneAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: (client, input: string) => {
        console.log("something");
        return "string";
      },
    });

    const twoAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: (client, input: string) => {
        console.log("something");
        return 2;
      },
    });

    const threeAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: (client, input: string) => {
        console.log("something");
      },
    });

    const fourAction = new Action({
      name: "This thing",
      callback: () => {
        console.log("something");
        return 2;
      },
    });

    automation({
      name: "this automation",
      // @ts-expect-error Expected error - the types don't link!
      actions: [oneAction, twoAction, threeAction, fourAction],
    });
  });
});
