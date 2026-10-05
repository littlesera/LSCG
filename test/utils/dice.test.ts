import { describe, expect, it } from "vitest";
import { MAX_DICE_PER_TERM, MAX_DICE_TERMS, MAX_DIE_SIDES, parseDiceRoll, rollDice } from "Modules/Magic/dice";

describe("parseDiceRoll", () => {
	it("reads dice, a bare die, flat numbers and several terms, tidying the text", () => {
		expect(parseDiceRoll("2d6+2")?.text).toBe("2d6 + 2");
		expect(parseDiceRoll(" D8 ")?.text).toBe("1d8");
		expect(parseDiceRoll("1d4 + 1d6 - 1")?.text).toBe("1d4 + 1d6 - 1");
		expect(parseDiceRoll("7")?.text).toBe("7");
		expect(parseDiceRoll("-2+1d4")?.text).toBe("-2 + 1d4");
	});

	it("rejects anything that isn't an expression", () => {
		for (const bad of ["", "   ", undefined, "fire", "2d", "d", "2d6+", "+", "2d6++2", "2d6 2", "2x6", "1d1", "0d6", "2d6*2", "2.5"])
			expect(parseDiceRoll(bad), String(bad)).toBeUndefined();
	});

	it("rejects rolls that ask for too much", () => {
		expect(parseDiceRoll(`${MAX_DICE_PER_TERM}d${MAX_DIE_SIDES}`)).toBeDefined();
		expect(parseDiceRoll(`${MAX_DICE_PER_TERM + 1}d6`)).toBeUndefined();
		expect(parseDiceRoll(`1d${MAX_DIE_SIDES + 1}`)).toBeUndefined();
		expect(parseDiceRoll(Array(MAX_DICE_TERMS).fill("1d4").join("+"))).toBeDefined();
		expect(parseDiceRoll(Array(MAX_DICE_TERMS + 1).fill("1d4").join("+"))).toBeUndefined();
		expect(parseDiceRoll("1d4+" + "1".repeat(40))).toBeUndefined();
	});
});

describe("rollDice", () => {
	const roll = (text: string, values: number[]) => {
		let i = 0;
		return rollDice(parseDiceRoll(text)!, () => values[Math.min(i++, values.length - 1)]);
	};

	it("totals the dice and modifiers and shows what was rolled", () => {
		const result = roll("2d6 + 2", [0.5, 0]); // 4 and 1
		expect(result.total).toBe(7);
		expect(result.breakdown).toBe("2d6 + 2 = [4, 1] + 2");
	});

	it("covers each face, from 1 to the die's size", () => {
		expect(roll("1d8", [0]).total).toBe(1);
		expect(roll("1d8", [0.999999]).total).toBe(8);
	});

	it("subtracts negative terms but never totals below 0", () => {
		expect(roll("1d6 - 2", [0.999]).total).toBe(4);
		const low = roll("1d4 - 5", [0]);
		expect(low.total).toBe(0);
		expect(low.breakdown).toBe("1d4 - 5 = 1 - 5");
	});
});
