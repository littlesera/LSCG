// Spells between two players, end to end in the unit tier: the caster's world casts, what it sent goes through JSON to the target's world, which resolves it
// with its own seeded dice and timers, and the target's replies come back to the caster's world. Each new effect is exercised across its settings.
// A handful of the same flows run in two real browsers (test/ui/two-clients.spec.ts); the spread of settings lives here, where it takes milliseconds.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { ItemUseModule } from "Modules/item-use";
import { CollarModule } from "Modules/collar";
import { InjectorModule } from "Modules/injector";
import { MagicModule } from "Modules/magic";
import { StateModule } from "Modules/states";
import { LeashingModule } from "Modules/leashing";
import { DamageType, LSCGSpellEffect, type SpellDefinition } from "Settings/Models/magic";
import { boot, player } from "../harness/world";
import { makeAsset, makeGroup, makeItem, wear } from "../harness/fixtures";
import { becomePlayer, deliver, outgoing, type PlayerSetup } from "../harness/wire";
import { restoreRandom, seedRandom } from "../harness/time";
import { sent } from "../harness/room";
import { rawStub } from "../harness/bc-lite";

const L = LSCGSpellEffect;
const MINUTE = 60_000;
/** Long enough for any spell to have run out: a roll that wins by 19 lasts 95 minutes. */
const A_DAY = 24 * 60 * MINUTE;
const CASTER: PlayerSetup = { memberNumber: 1, nickname: "Caster" };
const FAILS = [0.99, 0.0]; // attacker d20 = 20, defender d20 = 1: the spell lands
const SAVES = [0.0, 0.99]; // attacker d20 = 1, defender d20 = 20: the target saves
const DICE = Array(14).fill(0.5); // every die after those comes up in the middle: a d6 is 4, a d8 is 5, a d4 is 3

interface Cast {
	/** Settings on the target's Magic module (neverDefend, blockedSpellEffects, ...) and anything else on the target before the spell arrives. */
	target?: Partial<PlayerSetup> & { magic?: Record<string, unknown>; before?: () => void };
	/** The first rolls on the target's side; dice for effects follow. */
	rolls?: number[];
	castArgs?: Record<string, Record<string, string>>;
	/** Cast by voice instead: the caster says this to the room. */
	say?: string;
}

