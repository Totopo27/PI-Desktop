import { existsSync } from "node:fs";
import { join } from "node:path";

declare const process: NodeJS.Process & { resourcesPath?: string };

export function resolveSidecarEntry(): string {
  const candidates = [
    join(process.resourcesPath || "", "agent-runtime/sidecar.js"),
    join(__dirname, "../../../agent-runtime/dist/sidecar.js"),
    join(__dirname, "../../../../packages/agent-runtime/dist/sidecar.js"),
  ];
  for (const c of candidates) {
    if (c && existsSync(c)) return c;
  }
  return join(__dirname, "../../../../packages/agent-runtime/dist/sidecar.js");
}

export function agentSidecarLaunchArgs(
  platform: NodeJS.Platform = process.platform,
  sidecarEntry: string = resolveSidecarEntry(),
): string[] {
  const args = ["--max-old-space-size=2048"];
  // Electron 43's Node crypto layer uses BoringSSL. On Windows, --use-system-ca
  // integrates CryptoAPI roots successfully (issue #714). On macOS, passing
  // --use-system-ca in Electron's BoringSSL build causes certificate chain
  // validation failures (UNABLE_TO_GET_ISSUER_CERT) for standard public CAs
  // such as GlobalSign R3 (issue #1187). We therefore scope --use-system-ca
  // to win32, while retaining bundled roots and inherited NODE_EXTRA_CA_CERTS
  // across all platforms.
  if (platform === "win32") {
    args.push("--use-system-ca");
  }
  args.push(sidecarEntry);
  return args;
}
