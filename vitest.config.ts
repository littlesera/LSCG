import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import packageJson from "./package.json";

// Same computation as vite.config.ts's rollup `intro`, so LSCG_VERSION resolves
// identically under test as it does in the built bundle.
const LSCG_VERSION = (packageJson.version.length > 0 && packageJson.version[0] === 'v')
	? packageJson.version
	: "v" + packageJson.version;

export default defineConfig({
	plugins: [
		// vite-tsconfig-paths only crawls for files literally named "tsconfig.json"
		// by default, which wouldn't cover test/**/* (tsconfig.json's own `include`
		// deliberately excludes it -- see tsconfig.test.json's comment for why).
		// esbuild's bundling ignores `moduleResolution` entirely, so pointing this
		// at tsconfig.test.json (which extends tsconfig.json and adds test/) is
		// safe for path-alias resolution even though that file isn't used for the
		// production build's own type-checking.
		tsconfigPaths({ projects: ['tsconfig.test.json'] }),
	],
	define: {
		LSCG_VERSION: JSON.stringify(LSCG_VERSION),
	},
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					environment: 'jsdom',
					setupFiles: ['test/setup/globals.ts'],
					include: ['test/**/*.test.ts'],
					exclude: ['test/**/*.bc.test.ts'],
				},
			},
			{
				extends: true,
				test: {
					name: 'bc',
					environment: 'jsdom',
					// One real BC client load takes real wall-clock time (see
					// test/harness/bc-loader.ts); give it room over the 5s default.
					testTimeout: 20_000,
					hookTimeout: 20_000,
					globalSetup: ['test/setup/bc-global-setup.ts'],
					setupFiles: ['test/setup/bc-globals.ts'],
					include: ['test/**/*.bc.test.ts'],
				},
			},
		],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: ['src/**/*.{ts,tsx}'],
		},
	},
});
