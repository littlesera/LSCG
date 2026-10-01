import { spawnSync } from "node:child_process";

const r = spawnSync("npx", ["vitest", "run", "--project", "unit", "test/corpus/speech/corpus.test.ts", "--reporter=verbose", "-t", "report"], {
	stdio: "inherit",
	shell: true,
	env: { ...process.env, SPEECH_REPORT: "1" },
});
process.exit(r.status ?? 1);
