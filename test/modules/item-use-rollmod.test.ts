// ItemUseModule.getRollMod(): the check-roll modifier used by ActivityRoll/
// MakeActivityCheck. Exercised against a non-player character throughout (its
// choke-level term reads C.LSCG.CollarModule.chokeLevel directly rather than
// going through a booted CollarModule, unlike the Player-specific branch).
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ItemUseModule } from "Modules/item-use";
import { CoreModule } from "Modules/core";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { boot, resetWorld } from "../harness/world";
import { makeCharacter } from "../harness/fixtures";

describe("ItemUseModule.getRollMod", () => {
	let itemUse: ItemUseModule;

	beforeAll(() => {
		// ItemUseModule.load() calls Core().RegisterCommandListener(...) (craft
		// sharing etc.) with no null-check, and run() calls
		// this.activities.AddActivity(...) (getModule<ActivityModule>), which in
		// turn needs ConsentModule -- so all three have to be registered first.
		[, , , itemUse] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new ItemUseModule());
	});

	beforeEach(() => {
		resetWorld();
	});

	function subject(overrides: Parameters<typeof makeCharacter>[0] = {}) {
		return makeCharacter({ LSCG: { CollarModule: { chokeLevel: 0 } }, ...overrides });
	}

	it("is 0 for a character with no modifiers at all", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(itemUse.getRollMod(subject() as any)).toBe(0);
	});

	it("is -4 while restrained", () => {
		const C = subject({ flags: { restrained: true } });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(itemUse.getRollMod(C as any)).toBe(-4);
	});

	it("is +5 when the opponent is owned by this character", () => {
		const C = subject();
		const opponent = subject({ MemberNumber: 999 });
		opponent.OwnerMemberNumber = C.MemberNumber;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(itemUse.getRollMod(C as any, opponent as any)).toBe(5);
	});

	it("is 0 when the opponent is owned by someone else", () => {
		const C = subject();
		const opponent = subject({ MemberNumber: 999 });
		opponent.OwnerMemberNumber = 12345;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(itemUse.getRollMod(C as any, opponent as any)).toBe(0);
	});

	it("subtracts up to -4 based on arousal progress while edged", () => {
		const C = subject({ flags: { edged: true }, ArousalSettings: { Progress: 80 } });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(itemUse.getRollMod(C as any)).toBe(-3); // floor(80/25) = 3
	});

	it("is -100 when incapacitated and defending (automatic failure)", () => {
		const C = subject({ LSCG: { CollarModule: { chokeLevel: 0 }, StateModule: { states: [{ type: "hypnotized", active: true }] } } });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(itemUse.getRollMod(C as any, undefined, false)).toBe(-100);
	});

	it("is only -5 when incapacitated but the aggressor", () => {
		const C = subject({ LSCG: { CollarModule: { chokeLevel: 0 }, StateModule: { states: [{ type: "hypnotized", active: true }] } } });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(itemUse.getRollMod(C as any, undefined, true)).toBe(-5);
	});

	it("is -2 per choke level", () => {
		const C = subject({ LSCG: { CollarModule: { chokeLevel: 3 } } });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(itemUse.getRollMod(C as any)).toBe(-6);
	});

	it("is +/-5 for an active buffed state, depending on its \"negative\" extension", () => {
		const buffed = subject({ LSCG: { CollarModule: { chokeLevel: 0 }, StateModule: { states: [{ type: "buffed", active: true, extensions: {} }] } } });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(itemUse.getRollMod(buffed as any)).toBe(5);

		const debuffed = subject({ LSCG: { CollarModule: { chokeLevel: 0 }, StateModule: { states: [{ type: "buffed", active: true, extensions: { negative: true } }] } } });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(itemUse.getRollMod(debuffed as any)).toBe(-5);
	});

	it("ignores an inactive buffed state", () => {
		const C = subject({ LSCG: { CollarModule: { chokeLevel: 0 }, StateModule: { states: [{ type: "buffed", active: false, extensions: {} }] } } });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(itemUse.getRollMod(C as any)).toBe(0);
	});

	it("is +5 for an active protected (magic barrier) state", () => {
		const C = subject({ LSCG: { CollarModule: { chokeLevel: 0 }, StateModule: { states: [{ type: "protected", active: true }] } } });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(itemUse.getRollMod(C as any)).toBe(5);
	});

	it("combines every applicable modifier", () => {
		const C = subject({
			flags: { restrained: true, edged: true },
			ArousalSettings: { Progress: 50 },
			LSCG: { CollarModule: { chokeLevel: 1 }, StateModule: { states: [{ type: "protected", active: true }] } },
		});
		// restrained -4, edged floor(50/25)*-1=-2, choke level 1 = -2, protected +5:
		// checks they combine additively rather than one silently overriding another.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect(itemUse.getRollMod(C as any)).toBe(-4 - 2 - 2 + 5);
	});
});
