import { CorsOptions, EventBus } from "@core";
import { createServer } from "http";
import { Server } from "socket.io";
import { Block } from "./block.ts";

interface ServerProps {
  cors: CorsOptions,
  automations: Block<unknown, unknown>[]
  bus: EventBus
}

export const getWebsocketServer = ({ cors, automations, bus }: ServerProps) => {
  const server = createServer((request, response) => {
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
    return JSON.stringify(obj, (k, v) => {
      if (v !== null && typeof v === "object") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        if (seen.has(v)) return;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        seen.add(v);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return v;
    });
  };

  io.on("connection", (socket) => {
    socket.on("request-automations", () => {
      const serialisedAutomations = automations.map((automation) =>
        automation.toJson(),
      );
      socket.emit("automations", serialisedAutomations);
    });

    bus.subscribe((event) => {
      if (event.type !== "hass-state-changed") {
        socket.emit(
          "hass-lego-event",
          JSON.parse(stringifyCircularJSON(event)),
        );
      }
    });
  });

  return server;
}
