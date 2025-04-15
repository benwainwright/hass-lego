import { BlockOutput } from "./block-output.ts";
import { IEventBus } from "./i-event-bus.ts";
import { ILegoClient } from "./i-lego-client.ts";
import { SerialisedBlock } from "./serialised-block.ts";

export interface IBlock<I = void, O = void> {
  toJson(): SerialisedBlock;

  id: string;

  name: string;

  inputType: I | undefined;

  outputType: O | undefined;

  validate: (client: ILegoClient) => Promise<void>;

  typeString: string;

  run: (
    client: ILegoClient,
    input: I,
    events?: IEventBus,
    triggerId?: string,
  ) => Promise<BlockOutput<O>> | BlockOutput<O>;
}
