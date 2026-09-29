// Minimal ambient types for the handful of Node builtins the "bc" tier's harness
// uses, instead of `@types/node`. `@types/node`'s globals.d.ts overrides
// `setTimeout`'s return type (NodeJS.Timeout instead of DOM's `number`), and
// TypeScript's ambient globals are program-wide -- once anything in this
// compilation references them, src/**/* (written against the DOM's `setTimeout`,
// since it runs in a real browser) starts failing its own typecheck too. See
// tsconfig.test.json's comment for the matching `vitest/node` issue.
declare module "node:vm" {
	export interface Context {
		[key: string]: unknown;
	}
	export function runInContext(code: string, contextifiedObject: Context, options?: { filename?: string }): unknown;
}

declare module "node:fs" {
	export function readFileSync(path: string, encoding: "utf-8" | "utf8"): string;
	export function existsSync(path: string): boolean;
	export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
	export function writeFileSync(path: string, data: string): void;
}

declare module "node:path" {
	export function join(...parts: string[]): string;
	export function dirname(path: string): string;
}

declare module "node:url" {
	export function fileURLToPath(url: string): string;
}

declare module "node:child_process" {
	export function execFileSync(command: string, args: string[], options?: { encoding?: string }): string;
}
