import { mock } from "vitest-mock-extended";
import { Automation } from "./automation.ts";
import { Action } from "./action.ts";
import { when } from "vitest-when";
import { EventBus, LegoClient } from "@core";

describe("Automation", () => {
  it("Executes all the actions and passes the outputs through to the inputs", async () => {
    const mockClient = mock<LegoClient>();

    const input = "foo";

    const action1 = mock<Action<string, number>>();
    const output1 = 2;

    const action2 = mock<Action<number, string>>();
    const output2 = "thing";

    const action3 = mock<Action<string, boolean>>();
    const output3 = false;

    const bus = mock<EventBus>();

    const auto = new Automation({
      name: "Name",
      actions: [action1, action2, action3],
    });

    when(action1.execute)
      .calledWith(mockClient, bus, input, auto)
      .thenResolve({ output: output1, continue: true, success: true });

    when(action2.execute)
      .calledWith(mockClient, bus, output1, auto)
      .thenResolve({ output: output2, success: true, continue: true });

    when(action3.execute)
      .calledWith(mockClient, bus, output2, auto)
      .thenResolve({ output: output3, success: true, continue: true });

    const result = await auto.execute(mockClient, bus, input);

    expect(result).toEqual({ output: output3, success: true, continue: true });
  });
});
