import { md5 } from "@utils";
import { IfThenElseCondition } from "@building-blocks"
import { Assertion } from "./assertion.ts"
import { when } from "vitest-when";
import { Block } from "./block.ts"
import { mock } from "vitest-mock-extended";
import { EventBus, LegoClient } from "@core";
import { ContinueOutput } from "@types";

vi.mock("@utils")

beforeEach(() => {
  vi.resetAllMocks()
})

describe("ifThenElseCondition.run", () => {
  it("returns continue straight away without running branches when assertionResult.continue is false", async () => {

    const mockAssertion = mock<Assertion<string, boolean>>()
    mockAssertion.run.mockResolvedValue(
      {
        outputType: "conditional",
        continue: false as true,
        conditionResult: false,
        output: false,
      }
    )

    const mockThenBlock = mock<Block<boolean>>()
    const mockElseBlock = mock<Block<boolean>>()


    const condition = new IfThenElseCondition({
      name: "foo",
      assertion: mockAssertion,
      then: mockThenBlock,
      else: mockElseBlock
    })

    const mockClient = mock<LegoClient>()
    const result = await condition.run(mockClient, "foo")

    expect(mockThenBlock.run).not.toHaveBeenCalled()
    expect(mockElseBlock.run).not.toHaveBeenCalled()
    expect(result.continue).toEqual(false)

  })

  it("Executes the 'then' branch asnd returns the result when condition is true", async () => {

    const mockAssertion = mock<Assertion<string, boolean>>()
    const mockAssertionOutput = false;
    mockAssertion.run.mockResolvedValue(
      {
        outputType: "conditional",
        continue: true,
        conditionResult: true,
        output: mockAssertionOutput,
      }
    )

    const mockThenBlock = mock<Block<boolean, boolean>>()
    const mockElseBlock = mock<Block<boolean, boolean>>()

    const mockEvents = new EventBus()
    const mockClient = mock<LegoClient>()
    const triggerId = "foo"

    const blockOutput: ContinueOutput<boolean> = {
      continue: true,
      outputType: "block",
      output: true
    }

    when(mockThenBlock.run).calledWith(mockClient, mockAssertionOutput, mockEvents, triggerId).thenReturn(blockOutput)


    const condition = new IfThenElseCondition({
      name: "foo",
      assertion: mockAssertion,
      then: mockThenBlock,
      else: mockElseBlock
    })

    const result = await condition.run(mockClient, "foo", mockEvents, triggerId)

    expect(mockThenBlock.run).toHaveBeenCalledWith(mockClient, mockAssertionOutput, mockEvents, triggerId)
    expect(mockElseBlock.run).not.toHaveBeenCalled()
    expect(result.continue).toEqual(true)
  })

  it("Executes the 'else' branch asnd returns the result when condition is false", async () => {

    const mockAssertion = mock<Assertion<string, boolean>>()
    const mockAssertionOutput = false;
    mockAssertion.run.mockResolvedValue(
      {
        outputType: "conditional",
        continue: true,
        conditionResult: false,
        output: mockAssertionOutput,
      }
    )

    const mockThenBlock = mock<Block<boolean, boolean>>()
    const mockElseBlock = mock<Block<boolean, boolean>>()

    const mockEvents = new EventBus()
    const mockClient = mock<LegoClient>()
    const triggerId = "foo"

    const blockOutput: ContinueOutput<boolean> = {
      continue: true,
      outputType: "block",
      output: true
    }

    when(mockElseBlock.run).calledWith(mockClient, mockAssertionOutput, mockEvents, triggerId).thenReturn(blockOutput)


    const condition = new IfThenElseCondition({
      name: "foo",
      assertion: mockAssertion,
      then: mockThenBlock,
      else: mockElseBlock
    })

    const result = await condition.run(mockClient, "foo", mockEvents, triggerId)

    expect(mockElseBlock.run).toHaveBeenCalledWith(mockClient, mockAssertionOutput, mockEvents, triggerId)
    expect(mockThenBlock.run).not.toHaveBeenCalled()
    expect(result.continue).toEqual(true)
  })
})

describe("ifThenElseCondition.constructor", () => {


  it("generates an md5 hash of the name the id if not supplied", () => {
    when(md5).calledWith("foo").thenReturn("hash")

    const mockAssertion = mock<Assertion<string, boolean>>()
    const mockThenBlock = mock<Block<boolean, boolean>>()
    const mockElseBlock = mock<Block<boolean, boolean>>()

    const assertion = new IfThenElseCondition({
      name: "foo",
      assertion: mockAssertion,
      then: mockThenBlock,
      else: mockElseBlock
    })

    expect(assertion.id).toEqual("hash")
  })

  it("configures the id from the constructor input when supplied", () => {
    const mockAssertion = mock<Assertion<string, boolean>>()
    const mockThenBlock = mock<Block<boolean, boolean>>()
    const mockElseBlock = mock<Block<boolean, boolean>>()
    const assertion = new IfThenElseCondition({
      name: "foo",
      id: "foo-id",
      assertion: mockAssertion,
      then: mockThenBlock,
      else: mockElseBlock
    })

    expect(assertion.id).toEqual("foo-id")
  })

})
