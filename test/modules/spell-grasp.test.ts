// The Grasping spell effect: spectral hands on the neck (a choke), arms, legs, ass or breasts, chosen per spell. With Echo's Ghost Hand installed the
// hands are that item; without it the spell's own effects hold the spot. Either way they let go when the spell ends.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { ItemUseModule } from "Modules/item-use";
import { CollarModule } from "Modules/collar";
import { InjectorModule } from "Modules/injector";
import { MagicModule } from "Modules/magic";
import { StateModule } from "Modules/states";
import { Leashing, LeashingModule } from "Modules/leashing";
import { LSCGSpellEffect, type SpellDefinition } from "Settings/Models/magic";
import { GHOST_HAND, SQUEEZE_AROUSAL, SQUEEZE_INTERVAL, sanitizeGraspConfig, type GraspLocation } from "Modules/Magic/effects/grasp";
import { getSpellEffect } from "Modules/Magic/spellEffects";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeAsset, makeCharacter, makeGroup, type FixtureCharacter } from "../harness/fixtures";
import { restoreRandom, seedRandom } from "../harness/time";
import { sent } from "../harness/room";

const MINUTE = 60_000;

describe("Grasping", () => {
	let magic: MagicModule;
	let states: StateModule;
	let collar: CollarModule;
	let leashing: LeashingModule;
	let alice: FixtureCharacter;

	beforeAll(() => {
		[, , , , collar, , magic, states, leashing] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new ItemUseModule(),
			new CollarModule(), new InjectorModule(), new MagicModule(), new StateModule(), new LeashingModule());
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({
			MemberNumber: 1, Nickname: "Sera", WhiteList: [], BlackList: [],
			LSCG: { GlobalModule: { enabled: true }, MiscModule: { chokeChainEnabled: false, gagChokeEnabled: false, handChokeEnabled: true } },
		});
		states.init();
		magic.init();
		leashing.Pairings = [];
		addToRoom(player());
		alice = addToRoom(makeCharacter({
			MemberNumber: 2, Nickname: "Alice",
			LSCG: { MagicModule: { enabled: true }, StateModule: { states: [] }, CollarModule: { chokeLevel: 0 } },
		}));
		magic.settings.enabled = true;
		magic.settings.limitedDuration = true;
		player().ArousalSettings = { Progress: 10 };
		vi.stubGlobal("ActivitySetArousal", vi.fn((C: { ArousalSettings: { Progress: number } }, v: number) => { C.ArousalSettings.Progress = v; }));
		vi.stubGlobal("CharacterRefresh", vi.fn());
		vi.stubGlobal("InventoryAllow", vi.fn(() => true));
		vi.stubGlobal("SkillGetWithRatio", vi.fn(() => 0));
		vi.stubGlobal("TypedItemDataLookup", {});
		vi.stubGlobal("TypedItemSetOptionByName", vi.fn((_C: unknown, item: { Property: Record<string, unknown> }, name: string) => {
			item.Property = { ...item.Property, TypeRecord: { typed: Number(name.slice(1)) - 1 } };
		}));
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
		restoreRandom();
	});

	const grasp = (...Locations: GraspLocation[]): SpellDefinition =>
		({ Name: "seize", Creator: 2, Effects: [LSCGSpellEffect.grasp], AllowPotion: false, AllowVoiceCast: false, Configs: [{ Locations }] }) as SpellDefinition;
	const cast = (s: SpellDefinition) => {
		magic.IncomingSpell(alice as never, s, null, 1);
		vi.advanceTimersByTime(2500);
		return sent.actions();
	};
	const expire = () => {
		vi.advanceTimersByTime(6 * MINUTE);
		states.SpellEffectsState.Tick(Date.now());
	};
	const entries = () => states.SpellEffectsState.EntriesFor(LSCGSpellEffect.grasp);
	const worn = () => player().Appearance.map((i: any) => `${i.Asset.Group.Name}:${i.Asset.Name}`).sort();

	describe("settings", () => {
		it("are real locations, at least one, arms by default", () => {
			expect(sanitizeGraspConfig(undefined)).toEqual({ Locations: ["arms"] });
			expect(sanitizeGraspConfig({ Locations: [] })).toEqual({ Locations: ["arms"] });
			expect(sanitizeGraspConfig({ Locations: ["feet", "neck", "ass", "neck"] })).toEqual({ Locations: ["neck", "ass"] });
			expect(sanitizeGraspConfig({ Locations: "neck" })).toEqual({ Locations: ["arms"] });
		});

		it("is unique per spell and has no save of its own", () => {
			const def = getSpellEffect(LSCGSpellEffect.grasp)!;
			expect(def.stackable).toBeUndefined();
			expect(def.onSave).toBeUndefined();
		});
	});

	describe("without Echo installed", () => {
		it("the arms are held: no using them, until the spell ends", () => {
			expect(states.AnyRestrictions(r => r.Move)).toBe(false);
			const out = cast(grasp("arms"));
			expect(out.some(a => a.includes("arms and pin them"))).toBe(true);
			expect(states.AnyRestrictions(r => r.Move)).toBe(true);
			expect(states.AnyRestrictions(r => r.Walk)).toBe(false);
			expire();
			expect(states.AnyRestrictions(r => r.Move)).toBe(false);
			expect(sent.actions().some(a => a.includes("spectral hands release"))).toBe(true);
		});

		it("the legs are held: no walking", () => {
			cast(grasp("legs"));
			expect(states.AnyRestrictions(r => r.Walk)).toBe(true);
			expect(states.AnyRestrictions(r => r.Move)).toBe(false);
			states.Clear(false, true);
			expect(states.AnyRestrictions(r => r.Walk)).toBe(false);
		});

		it("safeword lifts it", () => {
			cast(grasp("arms", "legs"));
			expect(states.AnyRestrictions(r => r.Move) && states.AnyRestrictions(r => r.Walk)).toBe(true);
			states.safeword();
			expect(states.AnyRestrictions(r => r.Move) || states.AnyRestrictions(r => r.Walk)).toBe(false);
		});

		it("a hand on the neck chokes, and lets go afterwards", () => {
			const choke = vi.spyOn(collar, "HandChoke");
			const release = vi.spyOn(collar, "ReleaseHandChoke");
			cast(grasp("neck"));
			expect(choke).toHaveBeenCalledWith(alice, true);
			expire();
			expect(release).toHaveBeenCalledWith(null, false);
		});

		describe("the choke's wording", () => {
			const said = () => sent.actions().join("\n");

			it("is the spell's spectral hand, never the caster's own hand, at every stage", () => {
				cast(grasp("neck"));
				expect(said()).toContain("a spectral hand wraps around");
				collar.HandChoke(alice as never, true);
				expect(said()).toContain("the spectral hand tightens its grip");
				collar.HandChoke(alice as never, true);
				expect(said()).toContain("the spectral hand presses firmly");
				collar.HandChoke(alice as never, true);
				expect(said()).toContain("the spectral hand completely closes");
				vi.advanceTimersByTime(60_000);
				expect(said()).toContain("the spectral hand gripping");
				vi.advanceTimersByTime(60_000);
				expect(said()).toContain("the spectral hand clenches");
				expect(said()).not.toMatch(/Alice (wraps|tightens|presses|completely|gripping|clenches)/);
				expect(said()).not.toContain("hand around her neck");
			});

			it("a player's own hand still reads as theirs", () => {
				collar.HandChoke(alice as never);
				expect(said()).toContain("wraps");
				expect(said()).not.toContain("spectral");
			});

			it("when it chokes them out, the hand lets go and nothing between them and the caster is escaped", () => {
				leashing.AddLeashing(new Leashing(2, 2, false, "compulsion"));
				const escape = vi.spyOn(leashing, "DoEscape");
				cast(grasp("neck"));
				for (let i = 0; i < 3; i++) collar.HandChoke(alice as never, true);
				vi.advanceTimersByTime(200_000);
				expect(said()).toContain("the spectral hand lets go of");
				expect(escape).not.toHaveBeenCalled();
				expect(leashing.Pairings.some(p => p.Type === "compulsion")).toBe(true);
				expect(collar.handChokeModifier).toBe(0);
				expect(collar.handChokeMagic).toBe(false);
			});

			it("a player's own hand choking someone out still escapes the leash, as before", () => {
				const escape = vi.spyOn(leashing, "DoEscape").mockImplementation(() => {});
				for (let i = 0; i < 4; i++) collar.HandChoke(alice as never);
				vi.advanceTimersByTime(200_000);
				expect(escape).toHaveBeenCalledWith(alice);
			});
		});

		it("can't squeeze a throat that hasn't allowed hand chokes, and says so", () => {
			Player.LSCG.MiscModule.handChokeEnabled = false;
			const choke = vi.spyOn(collar, "HandChoke");
			const out = cast(grasp("neck"));
			expect(choke).not.toHaveBeenCalled();
			expect(out.some(a => a.includes("cannot squeeze"))).toBe(true);
		});

		it("doesn't let go of a choke a player's own hand is still holding", () => {
			leashing.AddLeashing(new Leashing(3, 3, false, "neck"));
			const release = vi.spyOn(collar, "ReleaseHandChoke");
			cast(grasp("neck"));
			expire();
			expect(release).not.toHaveBeenCalled();
		});

		it("puts the choke back after entering a room, which would otherwise clear it", () => {
			cast(grasp("neck"));
			const choke = vi.spyOn(collar, "HandChoke");
			states.SpellEffectsState.RoomSync();
			expect(choke).not.toHaveBeenCalled();
			vi.advanceTimersByTime(600);
			expect(choke).toHaveBeenCalledWith(alice, true);
		});

		it("the ass and breasts squeeze now and then, raising arousal a little each time", () => {
			cast(grasp("ass"));
			expect(player().ArousalSettings.Progress).toBe(10);
			vi.advanceTimersByTime(SQUEEZE_INTERVAL - 5_000);
			states.SpellEffectsState.Tick(Date.now());
			expect(player().ArousalSettings.Progress).toBe(10);
			vi.advanceTimersByTime(6_000);
			states.SpellEffectsState.Tick(Date.now());
			expect(player().ArousalSettings.Progress).toBe(10 + SQUEEZE_AROUSAL);
			expect(sent.actions().some(a => a.includes("squeezes and kneads"))).toBe(true);
			states.SpellEffectsState.Tick(Date.now()); // not again straight away
			expect(player().ArousalSettings.Progress).toBe(10 + SQUEEZE_AROUSAL);
		});

		it("never pushes arousal over the edge by itself", () => {
			player().ArousalSettings.Progress = 98;
			cast(grasp("breast"));
			vi.advanceTimersByTime(2 * SQUEEZE_INTERVAL);
			states.SpellEffectsState.Tick(Date.now());
			expect(player().ArousalSettings.Progress).toBe(99);
		});

		it("holds each place once: a second casting only takes the places still free", () => {
			cast(grasp("arms"));
			const out = cast(grasp("arms"));
			expect(out.some(a => a.includes("already holding all they can"))).toBe(true);
			expect(entries()).toHaveLength(1);
			cast(grasp("arms", "legs"));
			expect(entries()).toHaveLength(2);
			expect(states.AnyRestrictions(r => r.Walk)).toBe(true);
		});

		it("takes no save of its own: someone who never defends is held however the dice fall", () => {
			magic.settings.neverDefend = true;
			seedRandom([0.0, 0.99]);
			magic.IncomingSpellCommand(alice as never, { command: { name: "spell", args: [{ name: "spell", value: grasp("arms") }] } } as never);
			vi.advanceTimersByTime(1000 + 2500);
			expect(states.AnyRestrictions(r => r.Move)).toBe(true);
			expect(sent.actions().some(a => a.includes("resists"))).toBe(false);
		});

		it("holds still after a relog: the entry is plain data", () => {
			cast(grasp("arms"));
			states.settings.states = JSON.parse(JSON.stringify(states.settings.states));
			states.SpellEffectsState.RefreshRestrictions();
			expect(states.AnyRestrictions(r => r.Move)).toBe(true);
			expire();
			expect(states.AnyRestrictions(r => r.Move)).toBe(false);
		});
	});

	describe("with Echo's Ghost Hand installed", () => {
		const installGhostHands = () => ["ItemNeckRestraints", "ItemArms", "ItemLegs", "ItemFeet", "ItemBreast"].forEach(g => makeAsset(makeGroup({ Name: g }), { Name: GHOST_HAND, Category: [] } as never));

		beforeEach(installGhostHands);

		it("the hands are the item, which holds the spot instead of the spell's own effects", () => {
			cast(grasp("arms", "legs"));
			expect(worn()).toEqual([`ItemArms:${GHOST_HAND}`, `ItemFeet:${GHOST_HAND}`, `ItemLegs:${GHOST_HAND}`]);
			expect(states.AnyRestrictions(r => r.Move)).toBe(false); // Echo's item does its own holding
			expect(states.AnyRestrictions(r => r.Walk)).toBe(false);
		});

		it("the arms go behind the back, and the hands come off again with the spell", () => {
			cast(grasp("arms"));
			const arms = player().Appearance.find((i: any) => i.Asset.Group.Name === "ItemArms") as any;
			expect(arms.Property.TypeRecord).toEqual({ typed: 2 }); // P3, hands behind
			expire();
			expect(worn()).toEqual([]);
		});

		it("never replaces what is already worn", () => {
			cast(grasp("neck"));
			cast(grasp("neck"));
			expect(worn()).toEqual([`ItemNeckRestraints:${GHOST_HAND}`]);
		});

		it("the ass has no hand to wear, so it is the spell's own squeezing", () => {
			cast(grasp("ass", "breast"));
			expect(worn()).toEqual([`ItemBreast:${GHOST_HAND}`]);
			vi.advanceTimersByTime(SQUEEZE_INTERVAL + 1_000);
			states.SpellEffectsState.Tick(Date.now());
			expect(sent.actions().some(a => a.includes("squeezes and kneads"))).toBe(true); // ass
			expect(sent.actions().some(a => a.includes("knead and squeeze"))).toBe(true); // breasts, still teased as well
		});

		it("a location whose hand can't be worn falls back to the spell's own hold", () => {
			vi.stubGlobal("InventoryIsPermissionBlocked", vi.fn(() => true));
			cast(grasp("arms"));
			expect(worn()).toEqual([]);
			expect(states.AnyRestrictions(r => r.Move)).toBe(true);
		});

		it("only the pieces still the Ghost Hand are taken off", () => {
			cast(grasp("legs"));
			(globalThis as any).InventoryRemove(player(), "ItemFeet");
			expire();
			expect(worn()).toEqual([]);
		});
	});
});
