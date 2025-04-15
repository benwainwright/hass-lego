import { mock } from "vitest-mock-extended";
import { when } from "vitest-when";
import { Assertion } from "./assertion.ts";
import { md5 } from "@utils";
import { ILegoClient } from "@types";

vi.mock("@utils");

beforeEach(() => {
  vi.resetAllMocks();
});

describe("assertion.run", () => {
  it("calls the predicate and extracts the condition result from the object if it returns an object", async () => {
    const mockClient = mock<ILegoClient>();
    const predicate = vi.fn();
    const input = "foo";
    when(predicate)
      .calledWith(mockClient, input)
      .thenReturn({ result: true, output: "foo" });

    const assertion = new Assertion({
      name: "foo",
      id: "foo-id",
      predicate,
    });

    const result = await assertion.run(mockClient, input);
    expect(result).toEqual({
      outputType: "conditional",
      continue: true,
      conditionResult: true,
      output: "foo",
    });
  });

  it("awaits promises when async functions are supplied as predicates", async () => {
    const mockClient = mock<ILegoClient>();
    const input = "foo";

    const predicate = async (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _client: ILegoClient,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _input: string | undefined,
      // eslint-disable-next-line @typescript-eslint/require-await
    ) => true;

    const assertion = new Assertion({
      name: "foo",
      id: "foo-id",
      predicate,
    });

    const result = await assertion.run(mockClient, input);
    expect(result).toEqual({
      outputType: "conditional",
      continue: true,
      conditionResult: true,
      output: undefined,
    });
  });

  it("generates an md5 hash of the name the id if not supplied", () => {
    when(md5).calledWith("foo").thenReturn("hash");

    const assertion = new Assertion({
      name: "foo",
      predicate: vi.fn(),
    });

    expect(assertion.id).toEqual("hash");
  });

  it("configures the id from the constructor input when supplied", () => {
    const assertion = new Assertion({
      name: "foo",
      id: "foo-id",
      predicate: vi.fn(),
    });

    expect(assertion.id).toEqual("foo-id");
  });

  it("calls the predicate and returns the result as the condition result if it returns a boolean", async () => {
    const mockClient = mock<ILegoClient>();
    const predicate = vi.fn();
    const input = "foo";
    when(predicate).calledWith(mockClient, input).thenReturn(false);

    const assertion = new Assertion({
      name: "foo",
      id: "foo-id",
      predicate,
    });

    const result = await assertion.run(mockClient, input);
    expect(result).toEqual({
      outputType: "conditional",
      continue: true,
      conditionResult: false,
      output: undefined,
    });
  });
});
