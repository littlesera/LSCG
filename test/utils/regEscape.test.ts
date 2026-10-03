import { describe, expect, it } from "vitest";
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
