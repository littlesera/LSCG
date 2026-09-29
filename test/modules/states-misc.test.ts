// GaggedState's SpeechBlock branching, a light real-outfit pass at PolymorphedState.Apply
// (the deeper permission-ladder/dedupe logic of CursedItemState is T4's job, per the test
// plan -- this only covers CursedItemState's basic gating/Recover as a state), and
// AstralProjectionState's declared restrictions. AstralProjectionState.Activate()/Recover()
// pull in a large amount of pose/canvas/character-copy machinery (CopyCharacter,
// PoseCanChangeUnaidedStatus, ServerAppearanceBundle, CharacterDelete, ...) that isn't
// stubbed anywhere in this harness; per this project's scope (canvas/GUI drawing is out of
// scope), only its restriction declarations are covered here.
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import LZString from "lz-string";
import { CoreModule } from "Modules/core";
import { CursedItemModule } from "Modules/cursed-item";
import { StateModule } from "Modules/states";
import { replace_template } from "utils";
import { StripLevel } from "Settings/Models/cursed-item";
import type { SpellDefinition } from "Settings/Models/magic";
import { boot, resetWorld, player } from "../harness/world";
import { makeGroup, makeAsset } from "../harness/fixtures";
import { sent } from "../harness/room";

describe("GaggedState.SpeechBlock", () => {
	let states: StateModule;

	beforeAll(() => {
		[, states] = boot(new CoreModule(), new StateModule());
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		states.init();
	});

	function emote(raw: string): string {
		return replace_template(raw, null);
	}

	it("declares Speech as \"true\" and nothing else", () => {
		expect(states.GaggedState.Restrictions.Speech).toBe("true");
		expect(states.GaggedState.Restrictions.Move).toBe("false");
	});

	it("sends a restrained-specific line when the player is restrained", () => {
		player().flags.restrained = true;
		states.GaggedState.SpeechBlock();
		expect(states.GaggedState.restrainedBlockStrings.map(emote)).toContain(sent.actions()[0]);
	});

	it("sends a free-struggle line when the player is not restrained", () => {
		player().flags.restrained = false;
		states.GaggedState.SpeechBlock();
		expect(states.GaggedState.freeBlockStrings.map(emote)).toContain(sent.actions()[0]);
	});
});

describe("PolymorphedState.Apply", () => {
	let states: StateModule;

	beforeAll(() => {
		[, states] = boot(new CoreModule(), new StateModule());
	});

	beforeEach(() => {
		resetWorld({
			MemberNumber: 1,
			LSCG: { GlobalModule: { enabled: true }, MagicModule: { allowChangeGenitals: false, allowChangePronouns: false } },
		});
		states.init();
	});

	function worn(): string {
		return player().Appearance.map(i => `${i.Asset.Group.Name}:${i.Asset.Name}`).sort().join(",");
	}

	function spell(bundle: { Group: string; Name: string }[], config: Partial<Record<"IncludeCosplay" | "IncludeSkin" | "IncludeHair" | "IncludeGenitals" | "IncludeAllBody", boolean>>): SpellDefinition {
		return {
			Name: "test", Creator: 1, Effects: [], AllowPotion: false, AllowVoiceCast: false,
			Polymorph: {
				Key: "test", Code: LZString.compressToBase64(JSON.stringify(bundle)),
				IncludeCosplay: false, IncludeSkin: false, IncludeHair: false, IncludeGenitals: false, IncludeAllBody: false,
				...config,
			},
		};
	}

	it("wears a body-group item when IncludeAllBody is set", () => {
		const group = makeGroup({ Name: "BodyUpper", Category: "Appearance" });
		makeAsset(group, { Name: "Muscular" });
		states.PolymorphedState.Apply(spell([{ Group: "BodyUpper", Name: "Muscular" }], { IncludeAllBody: true }), 1, undefined, false);
		expect(worn()).toBe("BodyUpper:Muscular");
		expect(states.PolymorphedState.Active).toBe(true);
	});

	it("does not wear a body-group item when IncludeAllBody/IncludeSkin are both left off", () => {
		const group = makeGroup({ Name: "BodyUpper", Category: "Appearance" });
		makeAsset(group, { Name: "Muscular" });
		states.PolymorphedState.Apply(spell([{ Group: "BodyUpper", Name: "Muscular" }], {}), 1, undefined, false);
		expect(worn()).toBe("");
	});

	it("blocks a genitals-group item unless MagicModule.allowChangeGenitals is on", () => {
		const group = makeGroup({ Name: "Pussy", Category: "Appearance" });
		makeAsset(group, { Name: "Anatomical" });
		states.PolymorphedState.Apply(spell([{ Group: "Pussy", Name: "Anatomical" }], { IncludeGenitals: true }), 1, undefined, false);
		expect(worn()).toBe("");

		player().LSCG.MagicModule.allowChangeGenitals = true;
		states.PolymorphedState.Apply(spell([{ Group: "Pussy", Name: "Anatomical" }], { IncludeGenitals: true }), 1, undefined, false);
		expect(worn()).toBe("Pussy:Anatomical");
	});
});

