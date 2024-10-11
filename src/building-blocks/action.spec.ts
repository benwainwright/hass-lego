import { EventBus, LegoClient } from "@core";
import { Action } from "./action.ts";
import { mock } from "vitest-mock-extended";
import { when } from "vitest-when";

describe("the action block", () => {
  it("calls the callback when executed and passes the result out as output", async () => {
    const callback = vi.fn();

    const client = mock<LegoClient>();
    const input = "input";
    const output = "output";

    when(callback).calledWith(client, input).thenResolve(output);

    const action = new Action<string, string>({
      name: "This is my name",
      callback,
    });

    const result = await action.run(input, "trigger");

    expect(result).toEqual({
      output,
      success: true,
      continue: true,
      type: "block",
    });
  });

  it("returns a failure result when an error is thrown", async () => {
    const callback = vi.fn();

    const client = mock<LegoClient>();
    const input = "input";

    when(callback)
      .calledWith(client, input)
      .thenReject(new Error("Failed to run callback"));

    const action = new Action<string, string>({
      name: "This is my name",
      callback,
    });

    const result = await action.run(client, input);

    expect(result).toEqual({ continue: false, success: false });
  });

  it("rethrows error when something other than an error is thrown", async () => {
    const callback = vi.fn();

    const client = mock<LegoClient>();
    const bus = mock<EventBus>();
    const input = "input";

    when(callback).calledWith(client, input).thenReject("A string?");

    const action = new Action<string, string>({
      name: "This is my name",
      callback,
    });

    await expect(action.execute(client, bus, input, "trigger")).rejects.toThrow(
      "A string?",
    );
  });
});