describe("spells between two players", () => {
	let magic: MagicModule;
	let states: StateModule;
	let leashing: LeashingModule;
	let collar: CollarModule;

	beforeAll(() => {
		[, , , , collar, , magic, states, leashing] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new ItemUseModule(),
			new CollarModule(), new InjectorModule(), new MagicModule(), new StateModule(), new LeashingModule());
		vi.useFakeTimers();
	});

	const start = (me: PlayerSetup, other: PlayerSetup, magicSettings: Record<string, unknown> = {}) => {
		const world = becomePlayer(
			{ ...me, lscg: { ...me.lscg, MagicModule: { enabled: true, limitedDuration: true, ...magicSettings } } },
			{ ...other, lscg: { ...other.lscg, MagicModule: { enabled: true, ...(other.lscg?.MagicModule ?? {}) } } },
		);
		leashing.Pairings = [];
		states.init();
		magic.init();
		(globalThis as any).ChatRoomCharacter = [player(), world.other];
		(player() as any).ArousalSettings = { Progress: 10 };
		return world;
	};

	/** The caster casts `spell` on the target; the target resolves it. Returns what the target said and sent, and the world is left as the target's. */
	function cast(spell: Partial<SpellDefinition> & { Name: string; Effects: string[] }, options: Cast = {}) {
		const full = { AllowPotion: false, AllowVoiceCast: !!options.say, Creator: 1, ...spell } as SpellDefinition;
		const casterWorld = start(CASTER, { memberNumber: 2, nickname: "Target" });
		if (options.say) {
			magic.settings.knownSpells = [{ ...full, CastingPhrase: full.Name }];
			magic.CheckForSpellVoiceCasting(options.say);
		} else {
			magic.CastSpellActual(structuredClone(full), casterWorld.other, false, undefined, options.castArgs);
		}
		const packets = outgoing();
		const castLines = sent.actions();

		const t = options.target ?? {};
		const { other: casterThere } = start({ memberNumber: 2, nickname: "Target", lscg: t.lscg }, CASTER, { ...t.magic });
		t.before?.();
		sent.raw().length = 0;
		(globalThis as any).ServerSend.mockClear?.();
		seedRandom([...(options.rolls ?? FAILS), ...DICE]);
		deliver(casterThere, packets);
		vi.advanceTimersByTime(1000 + 2000 * (full.Effects.length) + 500);
		restoreRandom();
		return { packets, castLines, said: sent.actions(), reply: outgoing(), casterThere };
	}

	/** Back in the caster's world, hand over what the target sent in reply. */
	function replyReaches(reply: ReturnType<typeof outgoing>) {
		const { other: targetThere } = start(CASTER, { memberNumber: 2, nickname: "Target" });
		deliver(targetThere, reply);
		vi.advanceTimersByTime(500);
	}

	beforeEach(() => {
		vi.stubGlobal("CharacterRefresh", vi.fn());
		vi.stubGlobal("InventoryAllow", vi.fn(() => true));
		vi.stubGlobal("SkillGetWithRatio", vi.fn(() => 0));
		vi.stubGlobal("TypedItemDataLookup", {});
		vi.stubGlobal("TypedItemSetOptionByName", vi.fn());
		vi.stubGlobal("ActivitySetArousal", vi.fn((C: { ArousalSettings: { Progress: number } }, v: number) => { C.ArousalSettings.Progress = v; }));
		rawStub("PoseSetActive")?.mockClear();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
		restoreRandom();
	});

	const lines = (said: string[]) => said.join("\n");
	const stateOf = () => states;

	describe("the cast itself", () => {
		it("announces on the caster's side, travels as one hidden spell message with its answers, and lands on the target alone", () => {
			const r = cast({ Name: "Blind", Effects: [L.blindness] });
			expect(r.castLines.some(l => l.includes("Blind"))).toBe(true);
			expect(r.packets.hidden.filter(m => m.command?.name === "spell")).toHaveLength(1);
			expect(stateOf().BlindState.Active).toBe(true); // the target's world
			start(CASTER, { memberNumber: 2, nickname: "Target" });
			expect(stateOf().BlindState.Active).toBe(false); // the caster's world is untouched
		});

		it("the save is rolled on the target's side, reported with both rolls, and resists the whole spell", () => {
			const r = cast({ Name: "Blind", Effects: [L.blindness] }, { rolls: SAVES });
			expect(r.said.find(l => l.startsWith("Save vs Blind"))).toMatch(/^Save vs Blind: \d+ \(20[+-]\d+\) vs \d+ \(1[+-]\d+\), saved!$/);
			expect(stateOf().BlindState.Active).toBe(false);
		});

		it("a failed save is reported too, and the spell lands", () => {
			const r = cast({ Name: "Blind", Effects: [L.blindness] });
			expect(r.said.find(l => l.startsWith("Save vs Blind"))).toMatch(/^Save vs Blind: \d+ \(1[+-]\d+\) vs \d+ \(20[+-]\d+\), failed\.$/);
		});

		it("a target who never defends is not given a roll against a spell with no save of its own", () => {
			const r = cast({ Name: "Blind", Effects: [L.blindness] }, { rolls: SAVES, target: { magic: { neverDefend: true } } });
			expect(r.said.some(l => l.startsWith("Save vs"))).toBe(false);
			expect(stateOf().BlindState.Active).toBe(true);
		});

		it("a blocked effect is dropped on the target's side, however the caster sent it", () => {
			cast({ Name: "Mix", Effects: [L.blindness, L.deafened] }, { target: { magic: { blockedSpellEffects: [L.deafened] } } });
			expect(stateOf().BlindState.Active).toBe(true);
			expect(stateOf().DeafState.Active).toBe(false);
		});
	});

	describe("Damaging", () => {
		const damage = (...configs: unknown[]) => ({ Name: "Zap", Effects: configs.map(() => L.damage), Configs: configs });

		it.each(Object.values(DamageType))("%s: the line names the type", type => {
			const r = cast(damage({ Type: type, Roll: "" }));
			expect(lines(r.said)).toContain(`takes ${type.toLowerCase()} damage.`);
		});

		it("rolls the dice on the target's side and shows them", () => {
			const r = cast(damage({ Type: "Fire", Roll: "2d6 + 2" }));
			expect(lines(r.said)).toContain("takes 10 fire damage. (2d6 + 2 = [4, 4] + 2)");
		});

		it("on a save the whole spell is resisted but half the damage still lands", () => {
			const r = cast({ Name: "Zap", Effects: [L.damage, L.blindness], Configs: [{ Type: "Fire", Roll: "2d6 + 2" }, null] }, { rolls: SAVES });
			expect(lines(r.said)).toContain("takes 5 fire damage, halved from 10.");
			expect(stateOf().BlindState.Active).toBe(false);
		});

		it("with 'No damage' on a save, a save means none", () => {
			const r = cast(damage({ Type: "Fire", Roll: "2d6", Save: "No damage" }), { rolls: SAVES });
			expect(lines(r.said)).not.toMatch(/damage/);
		});

		it("someone who never defends still saves against it, halving the damage while the rest of the spell lands", () => {
			const r = cast({ Name: "Zap", Effects: [L.damage, L.blindness], Configs: [{ Type: "Fire", Roll: "2d6 + 2" }, null] }, { rolls: SAVES, target: { magic: { neverDefend: true } } });
			expect(r.said.find(l => l.startsWith("Save vs"))).toMatch(/saved!$/);
			expect(lines(r.said)).toContain("takes 5 fire damage, halved from 10.");
			expect(stateOf().BlindState.Active).toBe(true);
		});

		it("three copies with their own types, rolls and saves each answer for themselves, in order", () => {
			const r = cast(damage({ Type: "Fire", Roll: "2d6 + 2" }, { Type: "Cold", Roll: "1d8", Save: "No damage" }, { Type: "Acid", Roll: "1d4" }), { rolls: SAVES });
			const said = lines(r.said);
			expect(said).toContain("takes 5 fire damage, halved from 10.");
			expect(said).not.toContain("cold");
			expect(said).toContain("takes 1 acid damage, halved from 3.");
			expect(said.indexOf("fire")).toBeLessThan(said.indexOf("acid"));
		});

		it("a fourth copy, a bogus type and a roll too big to be allowed are all cleaned on the target's side", () => {
			const r = cast(damage({ Type: "Fire" }, { Type: "Cold" }, { Type: "Acid" }, { Type: "Poison" }));
			expect(lines(r.said)).not.toContain("poison");
			const hostile = cast(damage({ Type: "Mind Flayer", Roll: "22d12" }));
			expect(lines(hostile.said)).toContain("takes force damage.");
			expect(lines(hostile.said)).not.toMatch(/\d+ (force|fire)/);
		});
	});

	describe("Dissolving Clothes", () => {
		const worn = () => player().Appearance.map((i: any) => i.Asset.Group.Name).sort();
		const dress = () => {
			const cloth = (name: string, over: Record<string, unknown> = {}) => wear(player(), makeItem(makeAsset(makeGroup({ Name: name, Category: "Appearance", Clothing: true, ...over } as never), { Name: `${name}Thing` } as never)));
			cloth("Cloth"); cloth("Bra", { Underwear: true }); cloth("Hat", { BodyCosplay: true });
			wear(player(), makeItem(makeAsset(makeGroup({ Name: "ItemArms" }), { Name: "Cuffs" } as never)));
		};

		it.each([
			["clothing", ["Bra", "Hat", "ItemArms"], "clothes dissolve"],
			["underwear", ["Cloth", "Hat", "ItemArms"], "underwear dissolve"],
			["both", ["Hat", "ItemArms"], "clothes and underwear dissolve"],
		])("%s: takes the right layers and nothing else", (Layers, left, said) => {
			const r = cast({ Name: "Poof", Effects: [L.dissolve], Configs: [{ Layers }] }, { target: { before: dress } });
			expect(worn()).toEqual(left);
			expect(lines(r.said)).toContain(said);
		});

		it("an unknown layer from the wire means clothing", () => {
			cast({ Name: "Poof", Effects: [L.dissolve], Configs: [{ Layers: "everything" }] }, { target: { before: dress } });
			expect(worn()).toEqual(["Bra", "Hat", "ItemArms"]);
		});

		it("says so when there is nothing to take", () => {
			const r = cast({ Name: "Poof", Effects: [L.dissolve], Configs: [{ Layers: "both" }] });
			expect(lines(r.said)).toContain("finds no clothes and underwear to dissolve");
		});

		it("two copies take their layers one after the other", () => {
			cast({ Name: "Poof", Effects: [L.dissolve, L.dissolve], Configs: [{ Layers: "clothing" }, { Layers: "underwear" }] }, { target: { before: dress } });
			expect(worn()).toEqual(["Hat", "ItemArms"]);
		});
	});

	describe("Web, Slime and Conjured Ropes", () => {
		const slot = (group: string, name: string) => makeAsset(makeGroup({ Name: group }), { Name: name, Category: [] } as never);
		const assets = () => {
			["ItemArms", "ItemMouth", "ItemHead"].forEach((g, i) => slot(g, ["Web", "WebGag", "WebBlindfold"][i]));
			["ItemArms", "ItemLegs", "ItemFeet", "ItemMouth", "ItemHead", "ItemHood", "ItemBoots"].forEach(g => slot(g, "Slime"));
			slot("ItemArms", "HempRope"); slot("ItemLegs", "HempRope"); slot("ItemFeet", "HempRope"); slot("ItemTorso", "HempRopeHarness");
		};
		const worn = () => player().Appearance.map((i: any) => `${i.Asset.Group.Name}:${i.Asset.Name}`).sort();
		const expire = () => { vi.advanceTimersByTime(A_DAY); states.SpellEffectsState.Tick(Date.now()); };
		const options = { target: { before: assets } };

		it.each([
			[L.web, 1, ["ItemArms:Web"]],
			[L.web, 3, ["ItemArms:Web", "ItemHead:WebBlindfold", "ItemMouth:WebGag"]],
			[L.slime, 1, ["ItemArms:Slime"]],
			[L.ropes, 1, ["ItemArms:HempRope"]],
		])("%s with %i piece(s): the main slot first, then others, never more than asked", (effect, pieces, expected) => {
			cast({ Name: "Snare", Effects: [effect], Configs: [{ Min: pieces, Max: pieces }] }, options);
			expect(worn().length).toBe(pieces);
			for (const piece of expected.filter(e => e.startsWith("ItemArms"))) expect(worn()).toContain(piece);
		});

		it.each([L.slime, L.ropes])("%s: a range is rolled on the target's side", effect => {
			cast({ Name: "Snare", Effects: [effect], Configs: [{ Min: 1, Max: 3 }] }, options);
			expect(worn().length).toBeGreaterThanOrEqual(1);
			expect(worn().length).toBeLessThanOrEqual(3);
		});

		it("a crafted item crosses with the spell and is worn only where it fits", () => {
			const craft = { Item: "HempRope", Name: "Silk rope", Description: "", Property: "Normal" };
			cast({ Name: "Snare", Effects: [L.ropes], Configs: [{ Min: 4, Max: 4, Craft: craft }] }, options);
			const crafted = (g: string) => (player().Appearance.find((i: any) => i.Asset.Group.Name === g) as any)?.Craft;
			expect(crafted("ItemArms")?.Name).toBe("Silk rope");
			expect(crafted("ItemTorso")).toBeUndefined();
		});

		it("a crafted item for another effect is thrown away, and so are settings that are out of range", () => {
			cast({ Name: "Snare", Effects: [L.web], Configs: [{ Min: 0, Max: 99, Craft: { Item: "HempRope", Name: "x", Property: "Normal" } }] }, options);
			expect(worn().every(p => !(player().Appearance.find((i: any) => `${i.Asset.Group.Name}:${i.Asset.Name}` === p) as any)?.Craft)).toBe(true);
			expect(worn().length).toBeLessThanOrEqual(3);
		});

		it("pieces come off when the spell runs out, and the target says so", () => {
			cast({ Name: "Snare", Effects: [L.web], Configs: [{ Min: 3, Max: 3 }] }, options);
			expect(worn()).toHaveLength(3);
			expire();
			expect(worn()).toEqual([]);
			expect(lines(sent.actions())).toContain("crumble away");
		});

		it("a save resists the whole spell, and a target who never defends is bound however the dice fall", () => {
			cast({ Name: "Snare", Effects: [L.web], Configs: [{ Min: 1, Max: 1 }] }, { ...options, rolls: SAVES });
			expect(worn()).toEqual([]);
			cast({ Name: "Snare", Effects: [L.web], Configs: [{ Min: 1, Max: 1 }] }, { target: { ...options.target, magic: { neverDefend: true } }, rolls: SAVES });
			expect(worn()).toEqual(["ItemArms:Web"]);
		});

		it("copies of the effect in one spell add pieces to the slots still free, each as its own entry", () => {
			cast({ Name: "Snare", Effects: [L.web, L.web], Configs: [{ Min: 1, Max: 1 }, { Min: 1, Max: 1 }] }, options);
			expect(worn()).toHaveLength(2);
			expect(states.SpellEffectsState.EntriesFor(L.web)).toHaveLength(2);
			expire();
			expect(worn()).toEqual([]);
		});
	});

	describe("Commanding", () => {
		const command = (config: Record<string, unknown>) => ({ Name: "Obey", Effects: [L.command], Configs: [{ Word: "kneel", Ask: false, Allowed: ["kneel", "follow", "stay", "strip", "cum"], ...config }] });
		const canLeave = () => (globalThis as any).ChatRoomCanLeave() !== false;

		it("kneel: the target kneels", () => {
			cast(command({ Word: "kneel" }));
			expect(rawStub("PoseSetActive")).toHaveBeenCalledWith(player(), "Kneel", true);
		});

		it("stay: the target can't leave until it ends", () => {
			cast(command({ Word: "stay" }));
			expect(canLeave()).toBe(false);
			vi.advanceTimersByTime(A_DAY);
			states.SpellEffectsState.Tick(Date.now());
			expect(canLeave()).toBe(true);
		});

		it("follow: the target is compelled, and the caster's own world is told it is being followed", () => {
			const r = cast(command({ Word: "follow" }));
			expect(leashing.Pairings).toMatchObject([{ PairedMember: 1, Type: "compulsion", IsSource: false }]);
			expect(r.reply.beeps.some(b => b.target === 1 && b.message.command?.name === "add-leashing")).toBe(true);
			replyReaches(r.reply);
			expect(leashing.Pairings).toMatchObject([{ PairedMember: 2, Type: "compulsion", IsSource: true }]);
		});

		it("cum: orgasm is started on the target", () => {
			cast(command({ Word: "cum" }));
			expect(player().ArousalSettings.Progress).toBe(100);
			expect((globalThis as any).ActivityOrgasmPrepare).toHaveBeenCalledWith(player());
		});

		it("strip: the target loses clothing and underwear but not cosplay", () => {
			const dress = () => {
				const cloth = (name: string, over: Record<string, unknown> = {}) => wear(player(), makeItem(makeAsset(makeGroup({ Name: name, Category: "Appearance", Clothing: true, ...over } as never), { Name: `${name}Thing` } as never)));
				cloth("Cloth"); cloth("Bra", { Underwear: true }); cloth("Hat", { BodyCosplay: true });
			};
			cast(command({ Word: "strip" }), { target: { before: dress } });
			expect(player().Appearance.map((i: any) => i.Asset.Group.Name)).toEqual(["Hat"]);
		});

		describe("asked of the caster", () => {
			const asking = command({ Ask: true, Word: "kneel", Allowed: ["kneel", "stay", "cum"] });

			it("the answer crosses with the spell and decides the command", () => {
				cast(asking, { castArgs: { 0: { word: "stay" } } });
				expect(canLeave()).toBe(false);
			});

			it("an answer that isn't one of the choices means the spell's own word", () => {
				cast(asking, { castArgs: { 0: { word: "strip" } } });
				expect(canLeave()).toBe(true);
				expect(rawStub("PoseSetActive")).toHaveBeenCalledWith(player(), "Kneel", true);
			});

			it("answers to a spell that doesn't ask are ignored", () => {
				cast(command({ Ask: false, Word: "kneel" }), { castArgs: { 0: { word: "cum" } } });
				expect((globalThis as any).ActivityOrgasmPrepare).not.toHaveBeenCalled();
			});

			it.each([
				["obey Target stay please", "stay"], ["obey Target 站住", "stay"], ["obey Target bleib hier", "stay"], ["obey Target quédate", "stay"],
			])("a voice cast saying %j asks for %s", (say, word) => {
				const r = cast(asking, { say });
				expect(r.packets.hidden.find(m => m.command?.name === "spell")?.command?.args).toContainEqual({ name: "args", value: { 0: { word } } });
				expect(canLeave()).toBe(false);
			});

			it("a voice cast that names nothing sends no answers, and the spell's own word is used", () => {
				const r = cast(asking, { say: "obey Target" });
				expect(r.packets.hidden.find(m => m.command?.name === "spell")?.command?.args.some(a => a.name === "args")).toBe(false);
				expect(rawStub("PoseSetActive")).toHaveBeenCalledWith(player(), "Kneel", true);
			});
		});
	});

	describe("Grasping", () => {
		const grasp = (...Locations: string[]) => ({ Name: "Seize", Effects: [L.grasp], Configs: [{ Locations }] });
		const said = () => lines(sent.actions());

		it.each([
			["arms", "Move", "arms and pin them"],
			["legs", "Walk", "legs, holding them still"],
		])("%s: held by the spell's own effects (%s), and let go when it ends", (location, restriction, line) => {
			const r = cast(grasp(location));
			expect(lines(r.said)).toContain(line);
			expect(states.AnyRestrictions(s => (s as any)[restriction])).toBe(true);
			vi.advanceTimersByTime(A_DAY);
			states.SpellEffectsState.Tick(Date.now());
			expect(states.AnyRestrictions(s => (s as any)[restriction])).toBe(false);
		});

		it("neck: a hand choke that reads as the spell's hand, and lets go when the spell ends", () => {
			const choke = cast(grasp("neck"));
			expect(lines(choke.said)).toContain("a spectral hand wraps around");
			expect(collar.handChokeModifier).toBe(1);
			expect(collar.handChokeMagic).toBe(true);
			vi.advanceTimersByTime(A_DAY);
			states.SpellEffectsState.Tick(Date.now());
			expect(collar.handChokeModifier).toBe(0);
			expect(collar.handChokeMagic).toBe(false);
		});

		it("neck: nothing happens to a target who hasn't allowed hand chokes, and the spell says so", () => {
			const r = cast(grasp("neck"), { target: { lscg: { MiscModule: { handChokeEnabled: false } } } });
			expect(lines(r.said)).toContain("cannot squeeze");
			expect(collar.handChokeModifier).toBe(0);
		});

		it.each([["ass", "ass"], ["breast", "breasts"]])("%s: squeezes now and then, raising arousal, never to the edge", (location, word) => {
			cast(grasp(location));
			expect(lines(sent.actions())).toContain(word === "ass" ? "grip of" : "cup and squeeze");
			vi.advanceTimersByTime(61_000);
			states.SpellEffectsState.Tick(Date.now());
			expect(player().ArousalSettings.Progress).toBe(15);
		});

		it("several places at once are all taken, and a sixth made-up one is not", () => {
			cast(grasp("arms", "legs", "ass", "breast", "neck", "elbow"));
			expect(states.AnyRestrictions(s => (s as any).Move)).toBe(true);
			expect(states.AnyRestrictions(s => (s as any).Walk)).toBe(true);
			expect(said()).not.toContain("elbow");
		});

		it("with Echo's Ghost Hand installed the hands are the item, and come off with the spell", () => {
			const echo = () => ["ItemNeckRestraints", "ItemArms", "ItemLegs", "ItemFeet", "ItemBreast"].forEach(g => makeAsset(makeGroup({ Name: g }), { Name: "鬼手", Category: [] } as never));
			vi.stubGlobal("TypedItemSetOptionByName", vi.fn((_C: unknown, item: { Property: Record<string, unknown> }, name: string) => { item.Property = { ...item.Property, TypeRecord: { typed: Number(name.slice(1)) - 1 } }; }));
			cast(grasp("arms", "legs", "breast"), { target: { before: echo } });
			expect(player().Appearance.map((i: any) => `${i.Asset.Group.Name}:${i.Asset.Name}`).sort()).toEqual(["ItemArms:鬼手", "ItemBreast:鬼手", "ItemFeet:鬼手", "ItemLegs:鬼手"]);
			expect(states.AnyRestrictions(s => (s as any).Move)).toBe(false); // Echo's item does its own holding
			vi.advanceTimersByTime(A_DAY);
			states.SpellEffectsState.Tick(Date.now());
			expect(player().Appearance).toEqual([]);
		});

		it("a hostile or empty list of places means the arms", () => {
			cast({ Name: "Seize", Effects: [L.grasp], Configs: [{ Locations: ["nowhere"] }] });
			expect(states.AnyRestrictions(s => (s as any).Move)).toBe(true);
		});
	});

	describe("teaching", () => {
		it("a taught spell arrives cleaned, with its settings and its power worked out on the receiving side", () => {
			start(CASTER, { memberNumber: 2, nickname: "Target" });
			const hostile = {
				Name: "Learned", Creator: 1, AllowPotion: false, AllowVoiceCast: false, Tier: 99,
				Effects: [L.damage, L.damage, L.damage, L.damage, L.command, "ext.unknown"],
				Configs: [{ Type: "Fire", Roll: "2d6" }, { Type: "Bogus", Roll: "22d12" }, {}, {}, { Word: "dance", Ask: true, Allowed: ["cum"] }, { evil: "x".repeat(5000) }],
			};
			const { other: targetThere } = start({ memberNumber: 2, nickname: "Target" }, CASTER);
			magic.IncomingSpellTeachCommand(targetThere as never, { command: { name: "spell-teach", args: [{ name: "spell", value: JSON.parse(JSON.stringify(hostile)) }] } } as never);
			const learned = magic.settings.knownSpells.find(s => s.Name === "Learned")!;
			expect(learned.Effects).toEqual([L.damage, L.damage, L.damage, L.command, "ext.unknown"]); // a fourth copy dropped
			expect((learned.Configs as any[])[1]).toEqual({ Type: "Force", Save: "Half damage", Roll: "" });
			expect((learned.Configs as any[])[3]).toEqual({ Word: "kneel", Ask: true, Allowed: ["kneel", "cum"] });
			expect((learned.Configs as any[])[4]).toBeNull();
			expect(learned.Tier).toBe(2 + 1 + 1 + 2); // Fire 2d6 is tier 2, the other two damages have no roll, commanding 2, the unknown counts for nothing
		});
	});
});
