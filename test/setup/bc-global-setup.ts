// Vitest `globalSetup` for the "bc" project: runs once (in Node, before any "bc"
// test file starts) and ensures the real BC client scripts are downloaded and
// cached -- see scripts/bc-client.mjs. Its resolved directory is handed to each
// test file via Vitest's provide()/inject(), instead of every file re-resolving
// (and every file re-downloading on a cold cache) independently.
import type { ProvidedContext } from "vitest";
import { ensureBcClient } from "../../scripts/bc-client.mjs";

// Deliberately not `import type { TestProject } from "vitest/node"`: that
// entrypoint's types transitively reach Vite's Node-only `#types/*` subpath
// imports (see tsconfig.test.json's comment), which is exactly what pulling
// vitest.config.ts into this same program caused before -- @types/node's
// ambient globals leaking into src/**/*'s own (unrelated) typecheck.
interface GlobalSetupProject {
	provide<K extends keyof ProvidedContext>(key: K, value: ProvidedContext[K]): void;
}

export default async function setup(project: GlobalSetupProject): Promise<void> {
	const result = await ensureBcClient();
	console.log(`bc-client: using ${result.dir} (GameVersion ${result.gameVersion}, source: ${result.source})`);
	project.provide("bcClientDir", result.dir);
	project.provide("bcGameVersion", result.gameVersion);
}
