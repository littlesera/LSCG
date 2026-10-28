// Migrators: pure fixture-in/fixture-out transforms that reshape Player.LSCG
// when the mod version bumps. Tested in isolation and through CoreModule's
// CheckForMigrations orchestration.
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CoreModule } from "Modules/core";
import { OutfitCollectionModule } from "Modules/outfitCollection";
import { StateMigrator } from "Modules/Migrators/StateMigrator";
import { OpacityMigrator } from "Modules/Migrators/OpacityMigrator";
import { SuggestionSettingMigrator } from "Modules/Migrators/SuggestionSettingMigrator";
import { OutfitMigrator } from "Modules/Migrators/OutfitMigrator";
import { CursedItemMigrator } from "Modules/Migrators/CursedItemMigrator";
import { RemoteLevelMigrator } from "Modules/Migrators/RemoteLevelMigrator";
import { parseFromBase64 } from "utils";
import { boot, resetWorld, player, booted } from "../harness/world";

describe("Migrators (isolated)", () => {
	describe("RemoteLevelMigrator (0.9.13)", () => {
		const fixture = (allowed: number, lists: { hypno?: string; collar?: string; magic?: string } = {}) => {
			resetWorld({
				LSCG: {
					HypnoModule: { overrideMemberIds: lists.hypno ?? "", remoteAccess: true },
					CollarModule: { allowedMembers: lists.collar ?? "", remoteAccess: true },
					MagicModule: { remoteMemberIds: lists.magic ?? "", remoteAccess: true },
				},
			} as never);
			(player() as unknown as { AllowedInteractions: number }).AllowedInteractions = allowed;
		};
		const levels = () => [player().LSCG.HypnoModule, player().LSCG.CollarModule, player().LSCG.MagicModule].map(s => (s as unknown as { remoteLevel: string }).remoteLevel);

		it.each([
			[0, "Public"], [1, "PublicExceptBlacklist"], [2, "Dominants"], [3, "Whitelist"], [4, "Lovers"], [5, "Owner"],
		])("with BC interaction permission %i, who got in before still does: level %s", (permission, level) => {
			fixture(permission);
			expect(new RemoteLevelMigrator().Migrate("0.9.12")).toBe(true);
			expect(levels()).toEqual([level, level, level]);
		});

		const ids = () => [player().LSCG.HypnoModule, player().LSCG.CollarModule, player().LSCG.MagicModule].map(s => (s as unknown as { remoteMemberIds: string }).remoteMemberIds);

		it("someone who named members keeps exactly those members: owner only, plus the list moved to allowed member ids", () => {
			fixture(0, { hypno: "12, 34", magic: "9" });
			new RemoteLevelMigrator().Migrate("0.9.12");
			expect(levels()).toEqual(["Owner", "Public", "Owner"]);
			expect(ids()).toEqual(["12, 34", "", "9"]);
		});

		it("copies the lists that also mean something else, leaving the originals in place", () => {
			fixture(0, { hypno: "12", collar: "34", magic: "56" });
			new RemoteLevelMigrator().Migrate("0.9.12");
			expect(player().LSCG.HypnoModule.overrideMemberIds).toBe("12");
			expect(player().LSCG.CollarModule.allowedMembers).toBe("34");
			expect(ids()).toEqual(["12", "34", "56"]);
			expect(levels()).toEqual(["Owner", "Owner", "Owner"]);
		});

		it("existing saves keep their own settings: no section starts out on the global defaults", () => {
			fixture(0);
			(player().LSCG as unknown as Record<string, unknown>).SpeechAnalysisModule = { remoteAccess: true, remoteLevel: "Lovers", useGlobalRemote: true };
			for (const module of ["HypnoModule", "CollarModule", "MagicModule"] as const)
				(player().LSCG[module] as unknown as Record<string, unknown>).useGlobalRemote = true;
			new RemoteLevelMigrator().Migrate("0.9.12");
			for (const module of ["HypnoModule", "CollarModule", "MagicModule", "SpeechAnalysisModule"] as const)
				expect((player().LSCG[module] as unknown as { useGlobalRemote: boolean }).useGlobalRemote, module).toBe(false);
		});

		it("a blank list is no list", () => {
			fixture(3, { hypno: "  ", collar: "" });
			new RemoteLevelMigrator().Migrate("0.9.12");
			expect(levels()).toEqual(["Whitelist", "Whitelist", "Whitelist"]);
			expect(ids()).toEqual(["", "", ""]);
		});

		it("falls back to owner only when item permission isn't known", () => {
			fixture(undefined as never);
			new RemoteLevelMigrator().Migrate("0.9.12");
			expect(levels()).toEqual(["Owner", "Owner", "Owner"]);
		});
	});

	describe("StateMigrator (0.3.0)", () => {
		it("sets StateModule.immersive from OR of legacy HypnoModule.immersive", () => {
			resetWorld({
				LSCG: {
					StateModule: { immersive: false, states: [] },
					HypnoModule: { immersive: true },
					InjectorModule: {},
					MiscModule: {},
				},
			});
			new StateMigrator().Migrate("0.2.0");
			expect(player().LSCG.StateModule.immersive).toBe(true);
		});

		it("sets StateModule.immersive from OR of legacy InjectorModule.immersive", () => {
			resetWorld({
				LSCG: {
					StateModule: { immersive: false, states: [] },
					HypnoModule: {},
					InjectorModule: { immersive: true },
					MiscModule: {},
				},
			});
			new StateMigrator().Migrate("0.2.0");
			expect(player().LSCG.StateModule.immersive).toBe(true);
		});

		it("sets StateModule.immersive from OR of legacy MiscModule.immersiveChloroform", () => {
			resetWorld({
				LSCG: {
					StateModule: { immersive: false, states: [] },
					HypnoModule: {},
					InjectorModule: {},
					MiscModule: { immersiveChloroform: true },
				},
			});
			new StateMigrator().Migrate("0.2.0");
			expect(player().LSCG.StateModule.immersive).toBe(true);
		});

		it("leaves StateModule.immersive false when all three legacy flags are false/undefined", () => {
			resetWorld({
				LSCG: {
					StateModule: { immersive: false, states: [] },
					HypnoModule: { immersive: false },
					InjectorModule: { immersive: false },
					MiscModule: { immersiveChloroform: false },
				},
			});
			new StateMigrator().Migrate("0.2.0");
			expect(player().LSCG.StateModule.immersive).toBe(false);
		});

		it("creates hypnotized state entry when HypnoModule.existingEye1Color is set and no entry exists yet", () => {
			resetWorld({
				LSCG: {
					StateModule: { immersive: false, states: [] },
					HypnoModule: {
						existingEye1Color: "#ff0000",
						existingEye1Name: "Eye1",
						existingEye2Color: "#00ff00",
						existingEye2Name: "Eye2",
						existingEyeExpression: "blink",
						hypnotized: true,
						hypnotizedBy: 42,
						activatedAt: 1000,
						recoveredAt: 2000,
						stats: { hypnotizedCount: 5 },
					},
					InjectorModule: {},
					MiscModule: {},
				},
			});
			new StateMigrator().Migrate("0.2.0");
			const hypnoState = player().LSCG.StateModule.states.find(
				(s: any) => s.type === "hypnotized"
			);
			expect(hypnoState).toBeDefined();
			expect(hypnoState.active).toBe(true);
			expect(hypnoState.activatedBy).toBe(42);
			expect(hypnoState.activatedAt).toBe(1000);
			expect(hypnoState.recoveredAt).toBe(2000);
			expect(hypnoState.activationCount).toBe(5);
			expect(hypnoState.extensions.existingEye1Color).toBe("#ff0000");
			expect(hypnoState.extensions.existingEye1Name).toBe("Eye1");
			expect(hypnoState.extensions.existingEye2Color).toBe("#00ff00");
			expect(hypnoState.extensions.existingEye2Name).toBe("Eye2");
			expect(hypnoState.extensions.existingEyeExpression).toBe("blink");
		});

		it("does not create hypnotized state entry when HypnoModule.existingEye1Color is not set", () => {
			resetWorld({
				LSCG: {
					StateModule: { immersive: false, states: [] },
					HypnoModule: {
						hypnotized: true,
						hypnotizedBy: 42,
						stats: { hypnotizedCount: 5 },
					},
					InjectorModule: {},
					MiscModule: {},
				},
			});
			new StateMigrator().Migrate("0.2.0");
			const hypnoState = player().LSCG.StateModule.states.find(
				(s: any) => s.type === "hypnotized"
			);
			expect(hypnoState).toBeUndefined();
		});

		it("does not duplicate hypnotized state entry if one already exists, but still applies eye extensions", () => {
			resetWorld({
				LSCG: {
					StateModule: {
						immersive: false,
						states: [
							{
								type: "hypnotized",
								active: false,
								activatedBy: 99,
								activatedAt: 0,
								recoveredAt: 0,
								activationCount: 1,
								extensions: {},
							},
						],
					},
					HypnoModule: {
						existingEye1Color: "#ff0000",
						existingEye1Name: "Eye1",
						existingEye2Color: "#00ff00",
						existingEye2Name: "Eye2",
						existingEyeExpression: "blink",
						hypnotized: true,
						hypnotizedBy: 42,
						activatedAt: 1000,
						recoveredAt: 2000,
						stats: { hypnotizedCount: 5 },
					},
					InjectorModule: {},
					MiscModule: {},
				},
			});
			new StateMigrator().Migrate("0.2.0");
			const hypnoStates = player().LSCG.StateModule.states.filter(
				(s: any) => s.type === "hypnotized"
			);
			expect(hypnoStates).toHaveLength(1);
			const hypnoState = hypnoStates[0];
			expect(hypnoState.extensions.existingEye1Color).toBe("#ff0000");
			expect(hypnoState.extensions.existingEyeExpression).toBe("blink");
		});

		it("deletes legacy HypnoModule fields after migration", () => {
			resetWorld({
				LSCG: {
					StateModule: { immersive: false, states: [] },
					HypnoModule: {
						existingEye1Color: "#ff0000",
						existingEye1Name: "Eye1",
						existingEye2Color: "#00ff00",
						existingEye2Name: "Eye2",
						existingEyeExpression: "blink",
						hypnotized: true,
						hypnotizedBy: 42,
						activatedAt: 1000,
						recoveredAt: 2000,
						immersive: true,
						stats: { hypnotizedCount: 5 },
					},
					InjectorModule: {},
					MiscModule: {},
				},
			});
			new StateMigrator().Migrate("0.2.0");
			const hypnoModule = player().LSCG.HypnoModule;
			expect(hypnoModule.existingEye1Color).toBeUndefined();
			expect(hypnoModule.existingEye1Name).toBeUndefined();
			expect(hypnoModule.existingEye2Color).toBeUndefined();
			expect(hypnoModule.existingEye2Name).toBeUndefined();
			expect(hypnoModule.existingEyeExpression).toBeUndefined();
			expect(hypnoModule.hypnotized).toBeUndefined();
			expect(hypnoModule.hypnotizedBy).toBeUndefined();
			expect(hypnoModule.activatedAt).toBeUndefined();
			expect(hypnoModule.recoveredAt).toBeUndefined();
			expect(hypnoModule.immersive).toBeUndefined();
		});

		it("deletes legacy InjectorModule and MiscModule fields after migration", () => {
			resetWorld({
				LSCG: {
					StateModule: { immersive: false, states: [] },
					HypnoModule: { stats: { hypnotizedCount: 0 } },
					InjectorModule: {
						immersive: true,
						brainwashed: true,
						asleep: false,
					},
					MiscModule: {
						immersiveChloroform: false,
					},
				},
			});
			new StateMigrator().Migrate("0.2.0");
			const injectorModule = player().LSCG.InjectorModule;
			expect(injectorModule.immersive).toBeUndefined();
			expect(injectorModule.brainwashed).toBeUndefined();
			expect(injectorModule.asleep).toBeUndefined();
			const miscModule = player().LSCG.MiscModule;
			expect(miscModule.immersiveChloroform).toBeUndefined();
		});

		it("returns true", () => {
			resetWorld({
				LSCG: {
					StateModule: { immersive: false, states: [] },
					HypnoModule: { stats: { hypnotizedCount: 0 } },
					InjectorModule: {},
					MiscModule: {},
				},
			});
			const result = new StateMigrator().Migrate("0.2.0");
			expect(result).toBe(true);
		});
	});

	describe("OpacityMigrator (0.5.0)", () => {
		it("renames LSCGOpacity to Opacity in Wardrobe items", () => {
			const testItem: any = {
				Asset: { Name: "Item1" },
				Property: { LSCGOpacity: 50 },
			};
			resetWorld({
				Wardrobe: [[testItem]],
				Appearance: [],
				LSCG: {},
			});
			new OpacityMigrator().Migrate("0.4.0");
			const item = player().Wardrobe![0][0];
			expect(item.Property!.Opacity).toBe(50);
			expect(item.Property!.LSCGOpacity).toBeUndefined();
		});

		it("renames LSCGOpacity to Opacity in Appearance items", () => {
			const testItem: any = {
				Asset: { Name: "Item1" },
				Property: { LSCGOpacity: 75 },
			};
			resetWorld({
				Wardrobe: [],
				Appearance: [testItem],
				LSCG: {},
			});
			new OpacityMigrator().Migrate("0.4.0");
			const item = player().Appearance[0];
			expect(item.Property!.Opacity).toBe(75);
			expect(item.Property!.LSCGOpacity).toBeUndefined();
		});

		it("leaves items without LSCGOpacity untouched", () => {
			const testItem: any = {
				Asset: { Name: "Item1" },
				Property: { Color: "red" },
			};
			resetWorld({
				Wardrobe: [[testItem]],
				Appearance: [],
				LSCG: {},
			});
			new OpacityMigrator().Migrate("0.4.0");
			const item = player().Wardrobe![0][0];
			expect(item.Property!.Opacity).toBeUndefined();
			expect(item.Property!.Color).toBe("red");
		});

		it("handles empty Wardrobe and Appearance arrays without throwing", () => {
			resetWorld({
				Wardrobe: [],
				Appearance: [],
				LSCG: {},
			});
			expect(() => new OpacityMigrator().Migrate("0.4.0")).not.toThrow();
		});

		it("handles Wardrobe and Appearance being undefined", () => {
			resetWorld({
				LSCG: {},
			});
			expect(() => new OpacityMigrator().Migrate("0.4.0")).not.toThrow();
		});

		it("returns true", () => {
			resetWorld({
				Wardrobe: [],
				Appearance: [],
				LSCG: {},
			});
			const result = new OpacityMigrator().Migrate("0.4.0");
			expect(result).toBe(true);
		});
	});

	describe("SuggestionSettingMigrator (0.6.0)", () => {
		it("copies limitRemoteAccessToHypnotizer to suggestionRequireHypnotizer", () => {
			resetWorld({
				LSCG: {
					HypnoModule: {
						limitRemoteAccessToHypnotizer: true,
						overrideWords: "",
					},
				},
			});
			new SuggestionSettingMigrator().Migrate("0.5.0");
			expect(player().LSCG.HypnoModule.suggestionRequireHypnotizer).toBe(true);
		});

		it("copies limitRemoteAccessToHypnotizer=false to suggestionRequireHypnotizer", () => {
			resetWorld({
				LSCG: {
					HypnoModule: {
						limitRemoteAccessToHypnotizer: false,
						overrideWords: "",
					},
				},
			});
			new SuggestionSettingMigrator().Migrate("0.5.0");
			expect(player().LSCG.HypnoModule.suggestionRequireHypnotizer).toBe(false);
		});

		it("sets randomTrigger to negation of overrideWords (truthy words = false)", () => {
			resetWorld({
				LSCG: {
					HypnoModule: {
						limitRemoteAccessToHypnotizer: true,
						overrideWords: "foo,bar",
					},
				},
			});
			new SuggestionSettingMigrator().Migrate("0.5.0");
			expect(player().LSCG.HypnoModule.randomTrigger).toBe(false);
		});

		it("sets randomTrigger to negation of overrideWords (empty string = true)", () => {
			resetWorld({
				LSCG: {
					HypnoModule: {
						limitRemoteAccessToHypnotizer: true,
						overrideWords: "",
					},
				},
			});
			new SuggestionSettingMigrator().Migrate("0.5.0");
			expect(player().LSCG.HypnoModule.randomTrigger).toBe(true);
		});

		it("sets randomTrigger to negation of overrideWords (undefined = true)", () => {
			resetWorld({
				LSCG: {
					HypnoModule: {
						limitRemoteAccessToHypnotizer: false,
						overrideWords: undefined,
					},
				},
			});
			new SuggestionSettingMigrator().Migrate("0.5.0");
			expect(player().LSCG.HypnoModule.randomTrigger).toBe(true);
		});

		it("returns true", () => {
			resetWorld({
				LSCG: {
					HypnoModule: {
						limitRemoteAccessToHypnotizer: true,
						overrideWords: "",
					},
				},
			});
			const result = new SuggestionSettingMigrator().Migrate("0.5.0");
			expect(result).toBe(true);
		});
	});

	describe("OutfitMigrator (0.7.0)", () => {
		let outfits: OutfitCollectionModule;

		beforeAll(() => {
			[, outfits] = boot(new CoreModule(), new OutfitCollectionModule());
		});

		beforeEach(() => {
			resetWorld({
				LSCG: {
					GlobalModule: { enabled: true },
					MagicModule: { knownSpells: [] },
				},
			});
			outfits.init();
			player().ExtensionSettings = {};
		});

		it("migrates single Outfit code to OutfitCollection and clears spell.Outfit.Code", () => {
			const outfitBundle: any = [
				{ Group: "Cloth", Name: "MaidOutfit1" },
			];
			const encodedCode = outfits.data.EncodeBundle(outfitBundle);

			resetWorld({
				LSCG: {
					GlobalModule: { enabled: true },
					MagicModule: {
						knownSpells: [
							{
								Name: "TestSpell",
								Outfit: {
									Code: encodedCode,
									Key: "",
								},
								Polymorph: undefined,
							},
						],
					},
				},
			});
			outfits.init();
			player().ExtensionSettings = {};

			new OutfitMigrator().Migrate("0.6.0");

			const spell = player().LSCG.MagicModule.knownSpells[0];
			expect(spell.Outfit.Key).toBe("TestSpell");
			expect(spell.Outfit.Code).toBe("");

			const retrieved = outfits.data.GetOutfitBundle("TestSpell");
			expect(retrieved).toBeDefined();
			expect(retrieved).toEqual(outfitBundle);
		});

		it("migrates single Polymorph code (no Outfit) with spell name as key", () => {
			const polymorphBundle: any = [
				{ Group: "Body", Name: "Female" },
			];
			const encodedCode = outfits.data.EncodeBundle(polymorphBundle);

			resetWorld({
				LSCG: {
					GlobalModule: { enabled: true },
					MagicModule: {
						knownSpells: [
							{
								Name: "PolySpell",
								Outfit: undefined,
								Polymorph: {
									Code: encodedCode,
									Key: "",
								},
							},
						],
					},
				},
			});
			outfits.init();
			player().ExtensionSettings = {};

			new OutfitMigrator().Migrate("0.6.0");

			const spell = player().LSCG.MagicModule.knownSpells[0];
			expect(spell.Polymorph.Key).toBe("PolySpell");
			expect(spell.Polymorph.Code).toBe("");

			const retrieved = outfits.data.GetOutfitBundle("PolySpell");
			expect(retrieved).toBeDefined();
			expect(retrieved).toEqual(polymorphBundle);
		});

		it("migrates both Outfit and Polymorph codes with spell name as key (single=true logic)", () => {
			const outfitBundle: any = [{ Group: "Cloth", Name: "MaidOutfit1" }];
			const polymorphBundle: any = [{ Group: "Body", Name: "Female" }];
			const outfitCode = outfits.data.EncodeBundle(outfitBundle);
			const polymorphCode = outfits.data.EncodeBundle(polymorphBundle);

			resetWorld({
				LSCG: {
					GlobalModule: { enabled: true },
					MagicModule: {
						knownSpells: [
							{
								Name: "DualSpell",
								Outfit: {
									Code: outfitCode,
									Key: "",
								},
								Polymorph: {
									Code: polymorphCode,
									Key: "",
								},
							},
						],
					},
				},
			});
			outfits.init();
			player().ExtensionSettings = {};

			new OutfitMigrator().Migrate("0.6.0");

			const spell = player().LSCG.MagicModule.knownSpells[0];
			expect(spell.Outfit.Key).toBe("DualSpell");
			expect(spell.Outfit.Code).toBe("");
			expect(spell.Polymorph.Key).toBe("DualSpell");
			expect(spell.Polymorph.Code).toBe("");

			const outfitRetrieved = outfits.data.GetOutfitBundle("DualSpell");
			expect(outfitRetrieved).toBeDefined();
		});

		it("leaves spells without Outfit or Polymorph untouched", () => {
			resetWorld({
				LSCG: {
					GlobalModule: { enabled: true },
					MagicModule: {
						knownSpells: [
							{
								Name: "BasicSpell",
								Outfit: undefined,
								Polymorph: undefined,
							},
						],
					},
				},
			});
			outfits.init();
			player().ExtensionSettings = {};

			new OutfitMigrator().Migrate("0.6.0");

			const spell = player().LSCG.MagicModule.knownSpells[0];
			expect(spell.Outfit).toBeUndefined();
			expect(spell.Polymorph).toBeUndefined();
		});

		it("returns true", () => {
			resetWorld({
				LSCG: {
					GlobalModule: { enabled: true },
					MagicModule: { knownSpells: [] },
				},
			});
			outfits.init();
			player().ExtensionSettings = {};

			const result = new OutfitMigrator().Migrate("0.6.0");
			expect(result).toBe(true);
		});
	});

	describe("CursedItemMigrator (0.7.2)", () => {
		it("renames SpreadingOutfitModule to CursedItemModule when fromVersion is 0.7.1", () => {
			resetWorld({
				LSCG: {
					SpreadingOutfitModule: { someField: "value" },
				},
			});
			const result = new CursedItemMigrator().Migrate("0.7.1");
			expect(result).toBe(true);
			expect(player().LSCG.CursedItemModule).toEqual({ someField: "value" });
			expect(player().LSCG.SpreadingOutfitModule).toBeUndefined();
		});

		it("does nothing and returns false when fromVersion is not 0.7.1", () => {
			resetWorld({
				LSCG: {
					SpreadingOutfitModule: { someField: "value" },
				},
			});
			const result = new CursedItemMigrator().Migrate("0.7.0");
			expect(result).toBe(false);
			expect(player().LSCG.SpreadingOutfitModule).toEqual({ someField: "value" });
			expect(player().LSCG.CursedItemModule).toBeUndefined();
		});

		it("does nothing and returns false when SpreadingOutfitModule doesn't exist", () => {
			resetWorld({
				LSCG: {},
			});
			const result = new CursedItemMigrator().Migrate("0.7.1");
			expect(result).toBe(false);
		});

		it("does nothing and returns false when both conditions fail (wrong version and no module)", () => {
			resetWorld({
				LSCG: {},
			});
			const result = new CursedItemMigrator().Migrate("0.7.0");
			expect(result).toBe(false);
		});
	});
});

