import { beforeAll, describe, expect, it, vi } from "vitest";
import { regEscape } from "regEscape";

describe("regEscape", () => {
	it("escapes regex metacharacters", () => {
		expect(regEscape("a.b*c?")).toBe(new RegExp(regEscape("a.b*c?")).source);
		expect(new RegExp(regEscape("a.b*c?")).test("a.b*c?")).toBe(true);
		expect(new RegExp(regEscape("a.b*c?")).test("axbyc")).toBe(false);
	});

	it("still matches literally for plain word strings", () => {
		// Per the RegExp.escape proposal this core-js polyfill mirrors, a leading
		// ASCII letter/digit is hex-escaped (e.g. "h" -> "\x68") so the result is
		// safe to splice into a larger pattern; only literal-match equivalence is
		// guaranteed, not textual identity.
		expect(new RegExp(regEscape("hello")).test("hello")).toBe(true);
		expect(new RegExp("^" + regEscape("hello") + "$").test("hello")).toBe(true);
	});

	it("escapes brackets, braces and backslashes", () => {
		const raw = "[a]{b}(c)\\d";
		expect(new RegExp(regEscape(raw)).test(raw)).toBe(true);
	});

	it("throws on non-string input", () => {
		// @ts-expect-error -- intentionally wrong type
		expect(() => regEscape(123)).toThrow(TypeError);
	});
});

// Node has a native RegExp.escape, so the tests above never reach the polyfill, which
// browsers without one do run. Hide the native one and re-import to test the polyfill.
describe("regEscape polyfill", () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const native = (RegExp as any).escape as ((s: string) => string) | undefined;
	let escape: (s: string) => string;

	beforeAll(async () => {
		const descriptor = Object.getOwnPropertyDescriptor(RegExp, "escape");
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		delete (RegExp as any).escape;
		try {
			vi.resetModules();
			escape = (await import("regEscape")).regEscape;
		} finally {
			if (descriptor) Object.defineProperty(RegExp, "escape", descriptor);
		}
	});

	it("is not the native implementation", () => {
		expect(escape).not.toBe(native);
	});

	it.each([
		"hello", "a.b*c?", "[a]{b}(c)\\d", "$^|/", "line\nbreak\ttab", "a-b,c:d=e!f#g", "x y z", "9lives",
		"emoji 😀", "lone \uD800 high", "lone \uDC00 low", "ends high \uD800",
	])("matches %j literally, and agrees with native", (raw) => {
		expect(new RegExp("^" + escape(raw) + "$").test(raw)).toBe(true);
		if (native) expect(escape(raw)).toBe(native(raw));
	});

	it("hex-escapes a leading letter or digit, and escapes control characters and whitespace", () => {
		expect(escape("abc")).toBe("\\x61bc");
		expect(escape("1")).toBe("\\x31");
		expect(escape("\n")).toBe("\\n");
		expect(escape(" ")).toBe("\\x20");
		expect(escape(" ")).toBe("\\u2028");
	});

	it("throws on non-string input", () => {
		// @ts-expect-error -- intentionally wrong type
		expect(() => escape(123)).toThrow(TypeError);
	});
});
