import { mock } from "vitest-mock-extended";
import { when } from "vitest-when";

import { RunQueue, BlockExecutionMode, EventBus, Executor } from "@core";

import { Action } from "./action.ts"
import { Automation } from "./automation.ts"

import { ILegoClient, ExecutionMode } from "@types";
import { ExecutionAbortedError } from "@errors";

vi.mock("@core", async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import("@core")>()),
    RunQueue: vi.fn(),
    Executor: vi.fn(),
  };
});

afterEach(() => {
  vi.resetAllMocks();
});

describe("automation.validate", () => {
  it("calls all of the validate actions on its children, passing the client through completing silently if none of them reject", async () => {
    const mockActionOne = mock<Action<string, string>>();
    const mockActionTwo = mock<Action<string, string>>();
    const mockClient = mock<ILegoClient>();

    const actions = [mockActionOne, mockActionTwo] as const;

    mockActionOne.validate.mockResolvedValue();
    mockActionTwo.validate.mockResolvedValue();

    const mockRunQueue = mock<RunQueue>();
    when(vi.mocked(RunQueue)).calledWith().thenReturn(mockRunQueue);

    const automation = new Automation({
      name: "Test action",
      actions,
      mode: ExecutionMode.Queue,
    });

    await expect(automation.validate(mockClient)).resolves.not.toThrow();
    expect(mockActionOne.validate).toHaveBeenCalledWith(mockClient);
    expect(mockActionTwo.validate).toHaveBeenCalledWith(mockClient);
  });

  it("Rethrows any errors thrown by any of its children", async () => {
    const mockActionOne = mock<Action<string, string>>();
    const mockActionTwo = mock<Action<string, string>>();

    const mockClient = mock<ILegoClient>();

    const actions = [mockActionOne, mockActionTwo] as const;

    const error = new Error("Whoops!");

    mockActionOne.validate.mockResolvedValue();
    mockActionTwo.validate.mockRejectedValue(error);

    const mockRunQueue = mock<RunQueue>();
    when(vi.mocked(RunQueue)).calledWith().thenReturn(mockRunQueue);

    const automation = new Automation({
      name: "Test action",
      actions,
      mode: ExecutionMode.Queue,
    });

    await expect(automation.validate(mockClient)).rejects.toThrow(error);
  });
});

