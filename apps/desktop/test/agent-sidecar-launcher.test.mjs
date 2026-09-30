import assert from "node:assert/strict";
import test from "node:test";
import { readMainModule } from "./helpers/source-contracts.mjs";
import { agentSidecarLaunchArgs } from "../electron/main/agent-sidecar-args.ts";

test("agentSidecarLaunchArgs scopes --use-system-ca to win32 (#1187)", () => {
  const winArgs = agentSidecarLaunchArgs("win32", "/mock/sidecar.js");
  assert.deepEqual(winArgs, [
    "--max-old-space-size=2048",
    "--use-system-ca",
    "/mock/sidecar.js",
  ]);

  const darwinArgs = agentSidecarLaunchArgs("darwin", "/mock/sidecar.js");
  assert.deepEqual(darwinArgs, [
    "--max-old-space-size=2048",
    "/mock/sidecar.js",
  ]);

  const linuxArgs = agentSidecarLaunchArgs("linux", "/mock/sidecar.js");
  assert.deepEqual(linuxArgs, [
    "--max-old-space-size=2048",
    "/mock/sidecar.js",
  ]);
});

test("AgentSidecar launcher uses agentSidecarLaunchArgs", async () => {
  const source = await readMainModule("agent-sidecar.ts");
  assert.match(source, /args:\s*agentSidecarLaunchArgs\(\)/);
});
