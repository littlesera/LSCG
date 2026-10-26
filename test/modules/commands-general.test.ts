// The general /lscg commands: the /lscg dispatcher and help, show-triggers, the activity rolls, escape, conditions,
// parse-code, export/import and the emergency reset.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { CommandModule } from "Modules/commands";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { HypnoModule } from "Modules/hypno";
import { CollarModule } from "Modules/collar";
import { StateModule } from "Modules/states";
import { ItemUseModule } from "Modules/item-use";
import { LeashingModule } from "Modules/leashing";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeCharacter } from "../harness/fixtures";
import { sent } from "../harness/room";
import { seedRandom, restoreRandom } from "../harness/time";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

describe("/lscg commands", () => {
	let commands: CommandModule;
	let hypno: HypnoModule;
	let collar: CollarModule;
	let states: StateModule;
	let leashing: LeashingModule;
	let lscg: { Action: (args: string, msg: string, parsed: string[]) => void };

	beforeAll(() => {
		[, commands, , , hypno, collar, states, , leashing] = boot(
			new CoreModule(), new CommandModule(), new ConsentModule(), new ActivityModule(), new HypnoModule(),
			new CollarModule(), new StateModule(), new ItemUseModule(), new LeashingModule(),
		);
		lscg = g.CommandCombine.mock.calls.flat(2).find((c: { Tag: string }) => c.Tag === "lscg");
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true } } });
		hypno.init();
		collar.init();
		states.init();
		addToRoom(player());
	});

	afterEach(() => {
		restoreRandom();
		vi.unstubAllGlobals();
	});

	const run = (line: string) => lscg.Action(line, `/lscg ${line}`, line ? line.split(" ") : []);
	const local = () => sent.local().join("\n");

	it("bare /lscg shows help, listing help first and the rest alphabetically", () => {
		run("");
		const text = local();
		expect(text).toContain("Little Sera's Club Games");
		expect(commands.subCommands[0]).toBe("help");
		expect(commands.subCommands.slice(1)).toEqual([...commands.subCommands.slice(1)].sort((a, b) => a.localeCompare(b)));
		expect(text.indexOf(">help<")).toBeLessThan(text.indexOf(">roll<"));
	});

	it("help adapts its colours to a light chat theme", () => {
		player().ChatSettings.ColorTheme = "Light";
		run("help");
		expect(local()).toContain("midnightblue");
	});

	it("routes a subcommand with its arguments, ignoring case, and ignores unknown ones", () => {
		run("ROLL-ATTACK");
		expect(local()).toContain("Please specify a defender");
		run("nonsense here");
	});

	describe("show-triggers", () => {
		it("says what isn't enabled", () => {
			run("show-triggers");
			expect(local()).toContain("Hypnosis not enabled");
			expect(local()).toContain("Breathplay Collar not enabled");
		});

		it("lists the triggers, or hides them while immersive", () => {
			hypno.settings.enabled = true;
			hypno.settings.trigger = "sleepy";
			collar.settings.enabled = true;
			Object.assign(collar.settings, { tightTrigger: "tighter", looseTrigger: "looser" });
			run("show-triggers");
			expect(local()).toContain("<b>Hypnosis:</b> sleepy");
			expect(local()).toContain("<b>Collar Tighten:</b> tighter");
			states.settings.immersive = true;
			collar.settings.immersive = true;
			run("show-triggers");
			expect(sent.local().at(-1)).toContain("hidden while immersive");
		});
	});

	describe("rolls", () => {
		beforeEach(() => { addToRoom(makeCharacter({ MemberNumber: 2, Nickname: "Alice", LSCG: { CollarModule: { chokeLevel: 0 } } })); });

		it("an unopposed roll", () => {
			seedRandom([0.5]);
			run("roll");
			expect(sent.actions().at(-1)).toBe("Sera makes an activity roll and gets: 11 ");
		});

		it("attacking and defending against someone", () => {
			seedRandom([0.95, 0]);
			run("roll-attack Alice");
			expect(sent.actions().slice(-2)).toEqual(["Sera makes an activity check attack against Alice!", "Sera: 20 -- Alice: 1 "]);
			seedRandom([0.95, 0]);
			run("roll-defend Alice");
			expect(sent.actions().slice(-2)).toEqual(["Sera makes an activity check defending from Alice!", "Sera: 1 -- Alice: 20 "]);
		});

		it("needs someone in the room to roll against", () => {
			run("roll-defend");
			run("roll-attack Nobody");
			run("roll-defend Nobody");
			expect(sent.local().map(l => l.replace(/<[^>]+>/g, ""))).toEqual([
				"Please specify an attacker for your roll.", "Defender Nobody not found.", "Attacker Nobody not found.",
			]);
		});
	});

	it("escape tries to break free of a grab", () => {
		const escape = vi.spyOn(leashing, "TryEscape").mockImplementation(() => {});
		run("escape");
		expect(escape).toHaveBeenCalledOnce();
		escape.mockRestore();
	});

	it("conditions lists active states on you or someone else", () => {
		states.SleepState.Activate(undefined, undefined, false);
		run("conditions");
		expect(local()).toContain("Active Conditions on Sera:</b><ul><li>asleep</li>");
		addToRoom(makeCharacter({ MemberNumber: 2, Nickname: "Alice", LSCG: { StateModule: { states: [{ type: "hypnotized", active: true }, { type: "asleep", active: false }] } } }));
		run("conditions Alice");
		expect(sent.local().at(-1)).toContain("Active Conditions on Alice:</b><ul><li>hypnotized</li></ul>");
	});

	describe("parse-code", () => {
		it("lists the items in a code", () => {
			vi.stubGlobal("prompt", () => g.LZString.compressToBase64(JSON.stringify([{ Group: "Cloth", Name: "Dress" }])));
			run("parse-code");
			expect(local()).toContain("<li>Cloth - Dress</li>");
		});

		it("says when there's no code, or it can't be read", () => {
			vi.stubGlobal("prompt", () => "");
			run("parse-code");
			vi.stubGlobal("prompt", () => "garbage");
			run("parse-code");
			expect(local()).toContain("No code entered.");
			expect(local()).toContain("Invalid code.");
		});
	});

	describe("settings", () => {
		it("export downloads the settings", () => {
			vi.stubGlobal("URL", { createObjectURL: () => "blob:x", revokeObjectURL: vi.fn() });
			const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
			run("export");
			expect(click).toHaveBeenCalledOnce();
			click.mockRestore();
		});

		it("import and the emergency reset do nothing unless confirmed", () => {
			vi.stubGlobal("confirm", () => false);
			const reset = vi.spyOn(commands, "EmergencyRelease");
			run("import");
			run("emergency");
			expect(reset).not.toHaveBeenCalled();
			reset.mockRestore();
		});

		it("the emergency reset safewords every module and restores their defaults", () => {
			vi.stubGlobal("confirm", () => true);
			collar.settings.chokeLevel = 3;
			hypno.settings.trigger = "custom";
			run("emergency");
			expect(player().LSCG.CollarModule.chokeLevel).toBe(0);
			expect(player().LSCG.HypnoModule).toEqual(hypno.defaultSettings);
		});
	});
});
