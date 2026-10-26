// InjectorModule beyond drinks and injections: the /lscg drug-boost command, continuous gas delivery (the latex
// respirator and cryo capsule: validity, on/off, running out, the emotes for putting one on, toggling and reloading,
// and each breath's dose), the hypno headset, sip limits, forced drinks, the minigame outcomes, and
// sleep / brainwash / snap back.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ActivityModule } from "Modules/activities";
import { ConsentModule } from "Modules/consent";
import { HypnoModule } from "Modules/hypno";
import { InjectorModule } from "Modules/injector";
import { LeashingModule } from "Modules/leashing";
import { StateModule } from "Modules/states";
import { ItemUseModule, ActivityRoll } from "Modules/item-use";
import { CollarModule } from "Modules/collar";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeGroup, makeAsset, makeCharacter, wear, makeItem, type FixtureCharacter } from "../harness/fixtures";
import { sent } from "../harness/room";
import { seedRandom, restoreRandom } from "../harness/time";
import { rawStub } from "../harness/bc-lite";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

describe("InjectorModule devices", () => {
	let injector: InjectorModule;
	let states: StateModule;
	let hypno: HypnoModule;
	let itemUse: ItemUseModule;
	let alice: FixtureCharacter;

	beforeAll(() => {
		[, , , , injector, hypno, states, itemUse] = boot(
			new CoreModule(), new ConsentModule(), new ActivityModule(), new LeashingModule(),
			new InjectorModule(), new HypnoModule(), new StateModule(), new ItemUseModule(), new CollarModule(),
		);
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true } } });
		states.init();
		hypno.init();
		injector.init();
		Object.assign(injector.settings, { enabled: true, enableSedative: true, enableMindControl: true, enableHorny: true, enableContinuousDelivery: true });
		injector.sedativeLevel = 0;
		injector.mindControlLevel = 0;
		injector.hornyLevel = 0;
		injector._wasWearingRespirator = false;
		alice = addToRoom(makeCharacter({ MemberNumber: 2, Nickname: "Alice" }));
	});

	afterEach(() => {
		vi.clearAllTimers();
		restoreRandom();
	});

	const lastAction = () => sent.actions().at(-1) ?? "";
	const put = (group: string, name: string, extra: Parameters<typeof makeItem>[1] = {}) => wear(player(), makeItem(makeAsset(makeGroup({ Name: group }), { Name: name }), extra));
	const drugged = (name = "Tranquilizer Mask") => ({ Name: name, Description: "", MemberNumber: 2 });

	describe("/lscg drug-boost", () => {
		const run = (args: string) => injector.commands[0].Action!(args, "", args.split(" "));

		it("boosts each drug type by one drink", () => {
			run("sleepy");
			run("hypno");
			run(" HORNY ");
			expect(injector.sedativeLevel).toBeGreaterThan(0);
			expect(injector.mindControlLevel).toBeGreaterThan(0);
			expect(injector.hornyLevel).toBeGreaterThan(0);
			expect(sent.local().join()).toContain("Aphrodisiac boosted");
		});

		it("explains its usage, and refuses while disabled", () => {
			run("coffee");
			expect(sent.local().at(-1)).toContain("Usage: /lscg drug-boost");
			injector.settings.enabled = false;
			run("sleepy");
			expect(sent.local().at(-1)).toContain("not enabled");
			expect(injector.sedativeLevel).toBe(0);
		});
	});

	describe("level settings", () => {
		it("save only on a change", () => {
			const before = injector.drugLevelMultiplier;
			injector.drugLevelMultiplier = before;
			injector.drugLevelMultiplier = before + 1;
			injector.sedativeMax = 7; injector.mindControlMax = 8; injector.hornyLevelMax = 9;
			expect([injector.drugLevelMultiplier, injector.sedativeMax, injector.mindControlMax, injector.hornyLevelMax]).toEqual([before + 1, 7, 8, 9]);
		});

		it("target levels never read below the current level", () => {
			injector.sedativeLevel = 3;
			injector._targetSedativeLevel = 1;
			expect(injector.targetSedativeLevel).toBe(3);
		});
	});

	describe("sleep and brainwash", () => {
		it("Sleep / Wake drive the sleep state and count it", () => {
			const before = injector.settings.stats.sedatedCount;
			injector.Sleep(false, 60_000);
			expect(states.SleepState.Active).toBe(true);
			expect(injector.settings.stats.sedatedCount).toBe(before + 1);
			injector.Wake();
			expect(states.SleepState.Active).toBe(false);
		});

		it("Brainwash / SnapBack drive the hypno state", () => {
			injector.SnapBack();
			expect(sent.actions()).toEqual([]);
			injector.Brainwash();
			expect(states.HypnoState.Active).toBe(true);
			injector.SnapBack();
			expect(lastAction()).toContain("snapping back into");
			expect(states.HypnoState.Active).toBe(false);
		});

		it("losing a minigame puts the player under, winning doesn't", () => {
			injector.MiniGameEnd("sedative", true);
			injector.MiniGameEnd("mindcontrol", true);
			expect([states.SleepState.Active, states.HypnoState.Active]).toEqual([false, false]);
			injector.MiniGameEnd("sedative", false);
			injector.MiniGameEnd("mindcontrol", false);
			expect([states.SleepState.Active, states.HypnoState.Active]).toEqual([true, true]);
			expect(rawStub("CommonSetScreen")).toHaveBeenCalledWith("Online", "ChatRoom");
		});

		it("ActivateSleepEvent emotes", () => {
			injector.ActivateSleepEvent();
			expect(sent.actions()).toHaveLength(1);
		});
	});

	describe("AddHorny", () => {
		it("forces an orgasm at the cap, and only when allowed to", () => {
			injector.AddHorny(1000, false);
			expect(g.ActivityOrgasmPrepare).not.toHaveBeenCalled();
			injector.hornyLevel = 0;
			const before = injector.settings.stats.forcedOrgasmCount;
			injector.AddHorny(1000);
			expect(g.ActivityOrgasmPrepare).toHaveBeenCalledWith(player());
			expect(injector.settings.stats.forcedOrgasmCount).toBe(before + 1);
			expect(injector.hornyLevel).toBe(injector.hornyLevelMax * injector.drugLevelMultiplier);
		});

		it("InjectHorny / InjectMindControl flash the screen", () => {
			injector.InjectHorny(alice as never, "ItemArms" as never);
			injector.InjectMindControl(alice as never, "ItemArms" as never);
			expect(g.DrawFlashScreen).toHaveBeenCalledTimes(2);
		});
	});

	describe("ConsumeSip", () => {
		beforeEach(() => makeAsset(makeGroup({ Name: "ItemHandheld" }), { Name: "GlassEmpty" }));

		it("counts sips and empties the glass at the limit", () => {
			injector.settings.sipLimit = 2;
			const glass = put("ItemHandheld", "GlassFilled", { Craft: { Name: "Wine" } });
			injector.ConsumeSip(false);
			expect(glass.Property).toMatchObject({ SipCount: 1, SipLimit: 2 });
			injector.ConsumeSip(false);
			expect(player().Appearance[0].Asset.Name).toBe("GlassEmpty");
			expect(lastAction()).toContain("last drop");
		});

		it("a full pour empties it at once; other items are left alone", () => {
			put("ItemHandheld", "Mug");
			injector.ConsumeSip(true);
			expect(player().Appearance[0].Asset.Name).toBe("Mug");
			put("ItemHandheld", "GlassFilled");
			injector.ConsumeSip(true);
			expect(player().Appearance[0].Asset.Name).toBe("GlassEmpty");
		});
	});

	describe("TryForceDrink", () => {
		beforeEach(() => wear(alice, makeItem(makeAsset(makeGroup({ Name: "ItemHandheld" }), { Name: "GlassFilled" }), { Craft: { Name: "Wine" } })));
		const roll = (attacker: number, defender: number) => vi.spyOn(itemUse, "MakeActivityCheck").mockReturnValueOnce({ AttackerRoll: new ActivityRoll(attacker, 0), DefenderRoll: new ActivityRoll(defender, 0) });

		it("forces the drink on a winning roll, after a delay", () => {
			roll(20, 1);
			const apply = vi.fn();
			expect(injector.TryForceDrink(alice as never, false, apply)).toBe(true);
			expect(lastAction()).toContain("forcing");
			expect(apply).not.toHaveBeenCalled();
			vi.runAllTimers();
			expect(apply).toHaveBeenCalledOnce();
		});

		it("spills it on a losing roll", () => {
			roll(1, 20);
			const apply = vi.fn();
			expect(injector.TryForceDrink(alice as never, false, apply)).toBe(false);
			expect(lastAction()).toContain("spilling drink all over");
			vi.runAllTimers();
			expect(apply).not.toHaveBeenCalled();
		});
	});

	describe("continuous delivery", () => {
		const respirator = (record: Record<string, number>, craft: object | undefined = drugged()) =>
			put("ItemMouth", "LatexRespirator", { Property: { TypeRecord: record }, Craft: craft });
		const capsule = (on: boolean) => put("ItemDevices", "CryoCapsule", { Property: { TypeRecord: { typed: on ? 1 : 0 } }, Craft: drugged("Sedative Gas") });

		it("a respirator only counts with a hose and a drugged craft", () => {
			respirator({ f: 0, g: 1 });
			expect(injector.WornRespirator).toBeNull();
			respirator({ f: 2, g: 1 }, { Name: "Air", Description: "" });
			expect(injector.WornRespirator).toBeNull();
			respirator({ f: 3, g: 1 });
			expect(injector.WornRespirator?.Item.Asset.Name).toBe("LatexRespirator");
			expect(injector.IsRespiratorOn).toBe(true);
		});

		it("a cryo capsule counts when drugged, and is on when closed", () => {
			capsule(false);
			expect(injector.WornRespirator?.Item.Asset.Name).toBe("CryoCapsule");
			expect(injector.IsRespiratorOn).toBe(false);
			capsule(true);
			expect(injector.IsRespiratorOn).toBe(true);
		});

		it("announces putting one on and taking it off", () => {
			respirator({ f: 2, g: 1 });
			expect(injector.IsWearingRespirator).toBe(true);
			expect(lastAction()).toContain("activates, slowly filling");
			player().Appearance = [];
			expect(injector.IsWearingRespirator).toBe(false);
			expect(lastAction()).toContain("cool, clean air");
		});

		it("runs out after the timeout, switching the device off", () => {
			const mask = respirator({ f: 2, g: 1 });
			injector._wasWearingRespirator = true;
			injector.settings.continuousDeliveryForever = false;
			injector.settings.continuousDeliveryActivatedAt = Date.now();
			expect(injector.RespiratorHasGas).toBe(true);
			expect(injector.IsContinuousDeliveryActive).toBe(true);
			injector.settings.continuousDeliveryActivatedAt = Date.now() - injector.settings.continuousDeliveryTimeout - 1;
			expect(injector.RespiratorHasGas).toBe(false);
			expect(lastAction()).toContain("runs out of its supply");
			expect(mask.Property?.TypeRecord.g).toBe(0);
		});

		it("the capsule's exhaust opens it", () => {
			const pod = capsule(true);
			injector.continuousGasDevices[1].ExhaustItem(pod as never);
			expect(pod.Property?.TypeRecord.typed).toBe(0);
		});

		describe("toggling", () => {
			beforeEach(() => { injector._wasWearingRespirator = true; injector.settings.continuousDeliveryActivatedAt = Date.now(); });

			it("mask on / off by the wearer or someone else", () => {
				const mask = respirator({ f: 2, g: 1 });
				injector.CheckForContinuousToggle(player() as never);
				expect(lastAction()).toContain("switches on %POSSESSIVE% own mask".replace("%POSSESSIVE%", "her"));
				injector.CheckForContinuousToggle(alice as never);
				expect(lastAction()).toContain("Alice switches on");
				mask.Property!.TypeRecord.g = 0;
				injector.CheckForContinuousToggle(player() as never);
				expect(lastAction()).toContain("own mask, halting");
				injector.CheckForContinuousToggle(alice as never);
				expect(lastAction()).toContain("Alice switches off");
			});

			it("reloads an empty mask when it's turned back on", () => {
				respirator({ f: 2, g: 1 });
				injector.settings.continuousDeliveryActivatedAt = 0;
				injector.CheckForContinuousToggle(alice as never);
				expect(lastAction()).toContain("reloads");
				expect(injector.settings.continuousDeliveryActivatedAt).toBeGreaterThan(0);
			});

			it("capsule open / close", () => {
				capsule(true);
				injector.CheckForContinuousToggle_CryoPod(player() as never);
				expect(lastAction()).toContain("closes her device");
				injector.CheckForContinuousToggle_CryoPod(alice as never);
				expect(lastAction()).toContain("Alice closes");
				capsule(false);
				injector.CheckForContinuousToggle_CryoPod(player() as never);
				expect(lastAction()).toContain("opens her device");
				injector.CheckForContinuousToggle_CryoPod(alice as never);
				expect(lastAction()).toContain("Alice opens");
				capsule(true);
				injector.settings.continuousDeliveryActivatedAt = 0;
				injector.CheckForContinuousToggle_CryoPod(alice as never);
				expect(lastAction()).toContain("reloads");
			});

			it("a BCX curse switching the mask reports what it did", () => {
				const mask = respirator({ f: 2, g: 1 });
				injector.CheckRespiratorCurseUpdate();
				expect(lastAction()).toContain("clicks and turns itself back on");
				mask.Property!.TypeRecord.g = 0;
				injector.CheckRespiratorCurseUpdate();
				expect(lastAction()).toContain("holds its supply in reserve");
				mask.Property!.TypeRecord.g = 1;
				injector.settings.continuousDeliveryActivatedAt = 0;
				injector.CheckRespiratorCurseUpdate();
				expect(lastAction()).toContain("reloads its own supply");
			});
		});

		describe("BreathInDrugEvent", () => {
			beforeEach(() => { injector._wasWearingRespirator = true; injector.settings.continuousDeliveryActivatedAt = Date.now(); });

			it("each breath adds a little of every drug the device carries", () => {
				respirator({ f: 2, g: 1 }, { Name: "Sedative Hypnotizing Aphrodisiac Gas", Description: "", MemberNumber: 2 });
				seedRandom([0.5]);
				injector.BreathInDrugEvent();
				expect(injector.sedativeLevel).toBeGreaterThan(0);
				expect(injector.mindControlLevel).toBeGreaterThan(0);
				expect(injector.hornyLevel).toBeGreaterThan(0);
				expect(sent.actions()).toEqual([]);
			});

			it("sometimes a big dose, with an emote", () => {
				respirator({ f: 2, g: 1 }, { Name: "Aphrodisiac Gas", Description: "", MemberNumber: 2 });
				seedRandom([0]);
				injector.BreathInDrugEvent();
				expect(sent.actions()).toHaveLength(1);
			});

			it("an antidote device occasionally cures", () => {
				injector.hornyLevel = 3;
				respirator({ f: 2, g: 1 }, { Name: "Healing Mist", Description: "", MemberNumber: 2 });
				seedRandom([0]);
				injector.BreathInDrugEvent();
				expect(injector.hornyLevel).toBe(0);
			});

			it("does nothing without an active device", () => {
				respirator({ f: 2, g: 0 });
				injector.BreathInDrugEvent();
				expect(injector.sedativeLevel).toBe(0);
			});
		});
	});

	describe("CheckForHypnoHelmet", () => {
		beforeEach(() => { player().LSCG.HypnoModule = { enableSpirals: true }; });

		it("an active hypno visor slowly raises mind control", () => {
			put("ItemHead", "HypnoticVisor", { Property: { TypeRecord: { p: 1 } } });
			seedRandom([0.5]);
			injector.CheckForHypnoHelmet();
			expect(injector.mindControlLevel).toBeGreaterThan(0);
		});

		it("sometimes with a big jump and an emote", () => {
			put("ItemHead", "HypnoticVisor", { Property: { TypeRecord: { p: 1 } } });
			seedRandom([0, 0, 0.9]);
			injector.CheckForHypnoHelmet();
			expect(sent.actions()).toHaveLength(1);
		});

		it("an inactive visor, or spirals off, does nothing", () => {
			put("ItemHead", "HypnoticVisor", { Property: { TypeRecord: { p: 0 } } });
			injector.CheckForHypnoHelmet();
			put("ItemHead", "HypnoticVisor", { Property: { TypeRecord: { p: 1 } } });
			player().LSCG.HypnoModule.enableSpirals = false;
			injector.CheckForHypnoHelmet();
			expect(injector.mindControlLevel).toBe(0);
		});
	});
});
