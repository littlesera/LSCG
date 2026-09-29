// InjectorModule: GetDrugTypes keyword matrix, IsDrugAllowed permission gate,
// GetGagDrinkAccess (FunnelGag/RingGag typed records vs mouth-blocked/mouth-open),
// the Drink*/Inject* apply flows (level movement, caps, DoCure reset), the sedative
// -> sleep state transition, cooldown decay, HasNetgun, HoldingDruggedDrink and
// IsSipOffer.
//
// MiniGameStart is a canvas/GUI minigame launcher that bc-lite.ts deliberately does
// not stub (out of this project's scope -- see AddSedative/AddMindControl below).
// Unlike HypnoModule's `alwaysSubmit` bypass, InjectorModule has no settings flag
// that skips it, so every test that would otherwise hit `!this.asleep && minigame`
// (AddSedative) or `!this.brainwashed && minigame` (AddMindControl) either passes
// `minigame: false` directly, or pre-activates SleepState/HypnoState so the
// minigame-start branch is skipped, exactly as this session's Hypno tests did with
// `alwaysSubmit = true` for BrainwashMiniGame.
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ActivityModule } from "Modules/activities";
import { ConsentModule } from "Modules/consent";
import { HypnoModule } from "Modules/hypno";
import { InjectorModule } from "Modules/injector";
import { LeashingModule } from "Modules/leashing";
import { StateModule } from "Modules/states";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeGroup, makeAsset, wear, makeItem, type FixtureCharacter } from "../harness/fixtures";

