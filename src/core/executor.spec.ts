import { Action } from "@building-blocks"
import { BlockExecutionMode, Executor } from "./executor.ts"
import { mock } from "vitest-mock-extended"
import { EventBus, LegoClient } from "@core"
import { when } from "vitest-when"
import { v4 } from "uuid";

vi.mock("uuid")

afterEach(() => {
  vi.resetAllMocks()
})

describe("executor", () => {
  it("emits all the correct messages when blocks are executed", async () => {
    const actionOne = mock<Action<string, string>>({ name: "foo", typeString: "action", toJson: () => ({ type: "action", id: "foo", name: "foo" }) });
    const actionTwo = mock<Action<string, string>>({ name: "bar", typeString: "action", toJson: () => ({ type: "action", id: "bar", name: "bar" }) });
    const actionThree = mock<Action<string, string>>({ name: "baz", typeString: "action", toJson: () => ({ type: "action", id: "baz", name: "baz" }) });


    const mockClient = mock<LegoClient>()
    const events = mock<EventBus>()
    const triggerId = "trigger-id"
    const input = "foo"

    when(actionOne.run).calledWith(mockClient, input, events, triggerId).thenResolve(
      {
        continue: true,
        outputType: "block",
        output: "bar"
      })

    when(actionTwo.run).calledWith(mockClient, "bar", events, triggerId).thenResolve(
      {
        continue: true,
        outputType: "block",
        output: "baz"
      })

    when(actionThree.run).calledWith(mockClient, "baz", events, triggerId).thenResolve(
      {
        continue: true,
        outputType: "block",
        output: "bif"
      })

    const actions = [
      actionOne, actionTwo, actionThree
    ] as const

    vi.mocked(v4).mockReturnValueOnce("one").mockReturnValueOnce("two").mockReturnValueOnce("three")

    const executor = new Executor(
      [...actions],
      mockClient,
      events,
      triggerId,
      input,
      BlockExecutionMode.Sequence
    )


    void executor.run()



    const calls = events.emit.mock.calls

    expect(calls[0]).toEqual([{
      executeId: "one",
      triggerId,
      type: "action",
      name: "foo",
      block: { type: "action", id: "foo", name: "foo" },
      triggeredBy: undefined,
      parent: undefined,
      status: "pending"
    }])

    expect(calls[1]).toEqual([{
      executeId: "two",
      triggerId,
      type: "action",
      name: "bar",
      block: { type: "action", id: "bar", name: "bar" },
      triggeredBy: undefined,
      parent: undefined,
      status: "pending"
    }])

    expect(calls[2]).toEqual([{
      executeId: "three",
      triggerId,
      type: "action",
      name: "baz",
      block: { type: "action", id: "baz", name: "baz" },
      triggeredBy: undefined,
      parent: undefined,
      status: "pending"
    }])

    await executor.finished()

    expect(calls[3]).toEqual([{
      executeId: "one",
      triggerId,
      type: "action",
      name: "foo",
      block: { type: "action", id: "foo", name: "foo" },
      triggeredBy: undefined,
      parent: undefined,
      status: "started"
    }])


    expect(calls[4]).toEqual([{
      executeId: "one",
      triggerId,
      type: "action",
      name: "foo",
      block: { type: "action", id: "foo", name: "foo" },
      triggeredBy: undefined,
      parent: undefined,
      status: "finished",
      continue: true,
      outputType: "block",
      output: {
        continue: true,
        outputType: "block",
        output: "bar"
      }
    }])

    expect(calls[5]).toEqual([{
      executeId: "two",
      triggerId,
      type: "action",
      name: "bar",
      block: { type: "action", id: "bar", name: "bar" },
      triggeredBy: undefined,
      parent: undefined,
      status: "started"
    }])

    expect(calls[6]).toEqual([{
      executeId: "two",
      triggerId,
      type: "action",
      name: "bar",
      block: { type: "action", id: "bar", name: "bar" },
      triggeredBy: undefined,
      parent: undefined,
      status: "finished",
      continue: true,
      outputType: "block",
      output: {
        continue: true,
        outputType: "block",
        output: "baz"
      }
    }])

    expect(calls[7]).toEqual([{
      executeId: "three",
      triggerId,
      type: "action",
      name: "baz",
      block: { type: "action", id: "baz", name: "baz" },
      triggeredBy: undefined,
      parent: undefined,
      status: "started"
    }])

    expect(calls[8]).toEqual([{
      executeId: "three",
      triggerId,
      type: "action",
      name: "baz",
      block: { type: "action", id: "baz", name: "baz" },
      triggeredBy: undefined,
      parent: undefined,
      status: "finished",
      continue: true,
      outputType: "block",
      output: {
        continue: true,
        outputType: "block",
        output: "bif"
      }
    }])
  })

  it("runs all the blocks and feeds inputs through to outputs", async () => {
    const actionOne = mock<Action<string, string>>();
    const actionTwo = mock<Action<string, string>>();
    const actionThree = mock<Action<string, string>>();


    const mockClient = mock<LegoClient>()
    const events = mock<EventBus>()
    const triggerId = "trigger-id"
    const input = "foo"

    when(actionOne.run).calledWith(mockClient, input, events, triggerId).thenResolve(
      {
        continue: true,
        outputType: "block",
        output: "bar"
      })

    when(actionTwo.run).calledWith(mockClient, "bar", events, triggerId).thenResolve(
      {
        continue: true,
        outputType: "block",
        output: "baz"
      })

    when(actionThree.run).calledWith(mockClient, "baz", events, triggerId).thenResolve(
      {
        continue: true,
        outputType: "block",
        output: "bif"
      })

    const actions = [
      actionOne, actionTwo, actionThree
    ] as const


    const executor = new Executor(
      [...actions],
      mockClient,
      events,
      triggerId,
      input,
      BlockExecutionMode.Sequence
    )


    void executor.run()

    const [result] = await executor.finished()

    expect(result?.continue).toEqual(true)
    if (result?.continue) {
      expect(result.outputType).toEqual("block")
      expect(result.continue).toEqual(true)
      expect(result.success).toEqual(true)
      expect(result.output).toEqual("bif")
    }
  })
})
