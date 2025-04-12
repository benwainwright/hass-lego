
import { describe, it, expect, vi } from "vitest";
import { createServer } from "http";
import { io as Client } from "socket.io-client";
import { getWebsocketServer } from "./get-websocket-server.ts";
import { Block } from "./block.ts";

// A simple fake Block implementation for testing.
class FakeBlock extends Block<void, string> {
  public readonly name = "fakeBlock";
  public readonly typeString = "fake";

  public override toJson() {
    return { id: this.id, name: this.name, type: this.typeString };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async run() {
    return { continue: true, outputType: "block", output: "data" } as const;
  }
}

// A helper to create a fake bus that stores subscriber callbacks.
interface FakeBus {
  subscribe: (cb: (event: unknown) => void) => void;
  getSubscribers: () => ((event: unknown) => void)[];
}
const createFakeBus = (): FakeBus => {
  const subscribers: ((event: unknown) => void)[] = [];
  return {
    subscribe: (cb: (event: unknown) => void) => {
      subscribers.push(cb);
    },
    getSubscribers: () => subscribers,
  };
};

// A helper function to start a server on an ephemeral port.
const listenServer = (server: ReturnType<typeof createServer>): Promise<number> =>
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
        reject(err)
      } else {
        resolve()
      }
    });
  })

// A helper to create a Socket.IO client for tests.
const createTestClient = (port: number) =>
  Client(`http://localhost:${String(port)}`, {
    transports: ["websocket"],
  });

describe("getWebsocketServer", () => {
  it("should respond with plain text on HTTP GET", async () => {
    // Create a server with a dummy bus.
    const server = getWebsocketServer({
      cors: { origin: "http://localhost", methods: ["GET", "POST"] },
      automations: [new FakeBlock("1")],
      bus: { subscribe: () => { } },
    });

    const port = await listenServer(server);

    // Use Node's HTTP module to send a GET request.
    const http = await import("http");
    const responseData = await new Promise<string>((resolve, reject) => {
      const req = http.request(
        {
          hostname: "localhost",
          port,
          path: "/",
          method: "GET",
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => { resolve(data); });
        }
      );
      req.on("error", reject);
      req.end();
    });

    expect(responseData).toBe("Websocket server is running!");
    await closeServer(server);
  });

  //it("should emit automations when 'request-automations' is received", async () => {
  //  const fakeBlock = new FakeBlock("1");
  //  const server = getWebsocketServer({
  //    cors: { origin: "http://localhost", methods: ["GET", "POST"] },
  //    automations: [fakeBlock],
  //    bus: { subscribe: () => { } },
  //  });
  //  const port = await listenServer(server);
  //
  //  // Create a Socket.IO client.
  //  const clientSocket = createTestClient(port);
  //
  //  // Wait for the 'automations' event.
  //  const automationsPromise = new Promise<any>((resolve) => {
  //    clientSocket.on("automations", (data: any) => { resolve(data); });
  //  });
  //
  //  // Wait for connection and then emit the request.
  //  await new Promise<void>((resolve) => clientSocket.on("connect", resolve));
  //  clientSocket.emit("request-automations");
  //
  //  const data = await automationsPromise;
  //  expect(data).toEqual([fakeBlock.toJson()]);
  //
  //  clientSocket.disconnect();
  //  await closeServer(server);
  //});
  //
  //it("should forward bus events as 'hass-lego-event' (excluding hass-state-changed)", async () => {
  //  const fakeBus = createFakeBus();
  //  const server = getWebsocketServer({
  //    cors: { origin: "http://localhost", methods: ["GET", "POST"] },
  //    automations: [new FakeBlock("1")],
  //    bus: fakeBus,
  //  });
  //  const port = await listenServer(server);
  //  const clientSocket = createTestClient(port);
  //
  //  // Wait for the event forwarded from the bus.
  //  const eventPromise = new Promise<any>((resolve) => {
  //    clientSocket.on("hass-lego-event", (data: any) => { resolve(data); });
  //  });
  //
  //  await new Promise<void>((resolve) => clientSocket.on("connect", resolve));
  //  // Simulate a bus event that should be forwarded.
  //  const testEvent = { type: "test-event", payload: "hello" };
  //  fakeBus.getSubscribers().forEach((cb) => { cb(testEvent); });
  //
  //  const receivedEvent = await eventPromise;
  //  expect(receivedEvent).toEqual(testEvent);
  //
  //  clientSocket.disconnect();
  //  await closeServer(server);
  //});
  //
  //it("should not forward bus events with type 'hass-state-changed'", async () => {
  //  const fakeBus = createFakeBus();
  //  const server = getWebsocketServer({
  //    cors: { origin: "http://localhost", methods: ["GET", "POST"] },
  //    automations: [new FakeBlock("1")],
  //    bus: fakeBus,
  //  });
  //  const port = await listenServer(server);
  //  const clientSocket = createTestClient(port);
  //
  //  // Set up a spy to capture any 'hass-lego-event' events.
  //  const spy = vi.fn();
  //  clientSocket.on("hass-lego-event", spy);
  //
  //  await new Promise<void>((resolve) => clientSocket.on("connect", resolve));
  //  // Simulate an event that should be ignored.
  //  fakeBus.getSubscribers().forEach((cb) => { cb({ type: "hass-state-changed", payload: "ignore" }); }
  //  );
  //
  //  // Wait briefly to ensure no event is emitted.
  //  await new Promise((resolve) => setTimeout(resolve, 300));
  //  expect(spy).not.toHaveBeenCalled();
  //
  //  clientSocket.disconnect();
  //  await closeServer(server);
  //});
});
