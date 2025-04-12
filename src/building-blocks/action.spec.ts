import { LegoClient } from "@core";
import { Action } from "./action.ts";
import { mock } from "vitest-mock-extended";
import { when } from "vitest-when";

describe("the action block", () => {

  it("calls the callback when executed and passes the result out as output", async () => {

    const client = mock<LegoClient>();
    const input = "input";
    const output = "output";

    const callback = (_client: LegoClient, _input: string | undefined) => "output"

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

  it("awaits promises when callback is async", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
    const callback = async (_client: LegoClient, _input: string | undefined) => "output"

    const client = mock<LegoClient>();
    const input = "input";
    const output = "output";

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
