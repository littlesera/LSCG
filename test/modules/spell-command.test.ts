// The Commanding spell effect: a one-word command (kneel, follow the caster, stay in the room, strip, cum), fixed in the spell or asked of the
// caster when it is cast, picked from the words of a voice cast in English, Chinese, German or Spanish, and resisted by a save.
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
import { COMMAND_WORDS, commandFromVoice, pickCommand, sanitizeCommandConfig, type CommandConfig } from "Modules/Magic/effects/command";
import { getSpellEffect } from "Modules/Magic/spellEffects";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeAsset, makeCharacter, makeGroup, makeItem, wear, type FixtureCharacter } from "../harness/fixtures";
import { rawStub } from "../harness/bc-lite";
import { restoreRandom, seedRandom } from "../harness/time";
import { sent } from "../harness/room";

const MINUTE = 60_000;

describe("Commanding", () => {
	let magic: MagicModule;
	let states: StateModule;
	let leashing: LeashingModule;
	let alice: FixtureCharacter;

	beforeAll(() => {
		[, , , , , , magic, states, leashing] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new ItemUseModule(),
			new CollarModule(), new InjectorModule(), new MagicModule(), new StateModule(), new LeashingModule());
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({
			MemberNumber: 1, Nickname: "Sera", WhiteList: [], BlackList: [],
			LSCG: { GlobalModule: { enabled: true }, MiscModule: { chokeChainEnabled: false, gagChokeEnabled: false } },
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
		rawStub("PoseSetActive")?.mockClear();
		(globalThis as any).ActivityOrgasmPrepare.mockClear();
		(globalThis as any).ChatRoomCharacter = [player(), alice];
		player().ArousalSettings = { Progress: 0 };
	});

	afterEach(() => {
		vi.restoreAllMocks();
		restoreRandom();
	});

	const config = (over: Partial<CommandConfig> = {}): CommandConfig => ({ Word: "kneel", Ask: false, Allowed: [...COMMAND_WORDS], ...over });
	const command = (over: Partial<CommandConfig> = {}): SpellDefinition =>
		({ Name: "obey", Creator: 2, Effects: [LSCGSpellEffect.command], AllowPotion: false, AllowVoiceCast: true, Configs: [config(over)] }) as SpellDefinition;
	/** The spell lands on the player (a failed save, five minutes of it). */
	const cast = (s: SpellDefinition) => {
		magic.IncomingSpell(alice as never, s, null, 1);
		vi.advanceTimersByTime(2500);
		return sent.actions();
	};
	/** The same through the network command, which is where answers are checked. The caster rolls high and the target low, so it isn't resisted and lasts a good while. */
	const castViaCommand = (s: SpellDefinition, args?: Record<string, Record<string, string>>, rolls = [0.99, 0.0]) => {
		seedRandom(rolls);
		magic.IncomingSpellCommand(alice as never, { command: { name: "spell", args: [{ name: "spell", value: s }, ...(args ? [{ name: "args", value: args }] : [])] } } as never);
		vi.advanceTimersByTime(1000 + 2500);
		restoreRandom();
		return sent.actions();
	};
	const entries = () => states.SpellEffectsState.EntriesFor(LSCGSpellEffect.command);
	const canLeave = () => (globalThis as any).ChatRoomCanLeave() !== false;
	const emoticon = () => wear(player(), makeItem(makeAsset(makeGroup({ Name: "Emoticon" }), { Name: "Emoticon" } as never), { Property: {} })) as any;

	describe("settings", () => {
		it("fall back to kneel, no asking, every word allowed; and the default word is always one of the choices", () => {
			expect(sanitizeCommandConfig(undefined)).toEqual(config());
			expect(sanitizeCommandConfig({ Word: "dance", Ask: "yes", Allowed: ["stay", "dance"] })).toEqual({ Word: "kneel", Ask: false, Allowed: ["kneel", "stay"] });
			expect(sanitizeCommandConfig({ Word: "cum", Ask: true, Allowed: [] })).toEqual({ Word: "cum", Ask: true, Allowed: ["cum"] });
			expect(sanitizeCommandConfig({ Word: "stay", Ask: true, Allowed: ["kneel"] }).Allowed).toEqual(["kneel", "stay"]);
		});

		it("the caster's pick counts only when the spell asks, and only among its choices", () => {
			expect(pickCommand(config({ Ask: true, Allowed: ["kneel", "stay"] }), "stay")).toBe("stay");
			expect(pickCommand(config({ Ask: true, Allowed: ["kneel", "stay"] }), "cum")).toBe("kneel");
			expect(pickCommand(config({ Ask: false }), "stay")).toBe("kneel");
			expect(pickCommand(config({ Ask: true }), undefined)).toBe("kneel");
		});

		it("is unique per spell, resisted by a save, and asks nothing unless set to", () => {
			const def = getSpellEffect(LSCGSpellEffect.command)!;
			expect(def.stackable).toBeUndefined();
			expect(def.onSave).toBe("negate");
			expect(def.config!.castPrompts!(config())).toEqual([]);
			expect(def.config!.castPrompts!(config({ Ask: true, Allowed: ["stay", "cum"], Word: "stay" }))).toEqual([
				{ key: "word", label: "Command", default: "stay", options: [{ value: "stay", label: "Stay" }, { value: "cum", label: "Cum" }] },
			]);
		});
	});

	describe("reading a voice cast", () => {
		it.each([
			["kneel", "kneel"], ["Kneel for me", "kneel"], ["get on your knees", "kneel"], ["跪下", "kneel"], ["knie nieder", "kneel"], ["arrodíllate", "kneel"],
			["follow me", "follow"], ["跟我来", "follow"], ["过来", "follow"], ["folge mir", "follow"], ["sígueme", "follow"],
			["stay", "stay"], ["别走", "stay"], ["站住", "stay"], ["bleib hier", "stay"], ["quédate", "stay"],
			["strip", "strip"], ["脱掉", "strip"], ["脱光", "strip"], ["zieh dich aus", "strip"], ["desvístete", "strip"],
			["cum", "cum"], ["高潮", "cum"], ["córrete", "cum"], ["komm für mich", "cum"], ["orgasmo", "cum"],
		])("%j means %s", (text, word) => {
			expect(commandFromVoice(config({ Ask: true }), ` ${text} please`)).toBe(word);
		});

		it("takes the first word said, and only among the allowed ones", () => {
			expect(commandFromVoice(config({ Ask: true }), " stay, no, kneel")).toBe("stay");
			expect(commandFromVoice(config({ Ask: true, Allowed: ["kneel", "strip"] }), " stay then kneel")).toBe("kneel");
			expect(commandFromVoice(config({ Ask: true }), " dance for me")).toBeUndefined();
		});

		it("needs whole words in spaced scripts: kneeling, stayed and staying are not commands, and 'komm mit' isn't 'cum'", () => {
			expect(commandFromVoice(config({ Ask: true }), " she was kneeling and he stayed")).toBeUndefined();
			expect(commandFromVoice(config({ Ask: true }), " komm mit mir")).toBe("follow");
		});

		it("a voice cast carries the word to the spell when it asks, and ignores the words when it doesn't", () => {
			magic.settings.knownSpells = [{ ...command({ Ask: true }), CastingPhrase: "obey" }];
			magic.CheckForSpellVoiceCasting("obey Alice stay");
			expect(sent.hidden().find(m => m.command?.name === "spell")?.command?.args).toContainEqual({ name: "args", value: { 0: { word: "stay" } } });
		});

		it("works the same in Chinese", () => {
			magic.settings.knownSpells = [{ ...command({ Ask: true }), CastingPhrase: "命令" }];
			magic.CheckForSpellVoiceCasting("命令 Alice 跪下");
			expect(sent.hidden().find(m => m.command?.name === "spell")?.command?.args).toContainEqual({ name: "args", value: { 0: { word: "kneel" } } });
		});

		it("a fixed command sends no answers, however the caster words it", () => {
			magic.settings.knownSpells = [{ ...command({ Ask: false, Word: "stay" }), CastingPhrase: "obey" }];
			magic.CheckForSpellVoiceCasting("obey Alice kneel");
			const message = sent.hidden().find(m => m.command?.name === "spell");
			expect(message).toBeDefined();
			expect(message?.command?.args.some((a: { name: string }) => a.name === "args")).toBe(false);
		});
	});

	describe("kneel", () => {
		it("kneels the target and keeps them down, until the spell ends", () => {
			const marker = emoticon();
			const out = cast(command());
			expect(rawStub("PoseSetActive")).toHaveBeenCalledWith(player(), "Kneel", true);
			expect(marker.Property.Effect).toContain("ForceKneel");
			expect(out.some(a => a.includes("compelled to kneel"))).toBe(true);
			expect(entries()).toHaveLength(1);
			vi.advanceTimersByTime(6 * MINUTE);
			states.SpellEffectsState.Tick(Date.now());
			expect(marker.Property.Effect).not.toContain("ForceKneel");
			expect(sent.actions().some(a => a.includes("free to rise again"))).toBe(true);
		});

		it("doesn't let go of a sleeper when it ends", () => {
			const marker = emoticon();
			states.SleepState.Activate(2);
			cast(command());
			vi.advanceTimersByTime(6 * MINUTE);
			states.SpellEffectsState.Tick(Date.now());
			expect(entries()).toHaveLength(0);
			expect(marker.Property.Effect).toContain("ForceKneel");
		});

		it("is put back when the player enters a room", () => {
			const marker = emoticon();
			cast(command());
			marker.Property.Effect = [];
			rawStub("PoseSetActive")?.mockClear();
			states.SpellEffectsState.RoomSync();
			expect(marker.Property.Effect).toContain("ForceKneel");
			expect(rawStub("PoseSetActive")).toHaveBeenCalledWith(player(), "Kneel", true);
		});
	});

	describe("follow", () => {
		it("compels the target to follow the caster, tells the caster's client, and lets go afterwards", () => {
			const out = cast(command({ Word: "follow" }));
			expect(leashing.Pairings).toMatchObject([{ PairedMember: 2, Type: "compulsion", IsSource: false }]);
			expect(sent.beeps().some(b => b.target === 2 && b.message.command?.name === "add-leashing")).toBe(true);
			expect(out.some(a => a.includes("compelled to follow"))).toBe(true);
			vi.advanceTimersByTime(6 * MINUTE);
			states.SpellEffectsState.Tick(Date.now());
			expect(leashing.Pairings).toEqual([]);
			expect(sent.beeps().some(b => b.target === 2 && b.message.command?.name === "remove-leashing")).toBe(true);
		});

		it("only lets go of the compulsion this spell made", () => {
			leashing.AddLeashing(new Leashing(3, 3, false, "compulsion")); // following someone else, from elsewhere
			cast(command({ Word: "follow" }));
			expect(leashing.Pairings.map(p => p.PairedMember).sort()).toEqual([2, 3]);
			vi.advanceTimersByTime(6 * MINUTE);
			states.SpellEffectsState.Tick(Date.now());
			expect(leashing.Pairings.map(p => p.PairedMember)).toEqual([3]);
		});

		it("finds no one to follow when the caster is the target", () => {
			magic.IncomingSpell(player() as never, command({ Word: "follow" }), null, 1);
			vi.advanceTimersByTime(2500);
			expect(sent.actions().some(a => a.includes("finds no one"))).toBe(true);
			expect(leashing.Pairings).toEqual([]);
		});
	});

	describe("stay", () => {
		it("holds the target in the room until the spell ends", () => {
			expect(canLeave()).toBe(true);
			cast(command({ Word: "stay" }));
			expect(canLeave()).toBe(false);
			vi.advanceTimersByTime(6 * MINUTE);
			states.SpellEffectsState.Tick(Date.now());
			expect(canLeave()).toBe(true);
			expect(sent.actions().some(a => a.includes("can leave again"))).toBe(true);
		});

		it("safeword frees them", () => {
			cast(command({ Word: "stay" }));
			states.safeword();
			expect(canLeave()).toBe(true);
		});

		it("a new command replaces the last one without announcing the old one's end", () => {
			const marker = emoticon();
			cast(command({ Word: "kneel" }));
			const before = sent.actions().length;
			cast(command({ Word: "stay" }));
			expect(marker.Property.Effect).not.toContain("ForceKneel");
			expect(entries()).toHaveLength(1);
			expect(canLeave()).toBe(false);
			expect(sent.actions().slice(before).some(a => a.includes("free to rise"))).toBe(false);
		});
	});

	describe("strip and cum", () => {
		it("strip takes off all the clothes and underwear, nothing else", () => {
			const cloth = (name: string, groupOver: Record<string, unknown> = {}) => wear(player(), makeItem(makeAsset(makeGroup({ Name: name, Category: "Appearance", Clothing: true, ...groupOver } as never), { Name: `${name}Thing` } as never)));
			vi.stubGlobal("CharacterRefresh", vi.fn());
			cloth("Cloth");
			cloth("Bra", { Underwear: true });
			cloth("Hat", { BodyCosplay: true });
			cast(command({ Word: "strip" }));
			expect(player().Appearance.map((i: any) => i.Asset.Group.Name)).toEqual(["Hat"]);
			expect(entries()).toHaveLength(0); // instant, nothing to undo
			vi.unstubAllGlobals();
		});

		it("cum forces an orgasm", () => {
			cast(command({ Word: "cum" }));
			expect(player().ArousalSettings.Progress).toBe(100);
			expect((globalThis as any).ActivityOrgasmPrepare).toHaveBeenCalledWith(player());
			expect(entries()).toHaveLength(0);
		});
	});

	describe("asking the caster", () => {
		it("the menu asks which word, with the spell's word chosen, and casts the one picked", () => {
			const s = command({ Ask: true, Word: "stay", Allowed: ["kneel", "stay", "cum"] });
			magic.CastSpellInitial(s, alice as never);
			expect(magic.SpellCastOptions.Open).toBe(true);
			expect(magic.SpellCastOptions.Prompts[0].prompts[0].options.map(o => o.value)).toEqual(["kneel", "stay", "cum"]);
			expect(magic.SpellCastOptions.Answers).toEqual({ 0: { word: "stay" } });
			magic.SpellCastOptions.Answers[0].word = "kneel";
			magic.ConfirmCastPrompts();
			expect(sent.hidden().find(m => m.command?.name === "spell")?.command?.args).toContainEqual({ name: "args", value: { 0: { word: "kneel" } } });
		});

		it("the target does what the caster picked, but only from the spell's choices", () => {
			const s = command({ Ask: true, Word: "kneel", Allowed: ["kneel", "stay"] });
			castViaCommand(s, { 0: { word: "stay" } });
			expect(canLeave()).toBe(false);
			states.safeword();
			rawStub("PoseSetActive")?.mockClear();
			castViaCommand(s, { 0: { word: "cum" } }); // not a choice: the spell's own word
			expect(rawStub("PoseSetActive")).toHaveBeenCalledWith(player(), "Kneel", true);
			expect((globalThis as any).ActivityOrgasmPrepare).not.toHaveBeenCalled();
		});

		it("answers sent to a spell that doesn't ask are ignored", () => {
			castViaCommand(command({ Ask: false, Word: "kneel" }), { 0: { word: "cum" } });
			expect((globalThis as any).ActivityOrgasmPrepare).not.toHaveBeenCalled();
			expect(rawStub("PoseSetActive")).toHaveBeenCalledWith(player(), "Kneel", true);
		});
	});

	describe("saves", () => {
		it("a save resists any command, even for someone who never defends", () => {
			magic.settings.neverDefend = true;
			const out = castViaCommand(command({ Word: "cum" }), undefined, [0.0, 0.99]);
			expect(out.some(a => a.includes("resists the Commanding magic"))).toBe(true);
			expect((globalThis as any).ActivityOrgasmPrepare).not.toHaveBeenCalled();
			expect(player().ArousalSettings.Progress).toBe(0);
		});
	});
});
