// Test-only preload: detect even failed or swallowed network attempts from real entrypoints.
import { appendFileSync } from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import net from "node:net";
import http from "node:http";
import https from "node:https";
import dns from "node:dns";

appendFileSync(process.env.ROCKETICONS_TEST_GUARD_LOG, "loaded\n");

const rejectNetwork = () => {
  appendFileSync(process.env.ROCKETICONS_TEST_NETWORK_LOG, "outbound network attempted\n");
  throw new Error("Network is disabled by the telemetry protocol test");
};
net.Socket.prototype.connect = rejectNetwork;
http.request = rejectNetwork;
http.get = rejectNetwork;
https.request = rejectNetwork;
https.get = rejectNetwork;
dns.lookup = rejectNetwork;
globalThis.fetch = rejectNetwork;
syncBuiltinESMExports();