describe("CoreModule.CheckForMigrations (orchestration)", () => {
	let core: CoreModule;

	beforeAll(() => {
		[core] = boot(new CoreModule());
	});

	beforeEach(() => {
		resetWorld({
			LSCG: {
				GlobalModule: { enabled: false },
				StateModule: { immersive: false, states: [] },
				HypnoModule: { stats: { hypnotizedCount: 0 } },
				InjectorModule: {},
				MiscModule: {},
				MagicModule: { knownSpells: [] },
			},
		});
	});

	it("returns false and runs no migrations when fromVersion is empty string", () => {
		resetWorld({
			LSCG: {
				SpreadingOutfitModule: { legacy: true },
				StateModule: { immersive: false, states: [] },
				HypnoModule: { stats: { hypnotizedCount: 0 } },
				InjectorModule: {},
				MiscModule: {},
				MagicModule: { knownSpells: [] },
			},
		});
		const result = core.CheckForMigrations("");
		expect(result).toBe(false);
		expect(player().LSCG.SpreadingOutfitModule).toEqual({ legacy: true });
	});

	it("returns false and runs no migrations when fromVersion is undefined", () => {
		resetWorld({
			LSCG: {
				SpreadingOutfitModule: { legacy: true },
				StateModule: { immersive: false, states: [] },
				HypnoModule: { stats: { hypnotizedCount: 0 } },
				InjectorModule: {},
				MiscModule: {},
				MagicModule: { knownSpells: [] },
			},
		});
		const result = core.CheckForMigrations(undefined as any);
		expect(result).toBe(false);
		expect(player().LSCG.SpreadingOutfitModule).toEqual({ legacy: true });
	});

	it("strips leading 'v' from fromVersion before semver comparison", () => {
		resetWorld({
			LSCG: {
				StateModule: { immersive: false, states: [] },
				HypnoModule: { immersive: true, stats: { hypnotizedCount: 0 } },
				InjectorModule: {},
				MiscModule: {},
				MagicModule: { knownSpells: [] },
			},
		});
		const result = core.CheckForMigrations("v0.2.0");
		expect(result).toBe(true);
		expect(player().LSCG.StateModule.immersive).toBe(true);
		expect(player().LSCG.HypnoModule.immersive).toBeUndefined();
	});

	it("runs only migrators whose version is greater than fromVersion", () => {
		// fromVersion: 0.6.5 should NOT run StateMigrator (0.3.0), OpacityMigrator (0.5.0),
		// SuggestionSettingMigrator (0.6.0), but SHOULD run OutfitMigrator (0.7.0) and
		// CursedItemMigrator (0.7.2)
		resetWorld({
			Wardrobe: [],
			Appearance: [],
			LSCG: {
				GlobalModule: { enabled: true },
				StateModule: { immersive: false, states: [] },
				HypnoModule: { immersive: true, stats: { hypnotizedCount: 0 } },
				InjectorModule: { immersive: true },
				MiscModule: { immersiveChloroform: true },
				MagicModule: {
					knownSpells: [
						{
							Name: "TestSpell",
							Outfit: {
								Code: "base64stuff",
								Key: "",
							},
							Polymorph: undefined,
						},
					],
				},
			},
		});

		const result = core.CheckForMigrations("0.6.5");

		// StateMigrator should NOT have run (immersive fields still present)
		expect(player().LSCG.HypnoModule.immersive).toBe(true);
		expect(player().LSCG.InjectorModule.immersive).toBe(true);

		// OutfitMigrator runs (0.7.0 > 0.6.5), CursedItemMigrator runs but returns false
		// (no SpreadingOutfitModule), so overall result is true from OutfitMigrator
		expect(result).toBe(true);
	});

	it("returns true if ANY migrator that ran returned true", () => {
		resetWorld({
			LSCG: {
				StateModule: { immersive: false, states: [] },
				HypnoModule: { immersive: false, stats: { hypnotizedCount: 0 } },
				InjectorModule: {},
				MiscModule: {},
				MagicModule: { knownSpells: [] },
			},
		});
		const result = core.CheckForMigrations("0.2.0");
		expect(result).toBe(true);
	});

	it("returns false overall when only CursedItemMigrator runs and its condition is not met", () => {
		resetWorld({
			LSCG: {
				StateModule: { immersive: false, states: [] },
				HypnoModule: { stats: { hypnotizedCount: 0 } },
				InjectorModule: {},
				MiscModule: {},
				MagicModule: { knownSpells: [] },
			},
		});
		// fromVersion 0.7.1 will run CursedItemMigrator, but SpreadingOutfitModule is not present
		// so CursedItemMigrator returns false. Earlier migrators (0.3.0 through 0.7.0) won't run
		// because 0.7.1 is not less than their versions. Neither will the later RemoteLevelMigrator
		// (0.9.13) once the version is past it.
		const result = core.CheckForMigrations("0.9.13");
		expect(result).toBe(false);
	});

	it("RemoteLevelMigrator runs for any older version, and not again once past it", () => {
		resetWorld({
			LSCG: {
				StateModule: { immersive: false, states: [] },
				HypnoModule: { overrideMemberIds: "", remoteAccess: true, stats: { hypnotizedCount: 0 } },
				CollarModule: { allowedMembers: "", remoteAccess: true },
				MagicModule: { remoteMemberIds: "", remoteAccess: true, knownSpells: [] },
			},
		} as never);
		(player() as unknown as { AllowedInteractions: number }).AllowedInteractions = 1;
		expect(core.CheckForMigrations("0.9.12")).toBe(true);
		const levels = () => [player().LSCG.HypnoModule, player().LSCG.CollarModule, player().LSCG.MagicModule].map(s => (s as unknown as { remoteLevel: string }).remoteLevel);
		expect(levels()).toEqual(["PublicExceptBlacklist", "PublicExceptBlacklist", "PublicExceptBlacklist"]);
		player().LSCG.HypnoModule.remoteLevel = "Lovers" as never;
		core.CheckForMigrations("0.9.13");
		expect(player().LSCG.HypnoModule.remoteLevel).toBe("Lovers");
	});

	it("returns true when old fromVersion triggers multiple migrators at least one returns true", () => {
		resetWorld({
			Wardrobe: [],
			Appearance: [],
			LSCG: {
				GlobalModule: { enabled: true },
				StateModule: { immersive: false, states: [] },
				HypnoModule: { immersive: true, stats: { hypnotizedCount: 0 } },
				InjectorModule: {},
				MiscModule: {},
				MagicModule: { knownSpells: [] },
			},
		});

		const result = core.CheckForMigrations("0.1.0");
		expect(result).toBe(true);
		// StateMigrator should have run and deleted immersive
		expect(player().LSCG.HypnoModule.immersive).toBeUndefined();
	});
});
