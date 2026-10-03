import { beforeEach, describe, expect, it } from "vitest";
import { replace_template } from "utils";
import { resetWorld } from "../harness/world";
import { makeCharacter } from "../harness/fixtures";

describe("replace_template", () => {
	beforeEach(() => {
		resetWorld({ Nickname: "Ren", flags: { pronouns: "SheHer" } });
	});

	it("substitutes the player's own name and pronoun tokens with no source", () => {
		const result = replace_template("%NAME% waves %POSSESSIVE% hand.");
		expect(result).toBe("Ren waves her hand.");
	});

	it("resolves %OPP_*% tokens to an empty string when there is no source and no fallback name", () => {
		const result = replace_template("waves at %OPP_NAME%.");
		expect(result).toBe("waves at .");
	});

	it("substitutes the source's tokens when a source character is given", () => {
		const source = makeCharacter({ Nickname: "Kai", flags: { pronouns: "HeHim" } });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = replace_template("%NAME% looks at %OPP_NAME%, who tips %CAP_OPP_POSSESSIVE% hat.", source as any);
		expect(result).toBe("Ren looks at Kai, who tips His hat.");
	});

	it("uses reflexive wording when the source is the player themself", () => {
		resetWorld({ Nickname: "Ren", flags: { pronouns: "SheHer", isPlayer: true } });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = replace_template("%OPP_NAME% admires %OPP_NAME_POSSESSIVE% work.", (globalThis as any).Player);
		expect(result).toBe("herself admires her own work.");
	});

	it("falls back to fallbackSourceName when there is no source character", () => {
		const result = replace_template("%OPP_NAME% waves.", null, "Someone");
		expect(result).toBe("Someone waves.");
	});

	it("leaves unrecognized tokens untouched", () => {
		expect(replace_template("%NOT_A_TOKEN%")).toBe("%NOT_A_TOKEN%");
	});

	it("leaves text with no tokens untouched", () => {
		expect(replace_template("plain text, no tokens here")).toBe("plain text, no tokens here");
	});
});
