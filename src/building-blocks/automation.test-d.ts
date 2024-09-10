import { Action } from "./action.ts";
import { Automation } from "./automation.ts";
import { Trigger } from "./trigger.ts";

describe("the automation class", () => {
  it("should correctly type the sequence when there is only one item and that item has inputs and outputs", () => {
    const oneAction = new Action({
      name: "This thing",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      callback: (client, input: string) => {
        const foo = 3;
        return foo;
      },
    });

    const foo = new Automation({
      name: "this automation",
      actions: [oneAction],
    });

    expectTypeOf(foo).toMatchTypeOf<
      Automation<readonly [typeof oneAction], string, number>
    >();
  });

  it("should correctly type the sequence when there is only one item and that item has no inputs and outputs", () => {
    const oneAction = new Action({
      name: "This thing",
      callback: () => {
        console.log("something");
      },
    });

    const foo = new Automation({
      name: "this automation",
      actions: [oneAction],
    });

    expectTypeOf(foo).toMatchTypeOf<
      Automation<readonly [typeof oneAction], void, void>
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

    const foo = new Automation({
      name: "this automation",
      actions: [oneAction],
    });

    expectTypeOf(foo).toMatchTypeOf<
      Automation<readonly [typeof oneAction], string, void>
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

    const foo = new Automation({
      name: "this automation",
      actions: [oneAction],
    });

    expectTypeOf(foo).toMatchTypeOf<
      Automation<readonly [typeof oneAction], void, number>
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

    const foo = new Automation({
      name: "this automation",
      actions: [oneAction, twoAction],
    });

    expectTypeOf(foo).toMatchTypeOf<
      Automation<readonly [typeof oneAction, typeof twoAction], void, void>
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

    const foo = new Automation({
      name: "this automation",
      actions: [oneAction, twoAction],
    });

    expectTypeOf(foo).toMatchTypeOf<
      Automation<readonly [typeof oneAction, typeof twoAction], string, void>
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

    const foo = new Automation({
      name: "this automation",
      actions: [oneAction, twoAction],
    });

    expectTypeOf(foo).toMatchTypeOf<
      Automation<readonly [typeof oneAction, typeof twoAction], void, number>
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

    const foo = new Automation({
      name: "this automation",
      actions: [oneAction, twoAction],
    });

    expectTypeOf(foo).toMatchTypeOf<
      Automation<readonly [typeof oneAction, typeof twoAction], string, number>
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

    const foo = new Automation({
      name: "this automation",
      actions: [oneAction, twoAction, threeAction, fourAction],
    });

    expectTypeOf(foo).toMatchTypeOf<
      Automation<
        readonly [
          typeof oneAction,
          typeof twoAction,
          typeof threeAction,
          typeof fourAction
        ],
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

    const foo = new Automation({
      name: "this automation",
      actions: [oneAction, twoAction, threeAction, fourAction],
    });

    expectTypeOf(foo).toMatchTypeOf<
      Automation<
        readonly [
          typeof oneAction,
          typeof twoAction,
          typeof threeAction,
          typeof fourAction
        ],
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

    const foo = new Automation({
      name: "this automation",
      actions: [oneAction, twoAction, threeAction, fourAction],
    });

    expectTypeOf(foo).toMatchTypeOf<
      Automation<
        readonly [
          typeof oneAction,
          typeof twoAction,
          typeof threeAction,
          typeof fourAction
        ],
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

    const trigger = new Trigger("test", "foo", () => ({
      result: true,
      output: 2,
    }));

    const foo = new Automation({
      trigger,
      name: "this automation",
      actions: [oneAction, twoAction, threeAction] as const,
    });

    expectTypeOf(foo).toMatchTypeOf<
      Automation<
        readonly [typeof oneAction, typeof twoAction, typeof threeAction],
        number,
        void
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

    new Automation({
      name: "this automation",
      // @ts-expect-error Expected error - the types don't link!
      actions: [oneAction, twoAction, threeAction, fourAction],
    });
  });
});
