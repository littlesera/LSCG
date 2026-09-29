import { describe, expect, it } from "vitest";
import {
	capitalizeFirstLetter,
	excludeParentheticalContent,
	GetDelimitedList,
	getZoneColor,
	isObject,
	isPhraseInString,
	parseFromBase64,
	parseFromUTF16,
	parseMsgWords,
} from "utils";

describe("parseMsgWords", () => {
	it("lowercases and splits into word tokens", () => {
		expect(parseMsgWords("Hello, World!")).toEqual(["hello", "world"]);
	});

	it("returns null for a string with no word characters", () => {
		expect(parseMsgWords("...")).toBeNull();
	});
});

describe("isObject", () => {
	it.each([
		[{}, true],
		[{ a: 1 }, true],
		[[], false],
		[null, false],
		[undefined, false],
		["x", false],
		[42, false],
	])("isObject(%o) === %s", (value, expected) => {
		expect(isObject(value)).toBe(expected);
	});
});

describe("capitalizeFirstLetter", () => {
	it("capitalizes only the first character", () => {
		expect(capitalizeFirstLetter("hello")).toBe("Hello");
	});

	it("leaves an already-capitalized string untouched", () => {
		expect(capitalizeFirstLetter("Hello")).toBe("Hello");
	});

	it("handles a single character", () => {
		expect(capitalizeFirstLetter("h")).toBe("H");
	});
});

describe("getZoneColor", () => {
	it("returns the configured color when hasConfiguration is true", () => {
		expect(getZoneColor("ItemMouth", true)).toBe("#00FF0044");
	});

	it("returns the unconfigured color otherwise", () => {
		expect(getZoneColor("ItemMouth", false)).toBe("#80808044");
	});
});

describe("excludeParentheticalContent", () => {
	it("strips ASCII-parenthesized OOC content", () => {
		expect(excludeParentheticalContent("hello (ooc note) world")).toBe("hello  world");
	});

	it("strips full-width parenthesized OOC content", () => {
		expect(excludeParentheticalContent("hello （ooc note） world")).toBe("hello  world");
	});

	it("handles unbalanced trailing parens by dropping the rest of the string", () => {
		expect(excludeParentheticalContent("hello (unterminated")).toBe("hello ");
	});

	it("returns an empty string for null/undefined input", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(excludeParentheticalContent(null as any)).toBe("");
	});
});

describe("isPhraseInString", () => {
	it("matches a whole-word phrase, case-insensitively", () => {
		expect(isPhraseInString("Please Sit Down", "sit")).toBe(true);
	});

	it("does not match a phrase embedded in a larger word", () => {
		expect(isPhraseInString("sitting down", "sit")).toBe(false);
	});

	it("escapes regex-special characters in the phrase", () => {
		expect(isPhraseInString("a.b test", "a.b")).toBe(true);
		expect(isPhraseInString("axb test", "a.b")).toBe(false);
	});

	it("excludes OOC parenthetical content by default", () => {
		expect(isPhraseInString("hello (mentions sit here) world", "sit")).toBe(false);
	});

	it("still matches inside parentheses when ignoreOOC is true", () => {
		expect(isPhraseInString("hello (mentions sit here) world", "sit", true)).toBe(true);
	});

	it("returns false for an empty string", () => {
		expect(isPhraseInString("", "sit")).toBe(false);
	});
});

describe("GetDelimitedList", () => {
	it("splits on the delimiter and lowercases entries", () => {
		expect(GetDelimitedList("Foo,Bar,Baz")).toEqual(["foo", "bar", "baz"]);
	});

	it("respects quoted entries containing the delimiter", () => {
		expect(GetDelimitedList('foo,"bar,baz",qux')).toEqual(["foo", "bar,baz", "qux"]);
	});

	it("supports a custom delimiter", () => {
		expect(GetDelimitedList("foo;bar;baz", ";")).toEqual(["foo", "bar", "baz"]);
	});

	it("returns an empty array for an empty source", () => {
		expect(GetDelimitedList("")).toEqual([]);
	});

	it("drops empty entries", () => {
		expect(GetDelimitedList("foo,,bar")).toEqual(["foo", "bar"]);
	});
});

describe("parseFromBase64 / parseFromUTF16 round trips", () => {
	it("round-trips an object through base64 (LZString)", () => {
		const data = { a: 1, b: ["x", "y"], c: { nested: true } };
		const compressed = LZString.compressToBase64(JSON.stringify(data));
		expect(parseFromBase64(compressed)).toEqual(data);
	});

	it("round-trips an object through UTF16 (LZString)", () => {
		const data = { a: 1, b: "hello" };
		const compressed = LZString.compressToUTF16(JSON.stringify(data));
		expect(parseFromUTF16(compressed)).toEqual(data);
	});

	it("returns undefined for garbage input instead of throwing", () => {
		expect(parseFromBase64("not valid compressed data")).toBeUndefined();
		expect(parseFromUTF16("not valid compressed data")).toBeUndefined();
	});

	it("returns undefined for an empty string", () => {
		expect(parseFromBase64("")).toBeUndefined();
	});
});
