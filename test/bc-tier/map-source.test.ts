// map-source.ts: pulling a function or method out of BC source and normalising it for fingerprinting.
import { describe, expect, it } from "vitest";
import { extractSource, normalizeSource } from "./map-source";

const sample = `
// leading comment with a { brace
function Alpha(a, b) {
	const s = "} not a close"; // trailing { comment
	/* block } comment */
	if (a) { return \`\${b}}\`; }
	return a + b;
}

async function Beta() { return 1; }

class Thing {
	/** docs */
	update(x) {
		if (x) { return { x }; }
		return null;
	}
	other() { return 2; }
}
`;

describe("extractSource", () => {
	it("returns a whole function, ignoring braces in strings, templates and comments", () => {
		const src = extractSource(sample, "Alpha", "function")!;
		expect(src.startsWith("function Alpha(a, b) {")).toBe(true);
		expect(src.endsWith("return a + b;\n}")).toBe(true);
		expect(src).not.toContain("Beta");
	});

	it("finds async functions", () => {
		expect(extractSource(sample, "Beta", "function")).toContain("return 1;");
	});

	it("finds a class method without matching a neighbour", () => {
		const src = extractSource(sample, "update", "method")!;
		expect(src).toContain("return null;");
		expect(src).not.toContain("other");
	});

	it("returns null for something that is not there", () => {
		expect(extractSource(sample, "Missing", "function")).toBeNull();
		expect(extractSource(sample, "Missing", "method")).toBeNull();
	});
});

describe("normalizeSource", () => {
	it("ignores comments and formatting, but not behaviour", () => {
		const a = "function F(x) {\n\t// note\n\treturn x + 1; /* inline */\n}";
		const b = "function F(x) { return x + 1; }";
		const c = "function F(x) { return x + 2; }";
		expect(normalizeSource(a)).toBe(normalizeSource(b));
		expect(normalizeSource(a)).not.toBe(normalizeSource(c));
	});
});
