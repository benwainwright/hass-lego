import { describe, it, expect } from "vitest";
import { createServer } from "http";
import { io as Client } from "socket.io-client";
import { getWebsocketServer } from "./get-websocket-server.ts";
import { mock } from "vitest-mock-extended";
import { Block, EventBus } from "@core";
import { ILegoClient } from "@types";
import { BlockStarted } from "src/types/hass-lego-events.ts";

// A helper function to start a server on an ephemeral port.
const listenServer = (
  server: ReturnType<typeof createServer>,
): Promise<number> =>
  new Promise((resolve, reject) => {
    server.listen(0, () => {
      const address = server.address();
      if (address && typeof address === "object") {
        resolve(address.port);
      } else {
        reject(new Error("Failed to get server port"));
      }
    });
  });

// A helper function to close the server.
const closeServer = (server: ReturnType<typeof createServer>): Promise<void> =>
  new Promise((resolve, reject) => {
    server.close((err?: Error) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

// A helper to create a Socket.IO client for tests.
const createTestClient = (port: number) =>
  Client(`http://localhost:${String(port)}`, {
    transports: ["websocket"],
  });

describe("getWebsocketServer", () => {
  it("should respond with plain text on HTTP GET", async () => {
    const fakeBlock = mock<Block<unknown, unknown>>();
    fakeBlock.toJson.mockReturnValue({
      id: "id",
      name: "name",
      type: "type",
    });

    const client = mock<ILegoClient>();

    client.getAutomations.mockReturnValue([fakeBlock]);

    // Create a server with a dummy bus.
    const server = getWebsocketServer({
      cors: { origin: "http://localhost", methods: ["GET", "POST"] },
      client,
      bus: mock(),
    });

    const port = await listenServer(server);

    const response = await fetch(`http://localhost:${String(port)}`);

    expect(response.ok).toBeTruthy();
    expect(await response.text()).toBe("Websocket server is running!");
    await closeServer(server);
  });

  it("should emit automations when 'request-automations' is received", async () => {
    const fakeBlock = mock<Block<unknown, unknown>>();

    fakeBlock.toJson.mockReturnValue({
      id: "id",
      name: "name",
      type: "type",
    });

    const client = mock<ILegoClient>();

    client.getAutomations.mockReturnValue([fakeBlock]);

    const server = getWebsocketServer({
      cors: { origin: "http://localhost", methods: ["GET", "POST"] },
      client,
      bus: mock(),
    });

    const port = await listenServer(server);

    const clientSocket = createTestClient(port);

    const automationsPromise = new Promise<unknown>((resolve) => {
      clientSocket.on("automations", (data: unknown) => {
        resolve(data);
      });
    });

    await new Promise<void>((resolve) => clientSocket.on("connect", resolve));
    clientSocket.emit("request-automations");

    const data = await automationsPromise;
    expect(data).toEqual([fakeBlock.toJson()]);

    clientSocket.disconnect();
    await closeServer(server);
  });

  it("should forward bus events as 'hass-lego-event' (excluding hass-state-changed)", async () => {
    const fakeBlock = mock<Block<unknown, unknown>>();

    fakeBlock.toJson.mockReturnValue({
      id: "id",
      name: "name",
      type: "type",
    });

    const bus = new EventBus();

    const client = mock<ILegoClient>();

    const server = getWebsocketServer({
      cors: { origin: "http://localhost", methods: ["GET", "POST"] },
      client,
      bus,
    });

    const port = await listenServer(server);

    const clientSocket = createTestClient(port);

    // Wait for the event forwarded from the bus.
    const eventPromise = new Promise<BlockStarted>((resolve) => {
      clientSocket.on("hass-lego-event", (data: BlockStarted) => {
        resolve(data);
      });
    });

    await new Promise<void>((resolve) => clientSocket.on("connect", resolve));

    const testEvent: BlockStarted = {
      status: "started",
      type: "foo",
      triggerId: "foo",
      name: "foo",
      executeId: "foo",
      block: { id: "foo", name: "foo", type: "foo" },
    };

    bus.emit(testEvent);

    expect(await eventPromise).toEqual({
      ...testEvent,
      id: expect.any(String),
      timestamp: expect.any(String),
    });
  });
});
