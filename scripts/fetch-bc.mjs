#!/usr/bin/env node
// CLI entrypoint: `npm run fetch-bc`. Downloads (or reuses the cached) BC client
// the "bc" Vitest project needs. Also runs automatically as that project's
// globalSetup (test/setup/bc-global-setup.ts) -- this is for manual/CI prefetch.
import { ensureBcClient } from "./bc-client.mjs";

const result = await ensureBcClient();
console.log(`bc-client: ready at ${result.dir} (GameVersion ${result.gameVersion}, source: ${result.source})`);
