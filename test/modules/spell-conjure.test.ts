// Web, Slime and Conjure Ropes: spells that put BC restraints on the player on a few free slots, escalate on a repeat cast, respect the player's
// item permissions and prerequisites, and take what they put on off again when the spell ends.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { ItemUseModule } from "Modules/item-use";
import { CollarModule } from "Modules/collar";
import { InjectorModule } from "Modules/injector";
import { MagicModule } from "Modules/magic";
import { StateModule } from "Modules/states";
import { LSCGSpellEffect, type SpellDefinition, type SpellEffectId } from "Settings/Models/magic";
import { sanitizeConjureConfig, MAX_CONJURE_PIECES } from "Modules/Magic/conjure";
import { getSpellEffect } from "Modules/Magic/spellEffects";
import { effectConfigFor } from "Modules/Magic/spellEdit";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeAsset, makeCharacter, makeGroup, makeItem, wear, type FixtureCharacter } from "../harness/fixtures";
import { restoreRandom, seedRandom } from "../harness/time";
import { sent } from "../harness/room";

const MINUTE = 60_000;

describe("conjured restraints", () => {
	let magic: MagicModule;
	let states: StateModule;
	let alice: FixtureCharacter;

	beforeAll(() => {
		[, , , , , , magic, states] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new ItemUseModule(),
			new CollarModule(), new InjectorModule(), new MagicModule(), new StateModule());
		vi.useFakeTimers();
	});

	// What BC would say are the type options of the web, so the code can ask about permission per option
	const WEB_OPTIONS = ["Tangled", "Wrapped", "Cocooned"];

	beforeEach(() => {
		resetWorld({
			MemberNumber: 1, Nickname: "Sera", WhiteList: [], BlackList: [],
			LSCG: { GlobalModule: { enabled: true }, MiscModule: { chokeChainEnabled: false, gagChokeEnabled: false } },
		});
		states.init();
		magic.init();
		addToRoom(player());
		alice = addToRoom(makeCharacter({
			MemberNumber: 2, Nickname: "Alice",
			LSCG: { MagicModule: { enabled: true }, StateModule: { states: [] }, CollarModule: { chokeLevel: 0 } },
		}));
		magic.settings.enabled = true;
		magic.settings.limitedDuration = true;
		vi.stubGlobal("InventoryAllow", vi.fn(() => true));
		vi.stubGlobal("SkillGetWithRatio", vi.fn(() => 0));
		vi.stubGlobal("TypedItemDataLookup", { ItemArmsWeb: { name: "typed", options: WEB_OPTIONS.map((Name, i) => ({ Name, Property: { TypeRecord: { typed: i } } })) } });
		vi.stubGlobal("TypedItemSetOptionByName", vi.fn((_C: unknown, item: { Property: Record<string, unknown> }, name: string) => {
			item.Property = { ...item.Property, TypeRecord: { typed: WEB_OPTIONS.indexOf(name) } };
		}));
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
		restoreRandom();
	});

	const asset = (group: string, name: string, over: Record<string, unknown> = {}) => makeAsset(makeGroup({ Name: group }), { Name: name, Category: [], ...over } as never);
	/** The assets the sets use, so AssetGet finds them. */
	function webAssets() {
		asset("ItemArms", "Web");
		asset("ItemMouth", "WebGag");
		asset("ItemHead", "WebBlindfold");
	}

	const spell = (effects: SpellEffectId[], configs?: unknown[]) => ({ Name: "snare", Creator: 2, Effects: effects, AllowPotion: false, AllowVoiceCast: false, ...(configs ? { Configs: configs } : {}) }) as SpellDefinition;
	const cast = (s: SpellDefinition) => {
		magic.IncomingSpell(alice as never, s, null, 1);
		vi.advanceTimersByTime(2000 * 4 + 500);
		return sent.actions();
	};
	const worn = () => player().Appearance.map((i: any) => `${i.Asset.Group.Name}:${i.Asset.Name}`).sort();
	const arms = () => player().Appearance.find((i: any) => i.Asset.Group.Name === "ItemArms") as any;
	const web = (min = 1, max = min) => spell([LSCGSpellEffect.web], [{ Min: min, Max: max }]);

	describe("Web", () => {
		beforeEach(webAssets);

		it("always does the main thing first: one piece is the web on the arms, at a random tightness", () => {
			vi.spyOn(Math, "random").mockReturnValue(0.5); // the middle rung
			const out = cast(web(1));
			expect(worn()).toEqual(["ItemArms:Web"]);
			expect(arms().Property.TypeRecord).toEqual({ typed: 1 });
			expect(out.some(a => a.includes("Sticky strands of web"))).toBe(true);
			expect(states.SpellEffectsState.EntriesFor(LSCGSpellEffect.web)).toHaveLength(1);
		});

		it("more pieces fill other free slots too, and never replace what is already worn", () => {
			wear(player(), makeItem(asset("ItemMouth", "BallGag")));
			vi.spyOn(Math, "random").mockReturnValue(0.1);
			cast(web(3));
			expect(worn()).toEqual(["ItemArms:Web", "ItemHead:WebBlindfold", "ItemMouth:BallGag"]);
		});

		it("a repeat casting pulls the web a rung tighter instead of adding anything, up to the top", () => {
			vi.spyOn(Math, "random").mockReturnValue(0.1);
			cast(web(1));
			expect(arms().Property.TypeRecord).toEqual({ typed: 0 });
			const out = cast(web(1));
			expect(arms().Property.TypeRecord).toEqual({ typed: 1 });
			expect(out.some(a => a.includes("pull tighter"))).toBe(true);
			cast(web(1));
			expect(arms().Property.TypeRecord).toEqual({ typed: 2 });
			expect(states.SpellEffectsState.entries).toHaveLength(1); // still the one entry from the first cast
			cast(web(1));
			expect(arms().Property.TypeRecord).toEqual({ typed: 2 }); // at the top, so the next piece goes on another slot
			expect(worn()).toHaveLength(2);
			expect(states.SpellEffectsState.entries).toHaveLength(2);
		});

		it("says so when every slot it could use is already taken", () => {
			wear(player(), makeItem(asset("ItemArms", "Straitjacket")));
			wear(player(), makeItem(asset("ItemMouth", "BallGag")));
			wear(player(), makeItem(asset("ItemHead", "Blindfold")));
			const out = cast(web(3));
			expect(out.some(a => a.includes("nothing left for them to hold"))).toBe(true);
			expect(states.SpellEffectsState.Active).toBe(false);
		});

		it("three stacked copies in one spell make a more complete web than one", () => {
			vi.spyOn(Math, "random").mockReturnValue(0.1);
			cast(spell([LSCGSpellEffect.web, LSCGSpellEffect.web, LSCGSpellEffect.web], [{ Min: 1, Max: 1 }, { Min: 1, Max: 1 }, { Min: 1, Max: 1 }]));
			expect(arms().Property.TypeRecord).toEqual({ typed: 2 });
		});

		it("comes off again when the spell runs out, but only what is still the web", () => {
			vi.spyOn(Math, "random").mockReturnValue(0.1);
			cast(web(3));
			expect(worn()).toHaveLength(3);
			wear(player(), makeItem(asset("ItemHead", "Blindfold"))); // swapped for something else since
			vi.advanceTimersByTime(6 * MINUTE);
			states.SpellEffectsState.Tick(Date.now());
			expect(worn()).toEqual(["ItemHead:Blindfold"]);
			expect(sent.actions().some(a => a.includes("crumble away"))).toBe(true);
			expect(states.SpellEffectsState.Active).toBe(false);
		});

		it("a dispel removes it", () => {
			vi.spyOn(Math, "random").mockReturnValue(0.1);
			cast(web(2));
			expect(worn()).toHaveLength(2);
			states.Clear(false, true);
			expect(worn()).toEqual([]);
			expect(sent.actions().some(a => a.includes("crumble away"))).toBe(true);
		});

		it("something locked on since by someone is left alone when the spell ends, but safeword always frees the wearer", () => {
			vi.spyOn(Math, "random").mockReturnValue(0.1);
			cast(web(1));
			arms().Property.LockedBy = "MetalPadlock";
			states.Clear(false, true);
			expect(worn()).toEqual(["ItemArms:Web"]);

			player().Appearance = [];
			cast(web(1));
			arms().Property.LockedBy = "MetalPadlock";
			states.safeword();
			expect(worn()).toEqual([]);
		});

		it("skips pieces the player's item permissions forbid, down to the highest allowed rung", () => {
			vi.spyOn(Math, "random").mockReturnValue(0.99); // would pick the top rung, Cocooned
			vi.stubGlobal("InventoryIsPermissionBlocked", vi.fn((_C: unknown, _name: string, _group: string, type?: string) => type === "typed2"));
			cast(web(1));
			expect(arms().Property.TypeRecord).toEqual({ typed: 1 });
			vi.stubGlobal("InventoryIsPermissionBlocked", vi.fn(() => true));
			const out = cast(web(3));
			expect(out.some(a => a.includes("nothing left for them to hold"))).toBe(true);
			expect(worn()).toEqual(["ItemArms:Web"]);
		});

		it("skips a piece whose prerequisites aren't met, or whose slot is blocked", () => {
			vi.stubGlobal("InventoryAllow", vi.fn((_C: unknown, a: { Name: string }) => a.Name !== "Web"));
			cast(web(2));
			expect(worn()).toEqual(["ItemHead:WebBlindfold", "ItemMouth:WebGag"]);
			vi.stubGlobal("InventoryGroupIsBlocked", vi.fn(() => true));
			expect(cast(web(2)).some(a => a.includes("nothing left"))).toBe(true);
		});

		it("takes no save of its own: someone who never defends is bound however the dice fall", () => {
			magic.settings.neverDefend = true;
			seedRandom([0.0, 0.99]);
			magic.IncomingSpellCommand(alice as never, { command: { name: "spell", args: [{ name: "spell", value: web(1) }] } } as never);
			vi.advanceTimersByTime(1000 + 2500);
			expect(worn()).toEqual(["ItemArms:Web"]);
			expect(sent.actions().some(a => a.includes("resists"))).toBe(false);
		});

		it("is not left behind after a relog: the entry is plain data on absolute time", () => {
			vi.spyOn(Math, "random").mockReturnValue(0.1);
			cast(web(1));
			states.settings.states = JSON.parse(JSON.stringify(states.settings.states));
			vi.advanceTimersByTime(6 * MINUTE);
			states.SpellEffectsState.Tick(Date.now());
			expect(worn()).toEqual([]);
		});
	});

	describe("Slime", () => {
		it("coats the main slot first and any other free slots, one piece each, and melts away", () => {
			["ItemArms", "ItemLegs", "ItemFeet", "ItemMouth", "ItemHead", "ItemHood", "ItemBoots"].forEach(g => asset(g, "Slime"));
			vi.spyOn(Math, "random").mockReturnValue(0.1);
			cast(spell([LSCGSpellEffect.slime], [{ Min: 3, Max: 3 }]));
			expect(worn()).toHaveLength(3);
			expect(worn()).toContain("ItemArms:Slime");
			vi.advanceTimersByTime(6 * MINUTE);
			states.SpellEffectsState.Tick(Date.now());
			expect(worn()).toEqual([]);
			expect(sent.actions().some(a => a.includes("slime clinging"))).toBe(true);
		});
	});

	describe("Conjured Ropes", () => {
		beforeEach(() => {
			asset("ItemArms", "HempRope");
			asset("ItemLegs", "HempRope");
			asset("ItemTorso", "HempRopeHarness");
		});

		it("ties the arms first, and uses a crafted rope only on the pieces it fits", () => {
			vi.spyOn(Math, "random").mockReturnValue(0.1);
			const craft = { Item: "HempRope", Name: "Silk rope", Description: "", Property: "Normal" };
			cast(spell([LSCGSpellEffect.ropes], [{ Min: 3, Max: 3, Craft: craft }]));
			expect(worn()).toEqual(["ItemArms:HempRope", "ItemLegs:HempRope", "ItemTorso:HempRopeHarness"]);
			const crafted = (g: string) => (player().Appearance.find((i: any) => i.Asset.Group.Name === g) as any).Craft;
			expect(crafted("ItemArms")?.Name).toBe("Silk rope");
			expect(crafted("ItemLegs")?.Name).toBe("Silk rope");
			expect(crafted("ItemTorso")).toBeUndefined(); // the harness isn't the crafted item
		});
	});

	describe("settings", () => {
		it("the piece range is whole numbers within limits, with Max never below Min", () => {
			expect(sanitizeConjureConfig({ Min: 3, Max: 1 })).toEqual({ Min: 3, Max: 3 });
			expect(sanitizeConjureConfig({ Min: 0, Max: 99 })).toEqual({ Min: 1, Max: MAX_CONJURE_PIECES });
			expect(sanitizeConjureConfig({ Min: 2.6 })).toEqual({ Min: 3, Max: 3 });
			expect(sanitizeConjureConfig("junk")).toEqual({ Min: 1, Max: 2 });
		});

		it("a crafted item is kept only for an effect that can wear it, and only its useful parts", () => {
			const web = getSpellEffect(LSCGSpellEffect.web)!;
			const rope = { Item: "HempRope", Name: "Rope", Description: "", Property: "Normal", Evil: "<script>" };
			expect(web.config!.sanitize({ Min: 1, Max: 2, Craft: rope }).Craft).toBeUndefined();
			const kept = getSpellEffect(LSCGSpellEffect.ropes)!.config!.sanitize({ Min: 1, Max: 2, Craft: rope }).Craft;
			expect(kept).toEqual({ Item: "HempRope", Name: "Rope", Description: "", Property: "Normal" });
			expect(effectConfigFor(spell([LSCGSpellEffect.web], [{ Min: 2, Max: 5 }]), 0)).toEqual({ Min: 2, Max: 5 });
		});

		it("all three stack, and have no save of their own", () => {
			for (const id of [LSCGSpellEffect.web, LSCGSpellEffect.slime, LSCGSpellEffect.ropes]) {
				expect(getSpellEffect(id)?.stackable).toBe(3);
				expect(getSpellEffect(id)?.onSave).toBeUndefined();
			}
		});
	});
});
