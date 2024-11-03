import { LegoClient } from "@core";
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

    const result = await action.run(client, input);

    expect(result).toEqual({
      output,
      continue: true,
      outputType: "block"
    });
  });

});
