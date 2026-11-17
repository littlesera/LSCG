import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// `npm run bench`. A separate config rather than a project in vitest.config.ts: it keeps the timing runs out of
// `npm test` and `npm run test:all` entirely. (Vitest 5 has no `bench()` API, so these are ordinary timed tests.)
export default defineConfig({
	plugins: [tsconfigPaths({ projects: ['tsconfig.test.json'] })],
	test: {
		environment: 'node',
		include: ['test/bench/**/*.bench.ts'],
		testTimeout: 120_000,
	},
});
