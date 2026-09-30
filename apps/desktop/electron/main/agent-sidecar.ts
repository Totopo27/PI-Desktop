import {
  AgentSidecar as RuntimeAgentSidecar,
  type StderrHandler,
} from "@pi-desktop/host-runtime";
import { redactValue } from "./logger";
import { agentSidecarLaunchArgs } from "./agent-sidecar-args";

export type {
  LocalToolHandler,
  LocalToolResult,
  ProjectInstructionResolver,
  SidecarNotificationHandler,
  TrustedExtensionSidecarBridge,
  VendorAuthResolver,
} from "@pi-desktop/host-runtime";

export { agentSidecarLaunchArgs, resolveSidecarEntry } from "./agent-sidecar-args";

function fallbackStderrLogger(text: string): void {
  console.error(
    `[agent/runtime] ${JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      channel: "agent",
      category: "runtime",
      event: "child.process.stderr",
      message: "child process stderr",
      data: { output: redactValue(text.trimEnd()) },
    })}`,
  );
}

/**
 * The desktop's agent sidecar: the shared stdio transport from
 * `@pi-desktop/host-runtime`, launched the only way Electron can run Node
 * code out of process — its own executable with `ELECTRON_RUN_AS_NODE` — on
 * the sidecar bundle this build ships.
 */
export class AgentSidecar extends RuntimeAgentSidecar {
  constructor(onStderr?: StderrHandler) {
    super({
      launch: {
        command: process.execPath,
        args: agentSidecarLaunchArgs(),
        env: {
          ...process.env,
          ELECTRON_RUN_AS_NODE: "1",
        },
      },
      onStderr: onStderr ?? fallbackStderrLogger,
    });
  }
}
