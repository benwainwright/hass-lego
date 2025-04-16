import type { IEventBus, CorsOptions, IBlock } from "@types";

import { Server } from "socket.io";
import { createServer } from "http";

interface ServerProps {
  cors: CorsOptions;
  client: { getAutomations(): IBlock<unknown, unknown>[] };
  bus: IEventBus;
}

/**
 * Generate a Socket.io connection that forwards events published
 * on the provided event bus to the socket
 */
export const getWebsocketServer = ({ cors, client, bus }: ServerProps) => {
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/plain" });
    response.end("Websocket server is running!");
  });

  const io = new Server(server, {
    cors: {
      origin: cors.origin,
      methods: cors.methods,
    },
  });

  const stringifyCircularJSON = (obj: unknown) => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (_key, value) => {
      if (value !== null && typeof value === "object") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        if (seen.has(value)) return;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        seen.add(value);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value;
    });
  };

  io.on("connection", (socket) => {
    socket.on("request-automations", () => {
      const automations = client.getAutomations();

      const serialisedAutomations = automations.map((automation) =>
        automation.toJson(),
      );
      socket.emit("automations", serialisedAutomations);
    });

    bus.subscribe((event) => {
      socket.emit("hass-lego-event", JSON.parse(stringifyCircularJSON(event)));
    });
  });

  return server;
};
