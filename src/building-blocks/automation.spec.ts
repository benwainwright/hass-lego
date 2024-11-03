import { mock } from "vitest-mock-extended";
import { when } from "vitest-when";

import { BlockExecutionMode, EventBus, Executor, LegoClient } from "@core";
import { Action, Automation } from "@building-blocks";
import { ExecutionMode } from "@types";

vi.mock("@core")

afterEach(() => {
  vi.resetAllMocks()
})

describe("Automation.run", () => {

  it("passes actions to an executor, runs it then returns the result when run in queue mode", async () => {
    const actions = [mock<Action<string, string>>(), mock<Action<string, string>>()] as const

    const mockClient = mock<LegoClient>()
    const events = mock<EventBus>()
    const triggerId = "trigger-id"
    const input = "foo"

    const automation = new Automation({
      name: "Test action",
      actions,
      mode: ExecutionMode.Queue
    })



    const mockExecutor = mock<Executor<string, string>>()

    when(vi.mocked(Executor)).calledWith([...actions], mockClient, events, triggerId, input, BlockExecutionMode.Sequence, automation).thenReturn(mockExecutor)

    const runPromise = new Promise<void>((accept) => {
      // eslint-disable-next-line @typescript-eslint/require-await
      mockExecutor.run.mockImplementation(async () => {
        accept()
      })
    })


    mockExecutor.finished.mockImplementation(async () => {
      await runPromise
      return [{ continue: true, outputType: "block", output: "foo", success: true }]
    })

    const result = await automation.run(mockClient, input, events, triggerId)

    if (result.continue) {
      expect(result.output).toEqual("foo")
      expect(result.continue).toEqual(true)
      expect(result.outputType).toEqual("block")
    }

    expect.assertions(3)
  })

  it("when configured in queue mode, executions are queued", async () => {
    const actions = [mock<Action<string, string>>(), mock<Action<string, string>>()] as const

    const mockClient = mock<LegoClient>()
    const events = mock<EventBus>()
    const triggerIdOne = "trigger-id-one"
    const triggerIdTwo = "trigger-id-two"
    const input = "foo"

    let secondActionRun = false;

    const automation = new Automation({
      name: "Test action",
      actions,
      mode: ExecutionMode.Queue
    })

    const mockExecutorOne = mock<Executor<string, string>>()


    const runPromiseOne = new Promise<void>((accept) => {
      // eslint-disable-next-line @typescript-eslint/require-await
      mockExecutorOne.run.mockImplementation(async () => {
        accept()
        expect(secondActionRun).toEqual(false)
      })
    })


    mockExecutorOne.finished.mockImplementation(async () => {
      await runPromiseOne
      expect(secondActionRun).toEqual(false)
      return [{ continue: true, outputType: "block", output: "foo", success: true }]
    })

    when(vi.mocked(Executor)).calledWith([...actions], mockClient, events, triggerIdOne, input, BlockExecutionMode.Sequence, automation).thenReturn(mockExecutorOne)

    const mockExecutorTwo = mock<Executor<string, string>>()


    const runPromiseTwo = new Promise<void>((accept) => {
      // eslint-disable-next-line @typescript-eslint/require-await
      mockExecutorTwo.run.mockImplementation(async () => {
        secondActionRun = true
        accept()
      })
    })


    mockExecutorTwo.finished.mockImplementation(async () => {
      await runPromiseTwo
      return [{ continue: true, outputType: "block", output: "foo", success: true }]
    })

    when(vi.mocked(Executor)).calledWith([...actions], mockClient, events, triggerIdTwo, input, BlockExecutionMode.Sequence, automation).thenReturn(mockExecutorTwo)


    const firstPromise = automation.run(mockClient, input, events, triggerIdOne)
    void automation.run(mockClient, input, events, triggerIdTwo)

    const result = await firstPromise

    if (result.continue) {
      expect(result.output).toEqual("foo")
      expect(result.continue).toEqual(true)
      expect(result.outputType).toEqual("block")
    }

    expect.assertions(6)
  })
});
