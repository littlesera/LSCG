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
import { LSCGSpellEffect, type SpellDefinition } from "Settings/Models/magic";
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
				Damage: { Type: "Fire", Roll: "2d6 + 2", ...(save ? { Save: save } : {}) },
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
