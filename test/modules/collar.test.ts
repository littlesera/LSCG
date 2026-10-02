// CollarModule: WearingCorrectCollar matching (any-collar, uncrafted-by-name, crafted
// name+creator), AllowedMember's self-flags/allowed-member-list/creator/default-permission
// ladder, tighten/loosen trigger phrases, the choke level 0-4 progression (including the
// StartPassout -> Passout1 -> Passout2 -> Passout3 -> Knockout sequence at level 4), and
// the collar button press flow (restrained blocks access, allowButtons gate, "Access
// Denied" on a disallowed presser).
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { CollarModule } from "Modules/collar";
import { InjectorModule } from "Modules/injector";
import { LeashingModule } from "Modules/leashing";
import { StateModule } from "Modules/states";
import { replace_template } from "utils";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeGroup, makeAsset, wear, makeItem, type FixtureCharacter } from "../harness/fixtures";
import { sent } from "../harness/room";

describe("CollarModule", () => {
	let collar: CollarModule;
	let injector: InjectorModule;
	let states: StateModule;
	let neckGroup: ReturnType<typeof makeGroup>;

	beforeAll(() => {
		[, , , , collar, injector, states] = boot(
			new CoreModule(), new ConsentModule(), new ActivityModule(), new LeashingModule(),
			new CollarModule(), new InjectorModule(), new StateModule(),
		);
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({
			MemberNumber: 1, Nickname: "Sera",
			LSCG: { GlobalModule: { enabled: true }, MiscModule: { chokeChainEnabled: false, gagChokeEnabled: false } },
		});
		injector.init();
		states.init();
		collar.init();
		neckGroup = makeGroup({ Name: "ItemNeck" });
		makeAsset(neckGroup, { Name: "PlainCollar" });
		collar.settings.enabled = true;
	});

	function emote(raw: string): string {
		return replace_template(raw, null);
	}

	function wearCollar(overrides: Partial<{ name: string; crafterName: string; crafterMember: number }> = {}) {
		const asset = makeAsset(neckGroup, { Name: overrides.name ?? "PlainCollar" });
		wear(player(), makeItem(asset, overrides.crafterName ? { Craft: { Name: overrides.crafterName, MemberNumber: overrides.crafterMember ?? 2 } } : {}));
	}

	describe("WearingCorrectCollar", () => {
		it("false with no collar worn", () => {
			expect(collar.WearingCorrectCollar(player() as never)).toBe(false);
		});

		it("false when the collar module itself isn't enabled", () => {
			collar.settings.enabled = false;
			wearCollar();
			expect(collar.WearingCorrectCollar(player() as never)).toBe(false);
		});

		it("anyCollar accepts whatever is worn", () => {
			collar.settings.anyCollar = true;
			wearCollar({ name: "AnythingAtAll" });
			expect(collar.WearingCorrectCollar(player() as never)).toBe(true);
		});

		it("an uncrafted configured collar matches by asset name only", () => {
			collar.settings.collar = { name: "PlainCollar" } as never;
			wearCollar({ name: "PlainCollar" });
			expect(collar.WearingCorrectCollar(player() as never)).toBe(true);
		});

		it("an uncrafted configured collar does not match a different asset", () => {
			collar.settings.collar = { name: "PlainCollar" } as never;
			wearCollar({ name: "SomethingElse" });
			expect(collar.WearingCorrectCollar(player() as never)).toBe(false);
		});

		it("a crafted configured collar requires both name and creator to match", () => {
			collar.settings.collar = { name: "Special Collar", creator: 7 } as never;
			wearCollar({ name: "PlainCollar", crafterName: "Special Collar", crafterMember: 7 });
			expect(collar.WearingCorrectCollar(player() as never)).toBe(true);
		});

		it("a crafted configured collar rejects a matching name from the wrong creator", () => {
			collar.settings.collar = { name: "Special Collar", creator: 7 } as never;
			wearCollar({ name: "PlainCollar", crafterName: "Special Collar", crafterMember: 8 });
			expect(collar.WearingCorrectCollar(player() as never)).toBe(false);
		});
	});

	describe("AllowedMember", () => {
		it("a null member is never allowed", () => {
			expect(collar.AllowedMember(null, true)).toBe(false);
		});

		it("self-tightening requires allowSelfTightening", () => {
			collar.settings.allowSelfTightening = false;
			expect(collar.AllowedMember(player() as never, true)).toBe(false);
			collar.settings.allowSelfTightening = true;
			expect(collar.AllowedMember(player() as never, true)).toBe(true);
		});

		it("self-loosening requires allowSelfLoosening (independent of tightening)", () => {
			collar.settings.allowSelfTightening = true;
			collar.settings.allowSelfLoosening = false;
			expect(collar.AllowedMember(player() as never, false)).toBe(false);
			collar.settings.allowSelfLoosening = true;
			expect(collar.AllowedMember(player() as never, false)).toBe(true);
		});

		it("with an explicit allowed-member list, only those members are allowed", () => {
			collar.settings.allowedMembers = "5, 6";
			const five = addToRoom({ ...player(), MemberNumber: 5, IsPlayer: () => false } as FixtureCharacter);
			const nine = addToRoom({ ...player(), MemberNumber: 9, IsPlayer: () => false } as FixtureCharacter);
			expect(collar.AllowedMember(five as never, true)).toBe(true);
			expect(collar.AllowedMember(nine as never, true)).toBe(false);
		});

		it("limitToCrafted appends the collar's own crafter to the allowed list", () => {
			collar.settings.allowedMembers = "";
			collar.settings.limitToCrafted = true;
			collar.settings.collar = { creator: 12 } as never;
			const crafter = addToRoom({ ...player(), MemberNumber: 12, IsPlayer: () => false } as FixtureCharacter);
			expect(collar.AllowedMember(crafter as never, true)).toBe(true);
		});

		it("with no allowed-member list configured, falls back to the general allow-item check", () => {
			collar.settings.allowedMembers = "";
			const other = addToRoom({ ...player(), MemberNumber: 5, IsPlayer: () => false } as FixtureCharacter);
			expect(collar.AllowedMember(other as never, true)).toBe(true);
			vi.mocked(globalThis.ServerChatRoomGetAllowItem).mockReturnValueOnce(false);
			expect(collar.AllowedMember(other as never, true)).toBe(false);
		});
	});

	describe("CheckForTriggers", () => {
		beforeEach(() => {
			collar.settings.tightTrigger = "tighten";
			collar.settings.looseTrigger = "loosen";
			collar.settings.allowedMembers = "";
		});

		it("a tighten phrase from an allowed member increases the choke level", () => {
			const other = addToRoom({ ...player(), MemberNumber: 5, IsPlayer: () => false } as FixtureCharacter);
			collar.CheckForTriggers("please tighten my collar", other as never);
			expect(collar.settings.chokeLevel).toBe(1);
		});

		it("a loosen phrase from an allowed member decreases the choke level", () => {
			collar.settings.chokeLevel = 2;
			const other = addToRoom({ ...player(), MemberNumber: 5, IsPlayer: () => false } as FixtureCharacter);
			collar.CheckForTriggers("please loosen my collar", other as never);
			expect(collar.settings.chokeLevel).toBe(1);
		});

		it("does nothing from a disallowed member", () => {
			vi.mocked(globalThis.ServerChatRoomGetAllowItem).mockReturnValue(false);
			const other = addToRoom({ ...player(), MemberNumber: 5, IsPlayer: () => false } as FixtureCharacter);
			collar.CheckForTriggers("please tighten my collar", other as never);
			expect(collar.settings.chokeLevel).toBe(0);
		});

		it("does nothing when the message matches neither trigger", () => {
			const other = addToRoom({ ...player(), MemberNumber: 5, IsPlayer: () => false } as FixtureCharacter);
			collar.CheckForTriggers("hello there", other as never);
			expect(collar.settings.chokeLevel).toBe(0);
		});
	});

	describe("choke level progression", () => {
		it("increases one level at a time, up to a cap of 4", () => {
			for (let i = 0; i < 6; i++) collar.IncreaseCollarChoke();
			expect(collar.settings.chokeLevel).toBe(4);
		});

		it("decreases one level at a time, floored at 0", () => {
			collar.settings.chokeLevel = 2;
			for (let i = 0; i < 5; i++) collar.DecreaseCollarChoke();
			expect(collar.settings.chokeLevel).toBe(0);
		});

		it("sends a distinct emote at each level", () => {
			collar.IncreaseCollarChoke();
			expect(sent.actions()[0]).toContain("starts to tighten");
			collar.IncreaseCollarChoke();
			expect(sent.actions()[1]).toContain("gasps for air");
			collar.IncreaseCollarChoke();
			expect(sent.actions()[2]).toContain("barely allowing any air");
		});

		it("ReleaseCollar resets the choke level to 0 with a relief emote when it was raised", () => {
			collar.settings.chokeLevel = 2;
			collar.ReleaseCollar();
			expect(collar.settings.chokeLevel).toBe(0);
			expect(sent.actions().at(-1)).toBe(emote("%NAME% gulps thankfully as the threat to %POSSESSIVE% airway is removed."));
		});

		it("ReleaseCollar sends no emote when the collar wasn't tightened", () => {
			collar.ReleaseCollar();
			expect(sent.actions()).toEqual([]);
		});
	});

	describe("passout sequence at choke level 4", () => {
		it("reaching level 4 starts the passout sequence, which knocks the wearer out via the injector", () => {
			for (let i = 0; i < 3; i++) collar.IncreaseCollarChoke();
			sent.raw().length = 0;
			collar.settings.knockout = true;
			collar.settings.knockoutMinutes = 1;

			collar.IncreaseCollarChoke(); // level 4: StartPassout
			expect(sent.actions()[0]).toContain("eyes start to roll back");

			vi.advanceTimersByTime(30_000); // Passout1 (totalTime * .5)
			expect(sent.actions().at(-1)).toContain("chokes and spasms");

			vi.advanceTimersByTime(18_000); // Passout2 (totalTime * .3)
			expect(sent.actions().at(-1)).toContain("convulses weakly");

			vi.advanceTimersByTime(12_000); // Passout3 (totalTime * .2): collapse, choke resets, knockout triggers
			expect(sent.actions().at(-1)).toContain("collapses unconscious");
			expect(collar.settings.chokeLevel).toBe(0);
			expect(collar.settings.stats.collarPassoutCount).toBe(1);
			expect(states.SleepState.Active).toBe(true);
		});
	});

	describe("button presses", () => {
		beforeEach(() => {
			collar.settings.allowButtons = true;
			collar.settings.allowSelfTightening = true;
			collar.settings.allowSelfLoosening = true;
		});

		it("a restrained presser cannot reach the controls", () => {
			player().flags.restrained = true;
			collar.TightenButtonPress(player() as never);
			expect(sent.actions()[0]).toContain("struggles in");
			expect(collar.settings.chokeLevel).toBe(0);
		});

		it("an allowed presser tightens the collar after the button delay", () => {
			collar.TightenButtonPress(player() as never);
			expect(sent.actions()[0]).toContain("presses a button");
			vi.advanceTimersByTime(1500);
			expect(collar.settings.chokeLevel).toBe(1);
		});

		it("a disallowed presser gets 'Access Denied' and nothing happens", () => {
			collar.settings.allowSelfTightening = false;
			collar.TightenButtonPress(player() as never);
			vi.advanceTimersByTime(1500);
			expect(sent.actions().at(-1)).toContain("Access Denied");
			expect(collar.settings.chokeLevel).toBe(0);
		});

		it("buttons do nothing at all when allowButtons is off", () => {
			collar.settings.allowButtons = false;
			collar.TightenButtonPress(player() as never);
			expect(sent.local().at(-1)).toContain("Collar buttons disabled");
			expect(sent.actions()).toEqual([]);
		});

		it("LoosenButtonPress decreases the choke level after the delay", () => {
			collar.settings.chokeLevel = 2;
			collar.LoosenButtonPress(player() as never);
			vi.advanceTimersByTime(1500);
			expect(collar.settings.chokeLevel).toBe(1);
		});
	});

	describe("unload", () => {
		// The shared `collar` instance's own eventInterval (from load() in beforeAll) was
		// registered against real timers before any test's vi.useFakeTimers() existed, so
		// unload()ing it here wouldn't be observable under fake time -- a fresh instance is
		// load()ed (and unload()ed) entirely within this test instead, matching the pattern
		// in boops.test.ts's own interval-under-fake-timers test.
		it("clears the ChokeEvent interval so it no longer fires after unload", () => {
			const fresh = new CollarModule();
			fresh.load();
			const chokeEventSpy = vi.spyOn(fresh, "ChokeEvent");
			fresh.unload();
			vi.advanceTimersByTime(fresh.chokeEventTimer * 3);
			expect(chokeEventSpy).not.toHaveBeenCalled();
		});
	});
});
