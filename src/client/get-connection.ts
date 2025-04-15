import { getConfig, initialiseClient } from "homeassistant-typescript";
import { ConnectionArgs, LegoConnection } from "@types";
import { LegoClient } from "./lego-client.ts";
import { EventBus } from "@core";
import { getWebsocketServer } from "./get-websocket-server.ts";

export const getConnection = async (
  args?: ConnectionArgs,
): Promise<LegoConnection> => {
  const corsOptions = args
    ? args.corsOptions
    : {
        origin: "*",
        methods: ["GET", "POST"],
      };

  const bus = new EventBus();
  const config = getConfig();
  const client = await initialiseClient(config);
  const lego = new LegoClient(client, bus);

  const websocketServer = getWebsocketServer({
    cors: corsOptions,
    client: lego,
    bus,
  });

  return {
    client: lego,
    socket: websocketServer,
    hassConfig: config,
    eventBus: bus,
  };
};
