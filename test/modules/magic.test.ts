// MagicModule: the incoming-spell trust/permission gates (Enabled's Fantasy-category
// block, WhitelistBlocked, filterAllowedSpellEffects/effectIsAllowed's self-bypass,
// DefendAgainst), the duration formula (unlimited for a beneficial spell unless it's a
// bane, saveDiff*5min capped by maxDuration otherwise), effect application via
// IncomingSpell, the save-roll outcome (including a barrier bounce) via
// IncomingSpellCommand with seeded dice, magic-item detection, voice casting, and the
// potion quaff/force-feed flow.
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
import { spellEffects, type CastArgs, type SpellEffectContext } from "Modules/Magic/spellEffects";
import { sanitizeCastArgs, voiceCastArgs } from "Modules/Magic/spellEdit";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeCharacter, makeGroup, makeAsset, wear, makeItem, type FixtureCharacter } from "../harness/fixtures";
import { seedRandom, restoreRandom } from "../harness/time";
import { sent } from "../harness/room";

describe("MagicModule", () => {
	let magic: MagicModule;
	let states: StateModule;
	let alice: FixtureCharacter;

	beforeAll(() => {
		// CollarModule: getRollMod() (item-use.ts, used by MakeActivityCheck for the spell
		// save roll) reads the player's own totalChokeLevel via getModule("CollarModule")
		// unconditionally. InjectorModule: HandleQuaffWithSpell reads GetGagDrinkAccess()
		// off it to decide whether a potion must be force-fed.
		[, , , , , , magic, states] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new ItemUseModule(), new CollarModule(), new InjectorModule(), new MagicModule(), new StateModule());
		vi.useFakeTimers();
	});

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
			// getRollMod() (item-use.ts) reads these off any non-player character with no
			// further optional-chaining guard once `LSCG` itself is truthy -- a bare
			// `LSCG: { MagicModule }` throws inside it (surfaced as a silently-swallowed
			// exception, since the roll happens inside IncomingSpellCommand's setTimeout).
			LSCG: { MagicModule: { enabled: true }, StateModule: { states: [] }, CollarModule: { chokeLevel: 0 } },
		}));
		magic.settings.enabled = true;
	});

	function spell(name: string, effects: LSCGSpellEffect[], overrides: Partial<SpellDefinition> = {}): SpellDefinition {
		return { Name: name, Creator: 2, Effects: effects, AllowPotion: false, AllowVoiceCast: false, ...overrides };
	}

	describe("Enabled", () => {
		it("is disabled entirely when the room blocks the Fantasy category", () => {
			expect(magic.Enabled).toBe(true);
			const saved = globalThis.ChatRoomData;
			try {
				globalThis.ChatRoomData = { Admin: [], BlockCategory: ["Fantasy"] } as never;
				expect(magic.Enabled).toBe(false);
			} finally {
				// installBcLite() only (re-)sets ChatRoomData once per boot(), not per
				// resetWorld() -- an unrestored reassignment here would leak into every
				// later test in the file, permanently disabling magic.Enabled.
				globalThis.ChatRoomData = saved;
			}
		});
	});

	describe("WhitelistBlocked", () => {
		it("blocks a non-whitelisted stranger only when requireWhitelist is on", () => {
			magic.settings.requireWhitelist = false;
			expect(magic.WhitelistBlocked(alice as never)).toBe(false);
			magic.settings.requireWhitelist = true;
			expect(magic.WhitelistBlocked(alice as never)).toBe(true);
			player().WhiteList = [2];
			expect(magic.WhitelistBlocked(alice as never)).toBe(false);
		});

		it("never blocks the player's own casts", () => {
			magic.settings.requireWhitelist = true;
			expect(magic.WhitelistBlocked(player() as never)).toBe(false);
		});
	});

	describe("filterAllowedSpellEffects / effectIsAllowed", () => {
		it("drops a blocked effect", () => {
			magic.settings.blockedSpellEffects = [LSCGSpellEffect.blindness];
			expect(magic.filterAllowedSpellEffects(spell("test", [LSCGSpellEffect.blindness, LSCGSpellEffect.deafened]), alice as never))
				.toEqual([LSCGSpellEffect.deafened]);
		});

		it("a self-bypassed effect is allowed only when the caster is the player themself", () => {
			magic.settings.blockedSpellEffects = [LSCGSpellEffect.blindness];
			magic.settings.bypassForSelfEffects = [LSCGSpellEffect.blindness];
			expect(magic.effectIsAllowed(LSCGSpellEffect.blindness, player() as never)).toBe(true);
			expect(magic.effectIsAllowed(LSCGSpellEffect.blindness, alice as never)).toBe(false);
		});
	});

	describe("DefendAgainst", () => {
		it("never defends when neverDefend is set", () => {
			magic.settings.neverDefend = true;
			expect(magic.DefendAgainst(2)).toBe(false);
		});

		it("does not defend against a sender on the no-defense list", () => {
			magic.settings.neverDefend = false;
			magic.settings.noDefenseMemberIds = "2, 3";
			expect(magic.DefendAgainst(2)).toBe(false);
			expect(magic.DefendAgainst(5)).toBe(true);
		});
	});

	describe("IncomingSpell: duration formula", () => {
		it("a beneficial spell (e.g. bless) skips the duration formula entirely, falling back to the state's own default", () => {
			// IncomingSpell's duration computation only runs `if (!this.SpellIsBeneficial(spell))`
			// -- a beneficial spell passes `duration: undefined` straight through, so whatever
			// the target state does with an undefined duration applies. BuffedState.Bless()
			// falls back to BuffedState.BUFF_DURATION (900000ms / 15min) in that case.
			magic.settings.limitedDuration = false;
			magic.IncomingSpell(alice as never, spell("bless", [LSCGSpellEffect.bless]), null, 1);
			vi.advanceTimersByTime(2500);
			expect(states.settings.states.find(s => s.type === "buffed")?.duration).toBe(900_000);
		});

		it("a non-beneficial spell's duration is saveDiff * 5 minutes", () => {
			magic.settings.limitedDuration = true;
			magic.IncomingSpell(alice as never, spell("blind", [LSCGSpellEffect.blindness]), null, 3);
			vi.advanceTimersByTime(2500);
			expect(states.settings.states.find(s => s.type === "blind")?.duration).toBe(3 * 5 * 60_000);
		});

		it("maxDuration caps a non-beneficial spell's duration", () => {
			magic.settings.maxDuration = 2; // minutes
			magic.IncomingSpell(alice as never, spell("blind", [LSCGSpellEffect.blindness]), null, 10);
			vi.advanceTimersByTime(2500);
			expect(states.settings.states.find(s => s.type === "blind")?.duration).toBe(2 * 60_000);
		});

		it("a bane always gets a real duration even with limitedDuration off", () => {
			magic.settings.limitedDuration = false;
			magic.IncomingSpell(alice as never, spell("bane", [LSCGSpellEffect.bane]), null, 2);
			vi.advanceTimersByTime(2500);
			expect(states.settings.states.find(s => s.type === "buffed")?.duration).toBe(2 * 5 * 60_000);
		});

		it("a spell with every effect blocked fizzles entirely, applying nothing", () => {
			magic.settings.blockedSpellEffects = [LSCGSpellEffect.blindness];
			magic.IncomingSpell(alice as never, spell("blind", [LSCGSpellEffect.blindness]), null, 1);
			vi.advanceTimersByTime(2500);
			expect(states.BlindState.Active).toBe(false);
			expect(sent.actions()[0]).toContain("fizzles");
		});
	});

	describe("IncomingSpell: effect application", () => {
		it("blindness activates BlindState with an emote", () => {
			magic.IncomingSpell(alice as never, spell("blind", [LSCGSpellEffect.blindness]), null, 1);
			vi.advanceTimersByTime(2500);
			expect(states.BlindState.Active).toBe(true);
		});

		it("orgasm forces the player's arousal to completion", () => {
			player().ArousalSettings = { Progress: 10 } as never;
			magic.IncomingSpell(alice as never, spell("orgasm", [LSCGSpellEffect.orgasm]), null, 1);
			vi.advanceTimersByTime(2500);
			expect(player().ArousalSettings.Progress).toBe(100);
		});

		it("dispel clears every active state", () => {
			states.BlindState.Activate(2);
			states.DeafState.Activate(2);
			magic.IncomingSpell(alice as never, spell("dispel", [LSCGSpellEffect.dispel]), null, 1);
			vi.advanceTimersByTime(2500);
			expect(states.BlindState.Active).toBe(false);
			expect(states.DeafState.Active).toBe(false);
		});

		it("barrier activates BarrierState with the computed duration", () => {
			magic.IncomingSpell(alice as never, spell("shield", [LSCGSpellEffect.barrier]), null, 2);
			vi.advanceTimersByTime(2500);
			expect(states.BarrierState.Active).toBe(true);
		});

		it("multiple effects apply staggered, 2 seconds apart", () => {
			magic.IncomingSpell(alice as never, spell("combo", [LSCGSpellEffect.blindness, LSCGSpellEffect.deafened]), null, 1);
			vi.advanceTimersByTime(500);
			expect(states.BlindState.Active).toBe(true);
			expect(states.DeafState.Active).toBe(false);
			vi.advanceTimersByTime(2000);
			expect(states.DeafState.Active).toBe(true);
		});
	});

	describe("IncomingSpellCommand: save roll and barrier bounce", () => {
		afterEach(() => {
			restoreRandom();
		});

		it("a failed save (attacker rolls high, defender rolls low) applies the spell", () => {
			seedRandom([0.99, 0.0]); // attacker d20=20, defender d20=1
			magic.IncomingSpellCommand(alice as never, { command: { name: "spell", args: [{ name: "spell", value: spell("blind", [LSCGSpellEffect.blindness]) }] } } as never);
			vi.advanceTimersByTime(1000 + 2500);
			expect(states.BlindState.Active).toBe(true);
		});

		it("a successful save (defender rolls high, attacker rolls low) blocks the spell entirely", () => {
			seedRandom([0.0, 0.99]); // attacker d20=1, defender d20=20
			magic.IncomingSpellCommand(alice as never, { command: { name: "spell", args: [{ name: "spell", value: spell("blind", [LSCGSpellEffect.blindness]) }] } } as never);
			vi.advanceTimersByTime(1000 + 2500);
			expect(states.BlindState.Active).toBe(false);
			expect(sent.actions().some(a => a.includes("successfully saves"))).toBe(true);
		});

		it("a successful save while protected by a barrier bounces the spell back and consumes the barrier", () => {
			states.BarrierState.Barrier(1, false);
			seedRandom([0.0, 0.99]);
			magic.IncomingSpellCommand(alice as never, { command: { name: "spell", args: [{ name: "spell", value: spell("blind", [LSCGSpellEffect.blindness]) }] } } as never);
			vi.advanceTimersByTime(1000 + 2500);
			expect(states.BarrierState.Active).toBe(false);
			expect(sent.actions().some(a => a.includes("bounce back"))).toBe(true);
		});

		it("a beneficial spell is never saved against, even against a defending target", () => {
			seedRandom([0.0, 0.99]); // would fail an attacker roll, but beneficial spells skip the check
			magic.IncomingSpellCommand(alice as never, { command: { name: "spell", args: [{ name: "spell", value: spell("bless", [LSCGSpellEffect.bless]) }] } } as never);
			vi.advanceTimersByTime(1000 + 2500);
			expect(states.BuffedState.Active).toBe(true);
		});

		it("a whitelist-blocked sender's spell fizzles immediately", () => {
			magic.settings.requireWhitelist = true;
			magic.IncomingSpellCommand(alice as never, { command: { name: "spell", args: [{ name: "spell", value: spell("blind", [LSCGSpellEffect.blindness]) }] } } as never);
			expect(sent.actions()[0]).toContain("fizzles");
		});

		describe("damage on a save", () => {
			const zap = (save?: string, extra: LSCGSpellEffect[] = []) => ({
				...spell("zap", [LSCGSpellEffect.damage, ...extra]),
				Configs: [{ Type: "Fire", Roll: "2d6 + 2", ...(save ? { Save: save } : {}) }],
			}) as SpellDefinition;
			const cast = (s: SpellDefinition) => {
				magic.IncomingSpellCommand(alice as never, { command: { name: "spell", args: [{ name: "spell", value: s }] } } as never);
				vi.advanceTimersByTime(1000 + 2500);
				return sent.actions();
			};
			// Attacker d20=1, defender d20=20, then every later die comes up at the top: 2d6 + 2 = 14
			const SAVES = [0.0, 0.99];

			it("a successful save halves the damage, and nothing else of the spell applies", () => {
				seedRandom(SAVES);
				const out = cast(zap(undefined, [LSCGSpellEffect.blindness]));
				expect(out.some(a => a.includes("takes only 7 fire damage, half of 14"))).toBe(true);
				expect(states.BlindState.Active).toBe(false);
			});

			it("one save halves every Damaging copy, each by its own roll, and 'No damage' copies take none", () => {
				seedRandom(SAVES);
				const out = cast({
					...spell("storm", [LSCGSpellEffect.damage, LSCGSpellEffect.damage, LSCGSpellEffect.damage]),
					Configs: [{ Type: "Fire", Roll: "2d6 + 2" }, { Type: "Cold", Roll: "1d8", Save: "No damage" }, { Type: "Acid", Roll: "1d4" }],
				} as SpellDefinition);
				expect(out.some(a => a.includes("takes only 7 fire damage, half of 14"))).toBe(true);
				expect(out.some(a => a.includes("cold"))).toBe(false);
				expect(out.some(a => a.includes("takes only 2 acid damage, half of 4"))).toBe(true);
			});

			it("'No damage' on a save avoids the damage entirely", () => {
				seedRandom(SAVES);
				const out = cast(zap("No damage"));
				expect(out.some(a => a.includes("successfully saves"))).toBe(true);
				expect(out.some(a => a.includes("damage"))).toBe(false);
			});

			it("a failed save takes the full damage", () => {
				seedRandom([0.99, 0.0]);
				const out = cast(zap());
				expect(out.some(a => a.includes("takes 4 fire damage"))).toBe(true); // d20s 20 and 1, then both d6 land on 1: 1 + 1 + 2
				expect(out.some(a => a.includes("saves"))).toBe(false);
			});

			it("someone who never defends still saves against the damage, while the rest of the spell lands", () => {
				magic.settings.neverDefend = true;
				seedRandom(SAVES);
				const out = cast(zap(undefined, [LSCGSpellEffect.blindness]));
				expect(out.some(a => a.includes("takes only 7 fire damage"))).toBe(true);
				expect(states.BlindState.Active).toBe(true);
			});

			it("a barrier bounce takes the whole spell, with no half damage for the target", () => {
				states.BarrierState.Barrier(1, false);
				seedRandom(SAVES);
				const out = cast(zap());
				expect(out.some(a => a.includes("bounce back"))).toBe(true);
				expect(out.some(a => a.includes("damage"))).toBe(false);
			});

			it("blocking the Damaging effect blocks the half damage too", () => {
				magic.settings.blockedSpellEffects = [LSCGSpellEffect.damage];
				seedRandom(SAVES);
				expect(cast(zap()).some(a => a.includes("takes only"))).toBe(false);
			});
		});
	});

	describe("saves on any effect and cast-time questions", () => {
		const ASK = "test.ask" as SpellEffectId;
		const NEG = "test.neg" as SpellEffectId;
		const calls: Partial<SpellEffectContext>[] = [];
		const record = (ctx: SpellEffectContext) => calls.push({ effect: ctx.effect, index: ctx.index, saved: ctx.saved, castArgs: ctx.castArgs, config: ctx.config });
		const unregister: (() => void)[] = [];
		// A command-like effect: asks which word, reads the word from a voice cast, and takes half on a save
		const askConfig = {
			defaults: () => ({ Word: "a" }),
			sanitize: (raw: unknown) => ({ Word: (raw as { Word?: string })?.Word === "b" ? "b" : "a" }),
			summary: () => "ask",
			castPrompts: (c: { Word: string }) => [{ key: "word", label: "Word", default: c.Word, options: [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }, { value: "c", label: "Gamma" }] }],
			fromVoice: (_c: unknown, text: string) => /beta|乙/i.test(text) ? { word: "b" } : undefined,
		};
		const SAVES = [0.0, 0.99]; // attacker d20=1, defender d20=20
		const cast = (s: SpellDefinition, args?: CastArgs) => {
			magic.IncomingSpellCommand(alice as never, { command: { name: "spell", args: [{ name: "spell", value: s }, ...(args ? [{ name: "args", value: args }] : [])] } } as never);
			vi.advanceTimersByTime(1000 + 2000 * 4 + 500);
			return sent.actions();
		};

		beforeEach(() => {
			calls.length = 0;
			unregister.push(
				spellEffects.register({ id: ASK, label: "Ask", description: "t", stackable: 2, tier: 1, config: askConfig, onSave: "half", apply: record }),
				spellEffects.register({ id: NEG, label: "Negatable", description: "t", tier: 1, onSave: "negate", apply: record }),
			);
		});

		afterEach(() => {
			unregister.splice(0).forEach(u => u());
			restoreRandom();
		});

		describe("saves", () => {
			it("a target who never defends still saves: 'negate' effects are resisted by name, 'half' ones get the saved flag, the rest land as given", () => {
				magic.settings.neverDefend = true;
				seedRandom(SAVES);
				const out = cast(spell("mix", [NEG, ASK, LSCGSpellEffect.blindness]));
				expect(out.some(a => a.includes("resists the Negatable magic"))).toBe(true);
				expect(calls.map(c => [c.effect, c.saved])).toEqual([[ASK, true]]);
				expect(states.BlindState.Active).toBe(true);
			});

			it("without a save nothing is flagged or resisted", () => {
				magic.settings.neverDefend = true;
				seedRandom([0.99, 0.0]);
				const out = cast(spell("mix", [NEG, ASK]));
				expect(out.some(a => a.includes("resists"))).toBe(false);
				expect(calls.map(c => [c.effect, c.saved])).toEqual([[NEG, false], [ASK, false]]);
			});

			it("a full resist still lets the 'half' effects through, each with its own answers, and drops the rest", () => {
				seedRandom(SAVES);
				cast(spell("mix", [NEG, ASK, LSCGSpellEffect.blindness, ASK]), { 1: { word: "b" }, 3: { word: "c" } });
				expect(calls.map(c => [c.effect, c.index, c.saved, c.castArgs])).toEqual([[ASK, 0, true, { word: "b" }], [ASK, 1, true, { word: "c" }]]);
				expect(states.BlindState.Active).toBe(false);
			});
		});

		describe("cast answers", () => {
			it("only answers to a real question with one of its options are kept", () => {
				const s = spell("q", [ASK, LSCGSpellEffect.blindness, ASK]);
				expect(sanitizeCastArgs({ 0: { word: "c" }, 1: { word: "x" }, 2: { word: "nope", extra: "y" }, 9: { word: "a" } }, s)).toEqual({ 0: { word: "c" } });
				expect(sanitizeCastArgs("nope", s)).toBeUndefined();
				expect(sanitizeCastArgs({ 0: { word: 5 } }, s)).toBeUndefined();
			});

			it("answers sent with a spell reach the effect, and junk ones are dropped", () => {
				cast(spell("q", [ASK]), { 0: { word: "c", other: "x" }, 4: { word: "a" } });
				expect(calls[0].castArgs).toEqual({ word: "c" });
				calls.length = 0;
				cast(spell("q", [ASK]), { 0: { word: "zzz" } });
				expect(calls[0].castArgs).toBeUndefined();
			});

			it("a spell sent to another player carries the answers, and a barrier bounce sends them back", () => {
				magic.CastSpellActual(spell("q", [ASK]), alice as never, false, undefined, { 0: { word: "b" } });
				expect(sent.hidden().find(m => m.command?.name === "spell")?.command?.args).toContainEqual({ name: "args", value: { 0: { word: "b" } } });
				sent.hidden().length = 0;
				states.BarrierState.Barrier(1, false);
				seedRandom(SAVES);
				cast(spell("q", [ASK]), { 0: { word: "b" } });
				expect(sent.hidden().find(m => m.command?.name === "spell")?.command?.args).toContainEqual({ name: "args", value: { 0: { word: "b" } } });
			});

			it("casting on yourself passes the answers straight to the effect", () => {
				magic.CastSpellActual(spell("q", [ASK]), player() as never, false, undefined, { 0: { word: "b" } });
				vi.advanceTimersByTime(1000 + 2500);
				expect(calls[0].castArgs).toEqual({ word: "b" });
			});
		});

		describe("the cast menu's questions", () => {
			it("a spell with questions opens them first, with each effect's default chosen, and casts with the answers on confirm", () => {
				const s = spell("q", [ASK]);
				s.Configs = [{ Word: "b" }];
				magic.CastSpellInitial(s, alice as never);
				expect(magic.SpellCastOptions.Open).toBe(true);
				expect(magic.SpellCastOptions.Answers).toEqual({ 0: { word: "b" } });
				expect(sent.hidden().some(m => m.command?.name === "spell")).toBe(false); // nothing cast yet
				magic.SpellCastOptions.Answers[0].word = "c";
				magic.ConfirmCastPrompts();
				expect(magic.SpellCastOptions.Open).toBe(false);
				expect(sent.hidden().find(m => m.command?.name === "spell")?.command?.args).toContainEqual({ name: "args", value: { 0: { word: "c" } } });
			});

			it("a spell with no questions casts straight away", () => {
				magic.CastSpellInitial(spell("plain", [LSCGSpellEffect.blindness]), alice as never);
				expect(magic.SpellCastOptions.Open).toBe(false);
				expect(sent.hidden().some(m => m.command?.name === "spell")).toBe(true);
			});
		});

		describe("voice casting", () => {
			it("reads the answer from the words after the target's name, and falls back to the default when there are none", () => {
				const s = { ...spell("q", [ASK]), AllowVoiceCast: true };
				expect(voiceCastArgs(s, " beta please")).toEqual({ 0: { word: "b" } });
				expect(voiceCastArgs(s, " 乙")).toEqual({ 0: { word: "b" } });
				expect(voiceCastArgs(s, " nothing useful")).toBeUndefined();
			});

			it("a voice cast passes what it heard after the target to the cast", () => {
				magic.settings.knownSpells = [{ ...spell("zap", [ASK]), AllowVoiceCast: true, CastingPhrase: "zap" }];
				magic.CheckForSpellVoiceCasting("zap Alice beta");
				expect(sent.hidden().find(m => m.command?.name === "spell")?.command?.args).toContainEqual({ name: "args", value: { 0: { word: "b" } } });
			});

			it("words before the target don't count, and nothing heard means no answers are sent", () => {
				magic.settings.knownSpells = [{ ...spell("zap", [ASK]), AllowVoiceCast: true, CastingPhrase: "zap" }];
				magic.CheckForSpellVoiceCasting("beta zap Alice");
				const message = sent.hidden().find(m => m.command?.name === "spell");
				expect(message).toBeDefined();
				expect(message?.command?.args.some((arg: { name: string }) => arg.name === "args")).toBe(false);
			});
		});
	});

	describe("magic item detection", () => {
		it("IsMagicItem matches a known wand asset name or a magic-keyword craft", () => {
			const group = makeGroup({ Name: "ItemHandheld" });
			const wandAsset = makeAsset(group, { Name: "MagicWand" });
			const plainAsset = makeAsset(group, { Name: "PlainStick" });
			expect(magic.IsMagicItem(makeItem(wandAsset) as never)).toBe(false);
			expect(magic.IsMagicItem(makeItem(plainAsset, { Craft: { Name: "Enchanted Stick", Description: "" } }) as never)).toBe(true);
			expect(magic.IsMagicItem(makeItem(plainAsset) as never)).toBe(false);
			expect(magic.IsMagicItem(null)).toBe(false);
		});

		it("IsRangedItem matches only the 'wand' keyword", () => {
			const group = makeGroup({ Name: "ItemHandheld" });
			const asset = makeAsset(group, { Name: "Stick" });
			expect(magic.IsRangedItem(makeItem(asset, { Craft: { Name: "Magic Wand", Description: "" } }) as never)).toBe(true);
			expect(magic.IsRangedItem(makeItem(asset, { Craft: { Name: "Enchanted Stick", Description: "" } }) as never)).toBe(false);
		});
	});

	describe("CanUseMagic", () => {
		it("requires the target to have their own MagicModule enabled", () => {
			magic.settings.knownSpells = [spell("test", [LSCGSpellEffect.blindness])];
			expect(magic.CanUseMagic(alice as never, false, false)).toBe(true);
			alice.LSCG = { MagicModule: { enabled: false } };
			expect(magic.CanUseMagic(alice as never, false, false)).toBe(false);
		});

		it("requires known spells (or wild magic / teaching) to be available", () => {
			magic.settings.knownSpells = [];
			magic.settings.enableWildMagic = false;
			expect(magic.CanUseMagic(alice as never, false, false)).toBe(false);
			magic.settings.enableWildMagic = true;
			expect(magic.CanUseMagic(alice as never, false, false)).toBe(true);
		});
	});

	describe("voice casting", () => {
		// CastSpellActual only applies the spell locally (via IncomingSpell) when the
		// resolved target IsPlayer(); casting on someone else instead sends them a "spell"
		// packet with no local state change -- naming self in the phrase exercises the
		// locally-observable path.
		it("a chat line naming a known voice-castable spell and the player themself casts it", () => {
			magic.settings.knownSpells = [spell("frost bolt", [LSCGSpellEffect.blindness], { AllowVoiceCast: true, CastingPhrase: "frost bolt" })];
			magic.CheckForSpellVoiceCasting("frost bolt Sera");
			vi.advanceTimersByTime(1000 + 2500);
			expect(states.BlindState.Active).toBe(true);
		});

		it("casting on someone else sends them a spell packet instead of applying locally", () => {
			magic.settings.knownSpells = [spell("frost bolt", [LSCGSpellEffect.blindness], { AllowVoiceCast: true, CastingPhrase: "frost bolt" })];
			magic.CheckForSpellVoiceCasting("frost bolt Alice");
			vi.advanceTimersByTime(1000 + 2500);
			expect(states.BlindState.Active).toBe(false);
			expect(sent.hidden().some(m => m.command?.name === "spell")).toBe(true);
		});

		it("does nothing when the phrase doesn't match any known spell", () => {
			magic.settings.knownSpells = [spell("frost bolt", [LSCGSpellEffect.blindness], { AllowVoiceCast: true, CastingPhrase: "frost bolt" })];
			magic.CheckForSpellVoiceCasting("hello there Sera");
			vi.advanceTimersByTime(2500);
			expect(states.BlindState.Active).toBe(false);
		});

		it("is ignored inside OOC parentheses", () => {
			magic.settings.knownSpells = [spell("frost bolt", [LSCGSpellEffect.blindness], { AllowVoiceCast: true, CastingPhrase: "frost bolt" })];
			magic.CheckForSpellVoiceCasting("(frost bolt Sera");
			vi.advanceTimersByTime(2500);
			expect(states.BlindState.Active).toBe(false);
		});

		describe("Chinese (#877)", () => {
			const cast = (phrase: string, line: string) => {
				magic.settings.knownSpells = [spell(phrase, [LSCGSpellEffect.blindness], { AllowVoiceCast: true, CastingPhrase: phrase })];
				magic.CheckForSpellVoiceCasting(line);
				vi.advanceTimersByTime(1000 + 2500);
				return states.BlindState.Active;
			};

			it("casts a Chinese incantation followed by a space and the target", () => {
				expect(cast("冰冻术", "冰冻术 Sera")).toBe(true);
			});

			it("casts a Chinese incantation with no space before the target", () => {
				expect(cast("冰冻术", "冰冻术Sera")).toBe(true);
			});

			it("casts when the incantation sits inside a longer Chinese sentence", () => {
				expect(cast("冰冻术", "我施放冰冻术 Sera 快跑")).toBe(true);
			});

			it("casts on a target with a Chinese nickname", () => {
				globalThis.Player.Nickname = "小塞拉";
				expect(cast("冰冻术", "冰冻术 小塞拉")).toBe(true);
			});

			it("casts a mixed English/Chinese incantation", () => {
				expect(cast("frost 冰", "frost 冰 Sera")).toBe(true);
			});

			it("still requires word edges and a space for latin incantations", () => {
				expect(cast("frost bolt", "frost bolts Sera")).toBe(false);
				expect(cast("frost bolt", "frost boltSera")).toBe(false);
				expect(cast("frost bolt", "superfrost bolt Sera")).toBe(false);
			});

			it("casts an accented latin incantation as a whole phrase with a space before the name", () => {
				expect(cast("écoute", "écoute Sera")).toBe(true);
			});

			it("does not cast an accented latin incantation with no space before the name", () => {
				expect(cast("café", "caféSera")).toBe(false);
			});

			it("does not cast an accented latin incantation inside a longer word", () => {
				expect(cast("café", "descafé Sera")).toBe(false);
			});
		});
	});

	describe("potions", () => {
		it("quaffing the player's own crafted potion applies its spell", () => {
			magic.settings.knownSpells = [spell("frost potion", [LSCGSpellEffect.blindness], { AllowPotion: true })];
			const group = makeGroup({ Name: "ItemHandheld" });
			const asset = makeAsset(group, { Name: "Potion" });
			wear(alice, makeItem(asset, { Craft: { Name: "Frost Potion", Description: "", MemberNumber: 1 } }));
			magic.HandleQuaff(alice as never, true);
			vi.advanceTimersByTime(1000 + 2500);
			expect(states.BlindState.Active).toBe(true);
		});

		it("a non-consented, non-beneficial potion offered to a gagged-shut target is force-fed via a roll", () => {
			// HandleQuaff(sender, ...) reads the item off `sender`'s own hands -- `sender` is
			// whoever is HOLDING/offering the potion, not the (always-implicit) drinker. Alice
			// offering it (rather than the player self-administering) is what makes
			// HandleQuaffWithSpell's `sender.MemberNumber != Player.MemberNumber` check take
			// the force-feed branch at all.
			magic.settings.knownSpells = [spell("frost potion", [LSCGSpellEffect.blindness], { AllowPotion: true })];
			const group = makeGroup({ Name: "ItemHandheld" });
			const asset = makeAsset(group, { Name: "Potion" });
			wear(alice, makeItem(asset, { Craft: { Name: "Frost Potion", Description: "", MemberNumber: 1 } }));
			// GetGagDrinkAccess (injector.ts) returns "blocked" (not "nothing") whenever
			// IsMouthBlocked() is true, checked before IsMouthOpen() at all -- "nothing" (the
			// state TryForcePotion actually gates on) means gagged shut but not sealed.
			player().flags.mouthBlocked = false;
			player().flags.mouthOpen = false;
			seedRandom([0.99, 0.0]);
			magic.HandleQuaff(alice as never, false);
			expect(sent.actions()[0]).toContain("forcing");
		});
	});
});
