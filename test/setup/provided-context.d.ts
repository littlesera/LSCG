// Typed shape for what test/setup/bc-global-setup.ts provides via project.provide(),
// read back in test files (or test/setup/bc-globals.ts) via inject().
declare module "vitest" {
	export interface ProvidedContext {
		bcClientDir: string;
		bcGameVersion: string;
	}
}

export {};