describe("automation.run", () => {
  it("throws an error if there is no event bus", async () => {
    const actions = [
      mock<Action<string, string>>(),
      mock<Action<string, string>>(),
    ] as const;
    const mockClient = mock<ILegoClient>();
    const triggerId = "trigger-id";
    const input = "foo";

    const automation = new Automation({
      name: "Test action",
      actions,
      mode: ExecutionMode.Queue,
    });

    await expect(
      automation.run(mockClient, input, undefined, triggerId),
    ).rejects.toThrow();
  });

  it("throws an error if there is no trigger id", async () => {
    const actions = [
      mock<Action<string, string>>(),
      mock<Action<string, string>>(),
    ] as const;
    const mockClient = mock<ILegoClient>();
    const events = mock<EventBus>();
    const input = "foo";

    const automation = new Automation({
      name: "Test action",
      actions,
      mode: ExecutionMode.Queue,
    });

    await expect(automation.run(mockClient, input, events)).rejects.toThrow();
  });

  it("If result is undefined, throw an error", async () => {
    const actions = [
      mock<Action<string, string>>(),
      mock<Action<string, string>>(),
    ] as const;
    const mockClient = mock<ILegoClient>();
    const events = mock<EventBus>();
    const triggerId = "trigger-id";
    const input = "foo";

    const mockRunQueue = mock<RunQueue>();
    when(vi.mocked(RunQueue)).calledWith().thenReturn(mockRunQueue);

    const automation = new Automation({
      name: "Test action",
      actions,
      mode: ExecutionMode.Queue,
    });

    const mockExecutor = mock<Executor<string, string>>();

    when(vi.mocked(Executor))
      .calledWith(
        [...actions],
        mockClient,
        events,
        triggerId,
        input,
        BlockExecutionMode.Sequence,
        automation,
      )
      .thenReturn(mockExecutor);

    // eslint-disable-next-line @typescript-eslint/require-await
    mockExecutor.finished.mockImplementation(async () => {
      return [];
    });

    await expect(
      automation.run(mockClient, input, events, triggerId),
    ).rejects.toThrow();
  });

  it("In queue mode passes actions to an executor, enqueues the executor then returns the results when finished", async () => {
    const actions = [
      mock<Action<string, string>>(),
      mock<Action<string, string>>(),
    ] as const;
    const mockClient = mock<ILegoClient>();
    const events = mock<EventBus>();
    const triggerId = "trigger-id";
    const input = "foo";

    const mockRunQueue = mock<RunQueue>();
    when(vi.mocked(RunQueue)).calledWith().thenReturn(mockRunQueue);

    const automation = new Automation({
      name: "Test action",
      actions,
      mode: ExecutionMode.Queue,
    });

    const mockExecutor = mock<Executor<string, string>>();

    when(vi.mocked(Executor))
      .calledWith(
        [...actions],
        mockClient,
        events,
        triggerId,
        input,
        BlockExecutionMode.Sequence,
        automation,
      )
      .thenReturn(mockExecutor);

    // eslint-disable-next-line @typescript-eslint/require-await
    mockExecutor.finished.mockImplementation(async () => {
      return [
        { continue: true, outputType: "block", output: "foo", success: true },
      ];
    });

    const result = await automation.run(mockClient, input, events, triggerId);

    if (result.continue) {
      expect(mockRunQueue.enqueue).toHaveBeenCalled();
      expect(result.output).toEqual("foo");
      expect(result.continue).toEqual(true);
      expect(result.outputType).toEqual("block");
    }

    expect.assertions(4);
  });

  it("If the executor throws any other kind of error, rethrow", async () => {
    const actions = [
      mock<Action<string, string>>(),
      mock<Action<string, string>>(),
    ] as const;
    const mockClient = mock<ILegoClient>();
    const events = mock<EventBus>();
    const triggerId = "trigger-id";
    const input = "foo";

    const mockRunQueue = mock<RunQueue>();
    when(vi.mocked(RunQueue)).calledWith().thenReturn(mockRunQueue);

    const automation = new Automation({
      name: "Test action",
      actions,
      mode: ExecutionMode.Queue,
    });

    const mockExecutor = mock<Executor<string, string>>();

    when(vi.mocked(Executor))
      .calledWith(
        [...actions],
        mockClient,
        events,
        triggerId,
        input,
        BlockExecutionMode.Sequence,
        automation,
      )
      .thenReturn(mockExecutor);

    mockExecutor.finished.mockRejectedValue(new Error("Whoops"));

    await expect(
      automation.run(mockClient, input, events, triggerId),
    ).rejects.toThrow();
  });

  it("If the executor aborts, return a response with continue set to false", async () => {
    const actions = [
      mock<Action<string, string>>(),
      mock<Action<string, string>>(),
    ] as const;
    const mockClient = mock<ILegoClient>();
    const events = mock<EventBus>();
    const triggerId = "trigger-id";
    const input = "foo";

    const mockRunQueue = mock<RunQueue>();
    when(vi.mocked(RunQueue)).calledWith().thenReturn(mockRunQueue);

    const automation = new Automation({
      name: "Test action",
      actions,
      mode: ExecutionMode.Queue,
    });

    const mockExecutor = mock<Executor<string, string>>();

    when(vi.mocked(Executor))
      .calledWith(
        [...actions],
        mockClient,
        events,
        triggerId,
        input,
        BlockExecutionMode.Sequence,
        automation,
      )
      .thenReturn(mockExecutor);

    mockExecutor.finished.mockRejectedValue(
      new ExecutionAbortedError("Execution was aborted"),
    );

    const result = await automation.run(mockClient, input, events, triggerId);

    expect(result.continue).toBeFalsy();
  });

  it("In restart mode passes actions to an executor, restarts the runqueue, enqueues the executor then returns the results when finished", async () => {
    const actions = [
      mock<Action<string, string>>(),
      mock<Action<string, string>>(),
    ] as const;
    const mockClient = mock<ILegoClient>();
    const events = mock<EventBus>();
    const triggerId = "trigger-id";
    const input = "foo";

    const mockRunQueue = mock<RunQueue>();
    when(vi.mocked(RunQueue)).calledWith().thenReturn(mockRunQueue);

    const automation = new Automation({
      name: "Test action",
      actions,
      mode: ExecutionMode.Restart,
    });

    const mockExecutor = mock<Executor<string, string>>();

    when(vi.mocked(Executor))
      .calledWith(
        [...actions],
        mockClient,
        events,
        triggerId,
        input,
        BlockExecutionMode.Sequence,
        automation,
      )
      .thenReturn(mockExecutor);

    // eslint-disable-next-line @typescript-eslint/require-await
    mockExecutor.finished.mockImplementation(async () => {
      return [
        { continue: true, outputType: "block", output: "foo", success: true },
      ];
    });

    const result = await automation.run(mockClient, input, events, triggerId);

    if (result.continue) {
      expect(mockRunQueue.abortAll).toHaveBeenCalled();
      expect(mockRunQueue.enqueue).toHaveBeenCalled();
      expect(result.output).toEqual("foo");
      expect(result.continue).toEqual(true);
      expect(result.outputType).toEqual("block");
    }

    expect.assertions(5);
  });

  it("Defaults to the restart behaviour when no execute mode is supplied", async () => {
    const actions = [
      mock<Action<string, string>>(),
      mock<Action<string, string>>(),
    ] as const;
    const mockClient = mock<ILegoClient>();
    const events = mock<EventBus>();
    const triggerId = "trigger-id";
    const input = "foo";

    const mockRunQueue = mock<RunQueue>();
    when(vi.mocked(RunQueue)).calledWith().thenReturn(mockRunQueue);

    const automation = new Automation({
      name: "Test action",
      actions,
    });

    const mockExecutor = mock<Executor<string, string>>();

    when(vi.mocked(Executor))
      .calledWith(
        [...actions],
        mockClient,
        events,
        triggerId,
        input,
        BlockExecutionMode.Sequence,
        automation,
      )
      .thenReturn(mockExecutor);

    // eslint-disable-next-line @typescript-eslint/require-await
    mockExecutor.finished.mockImplementation(async () => {
      return [
        { continue: true, outputType: "block", output: "foo", success: true },
      ];
    });

    const result = await automation.run(mockClient, input, events, triggerId);

    if (result.continue) {
      expect(mockRunQueue.abortAll).toHaveBeenCalled();
      expect(mockRunQueue.enqueue).toHaveBeenCalled();
      expect(result.output).toEqual("foo");
      expect(result.continue).toEqual(true);
      expect(result.outputType).toEqual("block");
    }

    expect.assertions(5);
  });

  it("In parallel mode calls run() on the executor directly without using the runqueue", async () => {
    const actions = [
      mock<Action<string, string>>(),
      mock<Action<string, string>>(),
    ] as const;
    const mockClient = mock<ILegoClient>();
    const events = mock<EventBus>();
    const triggerId = "trigger-id";
    const input = "foo";

    const mockRunQueue = mock<RunQueue>();
    when(vi.mocked(RunQueue)).calledWith().thenReturn(mockRunQueue);

    const automation = new Automation({
      name: "Test action",
      actions,
      mode: ExecutionMode.Parallel,
    });

    const mockExecutor = mock<Executor<string, string>>();

    when(vi.mocked(Executor))
      .calledWith(
        [...actions],
        mockClient,
        events,
        triggerId,
        input,
        BlockExecutionMode.Sequence,
        automation,
      )
      .thenReturn(mockExecutor);

    // eslint-disable-next-line @typescript-eslint/require-await
    mockExecutor.finished.mockImplementation(async () => {
      return [
        { continue: true, outputType: "block", output: "foo", success: true },
      ];
    });

    const result = await automation.run(mockClient, input, events, triggerId);

    if (result.continue) {
      expect(mockExecutor.run).toHaveBeenCalled();
      expect(mockRunQueue.enqueue).not.toHaveBeenCalled();
      expect(result.output).toEqual("foo");
      expect(result.continue).toEqual(true);
      expect(result.outputType).toEqual("block");
    }

    expect.assertions(5);
  });

  //it("when configured in queue mode, executions are queued", async () => {
  //  const actions = [mock<Action<string, string>>(), mock<Action<string, string>>()] as const
  //
  //  const mockClient = mock<LegoClient>()
  //  const events = mock<EventBus>()
  //  const triggerIdOne = "trigger-id-one"
  //  const triggerIdTwo = "trigger-id-two"
  //  const input = "foo"
  //
  //  let secondActionRun = false;
  //
  //  const automation = new Automation({
  //    name: "Test action",
  //    actions,
  //    mode: ExecutionMode.Queue
  //  })
  //
  //  const mockExecutorOne = mock<Executor<string, string>>()
  //
  //
  //  const runPromiseOne = new Promise<void>((accept) => {
  //    // eslint-disable-next-line @typescript-eslint/require-await
  //    mockExecutorOne.run.mockImplementation(async () => {
  //      accept()
  //      expect(secondActionRun).toEqual(false)
  //    })
  //  })
  //
  //
  //  mockExecutorOne.finished.mockImplementation(async () => {
  //    await runPromiseOne
  //    expect(secondActionRun).toEqual(false)
  //    return [{ continue: true, outputType: "block", output: "foo", success: true }]
  //  })
  //
  //  when(vi.mocked(Executor)).calledWith([...actions], mockClient, events, triggerIdOne, input, BlockExecutionMode.Sequence, automation).thenReturn(mockExecutorOne)
  //
  //  const mockExecutorTwo = mock<Executor<string, string>>()
  //
  //
  //  const runPromiseTwo = new Promise<void>((accept) => {
  //    // eslint-disable-next-line @typescript-eslint/require-await
  //    mockExecutorTwo.run.mockImplementation(async () => {
  //      secondActionRun = true
  //      accept()
  //    })
  //  })
  //
  //
  //  mockExecutorTwo.finished.mockImplementation(async () => {
  //    await runPromiseTwo
  //    return [{ continue: true, outputType: "block", output: "foo", success: true }]
  //  })
  //
  //  when(vi.mocked(Executor)).calledWith([...actions], mockClient, events, triggerIdTwo, input, BlockExecutionMode.Sequence, automation).thenReturn(mockExecutorTwo)
  //
  //
  //  const firstPromise = automation.run(mockClient, input, events, triggerIdOne)
  //  void automation.run(mockClient, input, events, triggerIdTwo)
  //
  //  const result = await firstPromise
  //
  //  if (result.continue) {
  //    expect(result.output).toEqual("foo")
  //    expect(result.continue).toEqual(true)
  //    expect(result.outputType).toEqual("block")
  //  }
  //
  //  expect.assertions(6)
  //})
});