describe("InjectorModule", () => {
	let injector: InjectorModule;
	let states: StateModule;
	let hypno: HypnoModule;
	let handheldGroup: ReturnType<typeof makeGroup>;
	let mouthGroup: ReturnType<typeof makeGroup>;

	beforeAll(() => {
		// LeashingModule: SleepState.Activate() releases any grabs the sleeper is holding.
		// HypnoModule: HypnoState.Activate()'s SetHypnoEyes reads HypnoModule's settings
		// (hypnoEyeType/hypnoEyeColor) directly -- it isn't itself under test here, just a
		// dependency of the shared HypnoState that InjectSedative/AddMindControl reach into.
		[, , , , injector, hypno, states] = boot(
			new CoreModule(), new ConsentModule(), new ActivityModule(), new LeashingModule(),
			new InjectorModule(), new HypnoModule(), new StateModule(),
		);
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
		states.init();
		hypno.init();
		injector.init();
		injector.settings.enabled = true;
		injector.settings.enableSedative = true;
		injector.settings.enableMindControl = true;
		injector.settings.enableHorny = true;
		handheldGroup = makeGroup({ Name: "ItemHandheld" });
		mouthGroup = makeGroup({ Name: "ItemMouth" });
	});

	function wearHandheld(name: string, craft?: { Name: string; Description?: string; MemberNumber?: number }) {
		const asset = makeAsset(handheldGroup, { Name: name });
		wear(player(), makeItem(asset, craft ? { Craft: { Name: craft.Name, Description: craft.Description ?? "", MemberNumber: craft.MemberNumber } } : {}));
	}

	describe("GetDrugTypes", () => {
		it("matches a sedative keyword in the name", () => {
			expect(injector.GetDrugTypes({ Name: "Tranquilizer Serum", Description: "" } as never)).toEqual(["sedative"]);
		});

		it("matches a mindcontrol keyword in the description", () => {
			expect(injector.GetDrugTypes({ Name: "Mystery Fluid", Description: "smells like hypnotizing gas" } as never)).toEqual(["mindcontrol"]);
		});

		it("matches a horny keyword", () => {
			expect(injector.GetDrugTypes({ Name: "Pink Serum", Description: "an aphrodisiac blend" } as never)).toEqual(["horny"]);
		});

		it("matches a cure keyword, reported as 'antidote'", () => {
			expect(injector.GetDrugTypes({ Name: "Healing Draught", Description: "" } as never)).toEqual(["antidote"]);
		});

		it("matches multiple types at once when the text contains several keyword lists' phrases", () => {
			let types = injector.GetDrugTypes({ Name: "Sedative Aphrodisiac Mix", Description: "a mind control cocktail" } as never);
			expect(types.sort()).toEqual(["horny", "mindcontrol", "sedative"].sort());
		});

		it("matches nothing when no configured keyword appears", () => {
			expect(injector.GetDrugTypes({ Name: "Plain Water", Description: "just water" } as never)).toEqual([]);
		});

		it("respects word boundaries (a substring match inside another word doesn't count)", () => {
			// "cure" keyword shouldn't match "curedent" or similar embedded text.
			expect(injector.GetDrugTypes({ Name: "Manicure Kit", Description: "" } as never)).toEqual([]);
		});
	});

	describe("IsDrugAllowed", () => {
		let sender: FixtureCharacter;

		beforeEach(() => {
			sender = addToRoom(makeCharacterHandheld());
		});

		function makeCharacterHandheld(): FixtureCharacter {
			const c = { ...player(), MemberNumber: 5, IsPlayer: () => false, Appearance: [] as never[] } as FixtureCharacter;
			return c;
		}

		it("false when the sender is holding nothing crafted", () => {
			expect(injector.IsDrugAllowed(sender as never)).toBe(false);
		});

		it("true for a sedative item when enableSedative is on", () => {
			const asset = makeAsset(handheldGroup, { Name: "Syringe" });
			wear(sender, makeItem(asset, { Craft: { Name: "Sedative Shot", Description: "" } }));
			expect(injector.IsDrugAllowed(sender as never)).toBe(true);
		});

		it("false for a sedative item when enableSedative is off", () => {
			injector.settings.enableSedative = false;
			const asset = makeAsset(handheldGroup, { Name: "Syringe" });
			wear(sender, makeItem(asset, { Craft: { Name: "Sedative Shot", Description: "" } }));
			expect(injector.IsDrugAllowed(sender as never)).toBe(false);
		});

		it("antidote items are always allowed, regardless of the enable* flags", () => {
			injector.settings.enableSedative = false;
			injector.settings.enableMindControl = false;
			injector.settings.enableHorny = false;
			const asset = makeAsset(handheldGroup, { Name: "Syringe" });
			wear(sender, makeItem(asset, { Craft: { Name: "Antidote Shot", Description: "" } }));
			expect(injector.IsDrugAllowed(sender as never)).toBe(true);
		});

		it("false for an item that matches no drug keywords at all", () => {
			const asset = makeAsset(handheldGroup, { Name: "Syringe" });
			wear(sender, makeItem(asset, { Craft: { Name: "Saline Shot", Description: "" } }));
			expect(injector.IsDrugAllowed(sender as never)).toBe(false);
		});
	});

	describe("GetGagDrinkAccess", () => {
		it("'nothing' with no mouth item and the mouth neither blocked nor open", () => {
			player().flags.mouthBlocked = false;
			player().flags.mouthOpen = false;
			expect(injector.GetGagDrinkAccess(player() as never)).toBe("nothing");
		});

		it("'blocked' when the mouth is blocked (and no override gag is worn)", () => {
			player().flags.mouthBlocked = true;
			expect(injector.GetGagDrinkAccess(player() as never)).toBe("blocked");
		});

		it("'open' when the mouth is open and not blocked", () => {
			player().flags.mouthBlocked = false;
			player().flags.mouthOpen = true;
			expect(injector.GetGagDrinkAccess(player() as never)).toBe("open");
		});

		it("a typed=1 FunnelGag forces 'open' even though the mouth itself is blocked", () => {
			player().flags.mouthBlocked = true;
			const asset = makeAsset(mouthGroup, { Name: "FunnelGag" });
			wear(player(), makeItem(asset, { Property: { TypeRecord: { typed: 1 } } }));
			expect(injector.GetGagDrinkAccess(player() as never)).toBe("open");
		});

		it("a FunnelGag with typed=0 does not override -- falls through to the blocked/open check", () => {
			player().flags.mouthBlocked = true;
			const asset = makeAsset(mouthGroup, { Name: "FunnelGag" });
			wear(player(), makeItem(asset, { Property: { TypeRecord: { typed: 0 } } }));
			expect(injector.GetGagDrinkAccess(player() as never)).toBe("blocked");
		});

		it("a RingGag (no typed check required) forces 'open' even while blocked", () => {
			player().flags.mouthBlocked = true;
			const asset = makeAsset(mouthGroup, { Name: "RingGag" });
			wear(player(), makeItem(asset, {}));
			expect(injector.GetGagDrinkAccess(player() as never)).toBe("open");
		});

		it("an unrelated gag (not FunnelGag/RingGag) does not override -- reads blocked normally", () => {
			player().flags.mouthBlocked = true;
			const asset = makeAsset(mouthGroup, { Name: "BallGag" });
			wear(player(), makeItem(asset, {}));
			expect(injector.GetGagDrinkAccess(player() as never)).toBe("blocked");
		});
	});

	describe("ProcessDruggedDrink / DrinkSedative / DrinkMindControl / DrinkHorny / DrinkCure", () => {
		let sender: FixtureCharacter;

		beforeEach(() => {
			sender = addToRoom({ ...player(), MemberNumber: 5, IsPlayer: () => false, Appearance: [] as never[] } as FixtureCharacter);
		});

		it("a sedative drink raises sedativeLevel by the drink multiplier", () => {
			const asset = makeAsset(handheldGroup, { Name: "GlassFilled" });
			wear(sender, makeItem(asset, { Craft: { Name: "Sedative Cocktail", Description: "" } }));
			expect(injector.sedativeLevel).toBe(0);
			injector.ProcessDruggedDrink(sender as never);
			// drugLevelMultiplier (100) * DRINK_MULTIPLIER (2) = 200
			expect(injector.sedativeLevel).toBe(200);
		});

		it("a mindcontrol drink raises mindControlLevel", () => {
			const asset = makeAsset(handheldGroup, { Name: "GlassFilled" });
			wear(sender, makeItem(asset, { Craft: { Name: "Hypnotizing Punch", Description: "" } }));
			injector.ProcessDruggedDrink(sender as never);
			expect(injector.mindControlLevel).toBe(200);
		});

		it("a horny drink raises hornyLevel", () => {
			const asset = makeAsset(handheldGroup, { Name: "GlassFilled" });
			wear(sender, makeItem(asset, { Craft: { Name: "Aphrodisiac Cocktail", Description: "" } }));
			injector.ProcessDruggedDrink(sender as never);
			expect(injector.hornyLevel).toBe(200);
		});

		it("sedative level is capped at sedativeMax * drugLevelMultiplier", () => {
			injector.sedativeLevel = 390;
			const asset = makeAsset(handheldGroup, { Name: "GlassFilled" });
			wear(sender, makeItem(asset, { Craft: { Name: "Sedative Cocktail", Description: "" } }));
			injector.ProcessDruggedDrink(sender as never);
			// sedativeMax (4) * drugLevelMultiplier (100) = 400 cap
			expect(injector.sedativeLevel).toBe(400);
		});

		it("a cure drink (DrinkCure) resets all three levels to 0", () => {
			injector.sedativeLevel = 150;
			injector.mindControlLevel = 100;
			injector.hornyLevel = 50;
			const asset = makeAsset(handheldGroup, { Name: "GlassFilled" });
			wear(sender, makeItem(asset, { Craft: { Name: "Antidote Cocktail", Description: "" } }));
			injector.ProcessDruggedDrink(sender as never);
			expect(injector.sedativeLevel).toBe(0);
			expect(injector.mindControlLevel).toBe(0);
			expect(injector.hornyLevel).toBe(0);
		});

		it("does nothing when the held item isn't crafted", () => {
			const asset = makeAsset(handheldGroup, { Name: "GlassFilled" });
			wear(sender, makeItem(asset, {}));
			injector.ProcessDruggedDrink(sender as never);
			expect(injector.sedativeLevel).toBe(0);
		});

		it("a disabled drug type is not applied even if its keyword matches", () => {
			injector.settings.enableHorny = false;
			const asset = makeAsset(handheldGroup, { Name: "GlassFilled" });
			wear(sender, makeItem(asset, { Craft: { Name: "Aphrodisiac Cocktail", Description: "" } }));
			injector.ProcessDruggedDrink(sender as never);
			expect(injector.hornyLevel).toBe(0);
		});
	});

	describe("ProcessInjection / InjectSedative / InjectMindControl / InjectHorny / InjectCure", () => {
		let sender: FixtureCharacter;

		beforeEach(() => {
			sender = addToRoom({ ...player(), MemberNumber: 5, IsPlayer: () => false, Appearance: [] as never[] } as FixtureCharacter);
		});

		it("a sedative injection to the neck raises sedativeLevel by the neck multiplier", () => {
			const asset = makeAsset(handheldGroup, { Name: "MedicalInjector" });
			wear(sender, makeItem(asset, { Craft: { Name: "Sedative Shot", Description: "" } }));
			injector.ProcessInjection(sender as never, "ItemNeck");
			// drugLevelMultiplier (100) * NECK multiplier (2) = 200
			expect(injector.sedativeLevel).toBe(200);
		});

		it("an injection to the feet (lower multiplier) raises the level by less than a neck injection", () => {
			const asset = makeAsset(handheldGroup, { Name: "MedicalInjector" });
			wear(sender, makeItem(asset, { Craft: { Name: "Sedative Shot", Description: "" } }));
			injector.ProcessInjection(sender as never, "ItemFeet");
			// drugLevelMultiplier (100) * FEET multiplier (0.8) = 80
			expect(injector.sedativeLevel).toBe(80);
		});

		it("an unlisted location falls back to a 1x multiplier", () => {
			const asset = makeAsset(handheldGroup, { Name: "MedicalInjector" });
			wear(sender, makeItem(asset, { Craft: { Name: "Sedative Shot", Description: "" } }));
			injector.ProcessInjection(sender as never, "ItemPelvis" as never);
			expect(injector.sedativeLevel).toBe(100);
		});

		it("InjectCure (DoCure) resets levels and clears sleep/hypno states", () => {
			injector.AddSedative(1, false);
			states.SleepState.Activate(sender.MemberNumber, undefined, false);
			expect(injector.asleep).toBe(true);
			const asset = makeAsset(handheldGroup, { Name: "MedicalInjector" });
			wear(sender, makeItem(asset, { Craft: { Name: "Antidote Shot", Description: "" } }));
			injector.ProcessInjection(sender as never, "ItemArms");
			expect(injector.sedativeLevel).toBe(0);
			expect(injector.asleep).toBe(false);
		});
	});

	describe("AddSedative / AddMindControl / AddHorny", () => {
		it("AddSedative with minigame:false raises the level without touching MiniGameStart/sleep state", () => {
			injector.AddSedative(1, false);
			expect(injector.sedativeLevel).toBe(100);
			expect(injector.asleep).toBe(false);
		});

		it("AddSedative respects the sedativeMax cap", () => {
			injector.AddSedative(10, false);
			expect(injector.sedativeLevel).toBe(400);
		});

		it("AddMindControl with minigame:false raises mindControlLevel without activating HypnoState", () => {
			injector.AddMindControl(1, false);
			expect(injector.mindControlLevel).toBe(100);
			expect(injector.brainwashed).toBe(false);
		});

		it("AddHorny raises hornyLevel and calls ActivityOrgasmPrepare once it hits the cap (forceCum default true)", () => {
			injector.AddHorny(10);
			expect(injector.hornyLevel).toBe(400);
			expect(globalThis.ActivityOrgasmPrepare).toHaveBeenCalledWith(player());
		});

		it("AddHorny with forceCum:false does not call ActivityOrgasmPrepare even at the cap", () => {
			injector.AddHorny(10, false);
			expect(injector.hornyLevel).toBe(400);
			expect(globalThis.ActivityOrgasmPrepare).not.toHaveBeenCalled();
		});

		describe("sedative -> sleep state transition (minigame:true path)", () => {
			it("does not touch MiniGameStart/SleepState.Active while already asleep (skips the minigame-start branch)", () => {
				states.SleepState.Activate(player().MemberNumber, undefined, false);
				expect(injector.asleep).toBe(true);
				// minigame defaults to true, but the `!this.asleep && minigame` guard means
				// MiniGameStart (unstubbed canvas/GUI global) is never reached here.
				expect(() => injector.AddSedative(1)).not.toThrow();
				expect(injector.sedativeLevel).toBe(100);
				expect(injector.asleep).toBe(true);
			});

			it("Sleep() activates SleepState (the observable outcome of a minigame loss), independent of the minigame UI itself", () => {
				expect(injector.asleep).toBe(false);
				injector.Sleep(false, 60_000);
				expect(injector.asleep).toBe(true);
				// NOTE: settings.stats defaults to `{}` (unlike e.g. CollarModule, which seeds
				// each counter at 0), so this ++ on a fresh install produces NaN, not 1. Not the
				// bug this task is scoped to fix (only HasNetgun is); flagging here instead.
				expect(injector.settings.stats.sedatedCount).toBeNaN();
			});
		});

		describe("mindcontrol -> brainwashed state transition (minigame:true path)", () => {
			it("does not touch MiniGameStart/HypnoState.Active while already brainwashed", () => {
				states.HypnoState.Activate(player().MemberNumber);
				expect(injector.brainwashed).toBe(true);
				expect(() => injector.AddMindControl(1)).not.toThrow();
				expect(injector.mindControlLevel).toBe(100);
				expect(injector.brainwashed).toBe(true);
			});

			it("Brainwash() activates HypnoState (the observable outcome of a minigame loss)", () => {
				expect(injector.brainwashed).toBe(false);
				injector.Brainwash();
				expect(injector.brainwashed).toBe(true);
				// See the same settings.stats-defaults-to-{} note in the Sleep() test above.
				expect(injector.settings.stats.brainwashedCount).toBeNaN();
			});
		});
	});

	describe("SedativeCooldown / MindControlCooldown / HornyCooldown", () => {
		it("SedativeCooldown reduces sedativeLevel by drugLevelMultiplier / (cooldown/tick) per tick", () => {
			injector.AddSedative(1, false);
			expect(injector.sedativeLevel).toBe(100);
			injector.SedativeCooldown();
			// subtractive = 100 / (180000 / 6000) = 100/30 = 3.333...
			expect(injector.sedativeLevel).toBeCloseTo(100 - 100 / 30, 5);
		});

		it("SedativeCooldown floors at 0 and does not go negative", () => {
			injector.AddSedative(0.01, false);
			for (let i = 0; i < 50; i++) injector.SedativeCooldown();
			expect(injector.sedativeLevel).toBe(0);
		});

		it("SedativeCooldown does nothing when the level is already 0", () => {
			expect(injector.sedativeLevel).toBe(0);
			injector.SedativeCooldown();
			expect(injector.sedativeLevel).toBe(0);
		});

		it("SedativeCooldown wakes the wearer once the level decays to 0 while asleep", () => {
			injector.AddSedative(0.01, false);
			states.SleepState.Activate(player().MemberNumber, undefined, false);
			expect(injector.asleep).toBe(true);
			injector.SedativeCooldown();
			expect(injector.sedativeLevel).toBe(0);
			expect(injector.asleep).toBe(false);
		});

		it("MindControlCooldown reduces mindControlLevel per tick and floors at 0", () => {
			injector.AddMindControl(1, false);
			expect(injector.mindControlLevel).toBe(100);
			for (let i = 0; i < 50; i++) injector.MindControlCooldown();
			expect(injector.mindControlLevel).toBe(0);
		});

		it("MindControlCooldown snaps the wearer back once decayed to 0 while brainwashed", () => {
			injector.AddMindControl(0.01, false);
			states.HypnoState.Activate(player().MemberNumber);
			expect(injector.brainwashed).toBe(true);
			injector.MindControlCooldown();
			expect(injector.mindControlLevel).toBe(0);
			expect(injector.brainwashed).toBe(false);
		});

		it("HornyCooldown reduces hornyLevel per tick and floors at 0", () => {
			injector.AddHorny(1, false);
			expect(injector.hornyLevel).toBe(100);
			for (let i = 0; i < 50; i++) injector.HornyCooldown();
			expect(injector.hornyLevel).toBe(0);
		});
	});

	describe("HasNetgun", () => {
		it("returns false for a null character", () => {
			expect(injector.HasNetgun(null)).toBe(false);
		});

		it("reflects the queried character's OWN handheld inventory, not Player's", () => {
			// Regression test for the flagged bug: HasNetgun(C) previously read
			// InventoryGet(Player, ...) and GetHandheldItemNameAndDescriptionConcat()
			// (which itself defaults to Player) instead of C, so it answered about
			// whoever's inventory Player happened to be holding, never the passed-in C.
			const other = addToRoom({ ...player(), MemberNumber: 5, IsPlayer: () => false, Appearance: [] as never[] } as FixtureCharacter);
			const asset = makeAsset(handheldGroup, { Name: "MedicalInjector" });
			wear(other, makeItem(asset, { Craft: { Name: "Net Gun", Description: "a net gun" } }));
			// Player is holding nothing.
			expect(player().Appearance.find(i => i.Asset.Group.Name === "ItemHandheld")).toBeUndefined();
			expect(injector.HasNetgun(other as never)).toBe(true);
		});

		it("false when the character's handheld asset isn't in AllowedNetGuns", () => {
			const other = addToRoom({ ...player(), MemberNumber: 5, IsPlayer: () => false, Appearance: [] as never[] } as FixtureCharacter);
			const asset = makeAsset(handheldGroup, { Name: "GlassFilled" });
			wear(other, makeItem(asset, { Craft: { Name: "Net Gun", Description: "a net gun" } }));
			expect(injector.HasNetgun(other as never)).toBe(false);
		});

		it("false when the character's crafted item text doesn't match a netgun keyword", () => {
			const other = addToRoom({ ...player(), MemberNumber: 5, IsPlayer: () => false, Appearance: [] as never[] } as FixtureCharacter);
			const asset = makeAsset(handheldGroup, { Name: "MedicalInjector" });
			wear(other, makeItem(asset, { Craft: { Name: "Sedative Shot", Description: "" } }));
			expect(injector.HasNetgun(other as never)).toBe(false);
		});

		it("false when the character isn't holding anything crafted at all", () => {
			const other = addToRoom({ ...player(), MemberNumber: 5, IsPlayer: () => false, Appearance: [] as never[] } as FixtureCharacter);
			expect(injector.HasNetgun(other as never)).toBe(false);
		});
	});

	describe("HoldingDruggedDrink", () => {
		it("false when holding nothing", () => {
			expect(injector.HoldingDruggedDrink(player() as never)).toBe(false);
		});

		it("false when holding a filled glass with no crafted drug", () => {
			const asset = makeAsset(handheldGroup, { Name: "GlassFilled" });
			wear(player(), makeItem(asset, {}));
			expect(injector.HoldingDruggedDrink(player() as never)).toBe(false);
		});

		it("true when holding a crafted, drugged GlassFilled", () => {
			const asset = makeAsset(handheldGroup, { Name: "GlassFilled" });
			wear(player(), makeItem(asset, { Craft: { Name: "Sedative Cocktail", Description: "" } }));
			expect(injector.HoldingDruggedDrink(player() as never)).toBe(true);
		});

		it("true when holding a crafted, drugged Mug", () => {
			const asset = makeAsset(handheldGroup, { Name: "Mug" });
			wear(player(), makeItem(asset, { Craft: { Name: "Sedative Cocktail", Description: "" } }));
			expect(injector.HoldingDruggedDrink(player() as never)).toBe(true);
		});

		it("false when the crafted item's text matches no drug keywords", () => {
			const asset = makeAsset(handheldGroup, { Name: "GlassFilled" });
			wear(player(), makeItem(asset, { Craft: { Name: "Plain Water", Description: "" } }));
			expect(injector.HoldingDruggedDrink(player() as never)).toBe(false);
		});

		it("false for a non-drink handheld item even when crafted with drug keywords", () => {
			const asset = makeAsset(handheldGroup, { Name: "MedicalInjector" });
			wear(player(), makeItem(asset, { Craft: { Name: "Sedative Shot", Description: "" } }));
			expect(injector.HoldingDruggedDrink(player() as never)).toBe(false);
		});
	});

	describe("IsSipOffer", () => {
		it("false when the module is disabled", () => {
			injector.settings.enabled = false;
			const other = addToRoom({ ...player(), MemberNumber: 5, IsPlayer: () => false, LSCG: { InjectorModule: { enabled: true } } } as FixtureCharacter);
			expect(injector.IsSipOffer(other as never)).toBe(false);
		});

		it("false for a null/undefined target", () => {
			expect(injector.IsSipOffer(null)).toBe(false);
			expect(injector.IsSipOffer(undefined)).toBe(false);
		});

		it("false when the target is the player", () => {
			expect(injector.IsSipOffer(player() as never)).toBe(false);
		});

		it("false when the target doesn't have InjectorModule enabled on their own LSCG settings", () => {
			const other = addToRoom({
				...player(), MemberNumber: 5, IsPlayer: () => false,
				LSCG: { InjectorModule: { enabled: false } },
				flags: { ...player().flags, mouthBlocked: false, mouthOpen: false },
			} as FixtureCharacter);
			expect(injector.IsSipOffer(other as never)).toBe(false);
		});

		it("true when the target has InjectorModule enabled and their mouth access is 'nothing'", () => {
			const other = addToRoom({
				...player(), MemberNumber: 5, IsPlayer: () => false,
				LSCG: { InjectorModule: { enabled: true } },
				flags: { ...player().flags, mouthBlocked: false, mouthOpen: false },
				Appearance: [] as never[],
			} as FixtureCharacter);
			expect(injector.IsSipOffer(other as never)).toBe(true);
		});

		it("false when the target's mouth access is already 'open' (no offer needed)", () => {
			const other = addToRoom({
				...player(), MemberNumber: 5, IsPlayer: () => false,
				LSCG: { InjectorModule: { enabled: true } },
				flags: { ...player().flags, mouthBlocked: false, mouthOpen: true },
				Appearance: [] as never[],
			} as FixtureCharacter);
			expect(injector.IsSipOffer(other as never)).toBe(false);
		});
	});
});