describe("CursedItemState (basic gating and Recover -- see T4 for the full permission ladder)", () => {
	let states: StateModule;
	let cursedItem: CursedItemModule;

	beforeAll(() => {
		[, cursedItem, states] = boot(new CoreModule(), new CursedItemModule(), new StateModule());
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		cursedItem.init();
		states.init();
		// CursedItemState.Settings caches the settings object the first time it's read and
		// never re-fetches it (unlike BaseModule.settings, which always re-reads from
		// Player.LSCG). resetWorld() replaces Player.LSCG wholesale between tests, which
		// orphans that cache -- reset the private field directly so each test's
		// cursedItem.settings.* mutations are actually the ones CursedItemState reads. (In
		// real play Player.LSCG is mutated in place, never replaced, so this doesn't come up
		// outside a test harness that deliberately resets it per test.)
		// Same reasoning for the 1-minute curse+crafter dedupe list: it's instance state
		// that would otherwise leak between tests (it only clears itself via a real
		// setTimeout, a full minute later).
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(states.CursedItemState as any)._settings = undefined;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(states.CursedItemState as any)._cursesAppliedRecently = [];
	});

	function curse(overrides: Partial<{ CurseName: string; Crafter: number }> = {}) {
		return {
			ItemName: "Test Item", CurseName: overrides.CurseName ?? "test-curse", Crafter: overrides.Crafter ?? 2,
			OutfitCode: "", Speed: "medium" as const, CustomSpeed: 0, Inexhaustable: false, SuppressEmote: true,
			Strip: StripLevel.NONE, InstaStrip: false, lastTick: 0, BlockedGroups: [],
		};
	}

	it("does nothing when the wearer's cursed-item module is disabled", () => {
		cursedItem.settings.enabled = false;
		cursedItem.settings.Vulnerable = true;
		const ret = states.CursedItemState.AddCursedItem(curse());
		expect(ret).toBeUndefined();
		expect(states.CursedItemState.Active).toBe(false);
	});

	it("does nothing when the wearer isn't Vulnerable", () => {
		cursedItem.settings.enabled = true;
		cursedItem.settings.Vulnerable = false;
		const ret = states.CursedItemState.AddCursedItem(curse());
		expect(ret).toBeUndefined();
	});

	it("activates when enabled and Vulnerable", () => {
		cursedItem.settings.enabled = true;
		cursedItem.settings.Vulnerable = true;
		const ret = states.CursedItemState.AddCursedItem(curse(), 1, undefined, false);
		expect(ret).toBe(states.CursedItemState);
		expect(states.CursedItemState.Active).toBe(true);
	});

	it("dedupes the same curse+crafter within the 1-minute window", () => {
		cursedItem.settings.enabled = true;
		cursedItem.settings.Vulnerable = true;
		states.CursedItemState.AddCursedItem(curse({ CurseName: "same", Crafter: 5 }));
		states.CursedItemState.Recover();
		const ret = states.CursedItemState.AddCursedItem(curse({ CurseName: "same", Crafter: 5 }));
		expect(ret).toBeUndefined();
	});

	it("a different curse name from the same crafter is not deduped", () => {
		cursedItem.settings.enabled = true;
		cursedItem.settings.Vulnerable = true;
		states.CursedItemState.AddCursedItem(curse({ CurseName: "first", Crafter: 5 }));
		const ret = states.CursedItemState.AddCursedItem(curse({ CurseName: "second", Crafter: 5 }));
		expect(ret).toBe(states.CursedItemState);
	});

	it("Recover() clears active outfits and deactivates", () => {
		cursedItem.settings.enabled = true;
		cursedItem.settings.Vulnerable = true;
		states.CursedItemState.AddCursedItem(curse());
		expect(states.CursedItemState.Active).toBe(true);
		states.CursedItemState.Recover();
		expect(states.CursedItemState.Active).toBe(false);
	});

	it("Recover() on an already-inactive state is a no-op", () => {
		const ret = states.CursedItemState.Recover();
		expect(ret).toBe(states.CursedItemState);
		expect(states.CursedItemState.Active).toBe(false);
	});
});

describe("AstralProjectionState restrictions", () => {
	let states: StateModule;

	beforeAll(() => {
		[, states] = boot(new CoreModule(), new StateModule());
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		states.init();
	});

	it("declares Wardrobe, Walk, and Touch as \"true\"", () => {
		expect(states.AstralProjectionState.Restrictions.Wardrobe).toBe("true");
		expect(states.AstralProjectionState.Restrictions.Walk).toBe("true");
		expect(states.AstralProjectionState.Restrictions.Touch).toBe("true");
		expect(states.AstralProjectionState.Restrictions.Speech).toBe("false");
	});
});
