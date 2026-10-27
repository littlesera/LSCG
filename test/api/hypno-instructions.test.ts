// Extension suggestion instructions: registration and validation, running inside a suggestion with checked options and the
// public context, the player's block list, instructions whose extension isn't installed, suggestions pushed by another player
// (their options are checked again here), and what the suggestion editor and block list offer.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { HypnoInstruction, HypnoModule, HypnoSuggestion, SuggestionMiniGameOptions } from "Modules/hypno";
import { StateModule } from "Modules/states";
import { LeashingModule } from "Modules/leashing";
import { InstructionDescription, LSCGHypnoInstruction } from "Settings/Models/hypno";
import { KitContext } from "../../src/Dom/kit";
import { registerExtension, type ModApiHandle } from "api/extensions";
import { extensionInstructionIds, extensionInstructions, instructionLabel } from "api/hypno";
import { apiCapabilities } from "api";
import type { LSCGHypnoInstructionDefinition } from "api/types";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeCharacter, type FixtureCharacter } from "../harness/fixtures";
import { sent } from "../harness/room";

describe("extension hypno instructions", () => {
	let hypno: HypnoModule;
	let states: StateModule;
	let leashing: LeashingModule;
	let alice: FixtureCharacter;
	let api: ModApiHandle;
	let ids = 0;
	// Loaded after the modules, which the remote screens import in a cycle.
	let RemoteSuggestions: typeof import("Settings/Remote/suggestions").RemoteSuggestions;

	beforeAll(async () => {
		[, leashing, hypno, states] = boot(new CoreModule(), new LeashingModule(), new HypnoModule(), new StateModule());
		vi.useFakeTimers();
		await import("Settings/Remote/mainmenu"); // the entry the remote screens are meant to load from (they import each other)
		({ RemoteSuggestions } = await import("Settings/Remote/suggestions"));
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "Sera", OwnerMemberNumber: 99, LSCG: { GlobalModule: { enabled: true } } });
		hypno.init();
		states.init();
		leashing.Pairings = [];
		addToRoom(player());
		alice = addToRoom(makeCharacter({ MemberNumber: 2, Nickname: "Alice" }));
		hypno.settings.enabled = true;
		hypno.settings.influence = [];
		hypno.settings.suggestions = [];
		hypno.settings.blockedInstructions = [];
		api = registerExtension({ id: `hyp-${++ids}`, name: "Trance Pack", version: "1" });
	});

	afterEach(() => {
		api.dispose();
		vi.clearAllTimers();
	});

	const id = (name: string) => `${api.id}.${name}`;
	const purr = (overrides: Partial<LSCGHypnoInstructionDefinition> = {}): LSCGHypnoInstructionDefinition => ({
		name: "purr", label: "Purr", description: "Compel the subject to purr.", perform: () => {}, ...overrides,
	});
	const withOptions = (perform: LSCGHypnoInstructionDefinition["perform"] = () => {}) => purr({
		perform,
		options: [
			{ type: "select", key: "volume", choices: [{ value: "soft", label: "Soft" }, { value: "loud", label: "Loud" }], default: "soft" },
			{ type: "number", key: "times", min: 1, max: 3, default: 1 },
			{ type: "toggle", key: "nuzzle" },
		],
	});

	function instruction(type: string, args: Record<string, unknown> = {}) {
		const i = new HypnoInstruction(type);
		i.arguments = args;
		return i;
	}
	function suggestion(name: string, instructions: HypnoInstruction[] = [], installedBy = 2) {
		const s = new HypnoSuggestion(name);
		s.installedBy = installedBy;
		s.trigger = "kitten";
		s.instructions = instructions;
		return s;
	}
	function doSuggestion(...instructions: HypnoInstruction[]) {
		hypno.DoSuggestion(new SuggestionMiniGameOptions(suggestion("Kitty", instructions, 3), alice as never, ""));
		vi.advanceTimersByTime(instructions.length * 1000);
	}
	const local = () => sent.local().join("\n");

	it("is advertised as a capability", () => {
		expect(apiCapabilities.has("hypno.instructions")).toBe(true);
	});

	describe("registering", () => {
		it("lives under the extension's namespace, with its source", () => {
			api.hypno.registerInstruction(purr());
			const def = extensionInstructions.get(id("purr"))!;
			expect(def).toMatchObject({ label: "Purr", source: "Trance Pack", unrepeatable: false, terminating: false });
			expect(extensionInstructionIds()).toContain(id("purr"));
			expect(() => api.hypno.registerInstruction(purr())).toThrow(/already registered/);
		});

		it("rejects a definition with no perform, label or name, or with bad options", () => {
			expect(() => api.hypno.registerInstruction(purr({ perform: undefined as never }))).toThrow(/perform/);
			expect(() => api.hypno.registerInstruction(purr({ label: "" }))).toThrow(/label/);
			expect(() => api.hypno.registerInstruction(purr({ name: " " }))).toThrow(/name/);
			expect(() => api.hypno.registerInstruction(purr({ name: "x", options: [{ type: "toggle", key: "no spaces" }] }))).toThrow(/identifier/);
		});

		it("can be unregistered, and goes away with the extension", () => {
			api.hypno.registerInstruction(purr());
			expect(api.hypno.unregisterInstruction("purr")).toBe(true);
			expect(api.hypno.unregisterInstruction("purr")).toBe(false);
			expect(extensionInstructions.get(id("purr"))).toBeUndefined();
			api.hypno.registerInstruction(purr({ name: "again" }));
			api.dispose();
			expect(extensionInstructions.get(id("again"))).toBeUndefined();
		});
	});

	describe("running in a suggestion", () => {
		it("performs with the public context, and the options chosen for it", () => {
			const perform = vi.fn(ctx => { ctx.sendAction("%NAME% purrs."); ctx.states.get("asleep"); });
			api.hypno.registerInstruction(withOptions(perform));
			doSuggestion(instruction(id("purr"), { options: { volume: "loud", times: 2, nuzzle: true } }));
			expect(perform).toHaveBeenCalledOnce();
			expect(perform.mock.calls[0][0]).toMatchObject({
				instruction: id("purr"), suggestion: "Kitty", sender: 2, installedBy: 3,
				options: { volume: "loud", times: 2, nuzzle: true },
			});
			expect(sent.actions().at(-1)).toContain("purrs.");
		});

		it("checks the options against what the extension declared, whoever wrote the suggestion", () => {
			const perform = vi.fn();
			api.hypno.registerInstruction(withOptions(perform));
			doSuggestion(instruction(id("purr"), { options: { volume: "deafening", times: 99, nuzzle: "yes", extra: "x" } }));
			expect(perform.mock.calls[0][0].options).toEqual({ volume: "soft", times: 3, nuzzle: false });
			doSuggestion(instruction(id("purr")));
			expect(perform.mock.calls[1][0].options).toEqual({ volume: "soft", times: 1, nuzzle: false });
		});

		it("gives an empty options object when none are declared", () => {
			const perform = vi.fn();
			api.hypno.registerInstruction(purr({ perform }));
			doSuggestion(instruction(id("purr"), { options: { anything: 1 } }));
			expect(perform.mock.calls[0][0].options).toEqual({});
		});

		it("runs in order among LSCG's own instructions, a second apart", () => {
			const order: string[] = [];
			api.hypno.registerInstruction(purr({ perform: () => { order.push("purr"); } }));
			const strip = vi.spyOn(hypno, "ForceStrip").mockImplementation(() => { order.push("strip"); });
			hypno.DoSuggestion(new SuggestionMiniGameOptions(suggestion("Mix", [instruction(LSCGHypnoInstruction.strip), instruction(id("purr"))]), alice as never, ""));
			vi.advanceTimersByTime(0);
			expect(order).toEqual(["strip"]);
			vi.advanceTimersByTime(1000);
			expect(order).toEqual(["strip", "purr"]);
			strip.mockRestore();
		});

		it("contains a throwing instruction, counting it against the extension", () => {
			const err = vi.spyOn(console, "error").mockImplementation(() => {});
			api.hypno.registerInstruction(purr({ perform: () => { throw new Error("boom"); } }));
			expect(() => doSuggestion(instruction(id("purr")))).not.toThrow();
			expect(api.errorCount).toBe(1);
			err.mockRestore();
		});

		it("is refused when the player blocked it", () => {
			const perform = vi.fn();
			api.hypno.registerInstruction(purr({ perform }));
			hypno.settings.blockedInstructions = [id("purr")];
			doSuggestion(instruction(id("purr")));
			expect(perform).not.toHaveBeenCalled();
			expect(local()).toContain("immune to the suggestion's");
		});

		it("does nothing, and says so, when its extension isn't installed", () => {
			expect(() => doSuggestion(instruction("gone.purr", { options: { a: 1 } }))).not.toThrow();
			expect(local()).toContain("its instruction isn't available");
		});
	});

	describe("a suggestion pushed by another player", () => {
		const push = (...instructions: HypnoInstruction[]) => {
			const owner = addToRoom(makeCharacter({ MemberNumber: 99, Nickname: "Boss" }));
			hypno.SuggestionsPushHandler(owner.MemberNumber, { command: { name: "set-suggestions", args: [{ name: "suggestions", value: [suggestion("Pushed", instructions, 99)] }] } } as never);
			return hypno.settings.suggestions.find(s => s.name === "Pushed")!.instructions;
		};

		it("keeps only the extension instruction's declared options, each checked", () => {
			api.hypno.registerInstruction(withOptions());
			const [pushed] = push(instruction(id("purr"), { options: { volume: "x", times: 9, nuzzle: true, extra: "bad" }, other: "bad" }));
			expect(pushed.arguments).toEqual({ options: { volume: "soft", times: 3, nuzzle: true } });
		});

		it("keeps nothing of an instruction whose extension isn't installed, and leaves LSCG's own alone", () => {
			const [unknown, own] = push(instruction("gone.purr", { options: { a: 1 } }), instruction(LSCGHypnoInstruction.say, { config: "meow" }));
			expect(unknown.arguments).toEqual({});
			expect(own.arguments).toEqual({ config: "meow" });
		});
	});

	describe("the delay between instructions, in the editor", () => {
		const screen = () => Object.create(RemoteSuggestions.prototype, { settings: { value: { blockedInstructions: [] } } }) as RemoteSuggestions;
		// instructionRows is the editor's own, private, row builder for one slot.
		const rowsFor = (sg: HypnoSuggestion, ix: number, screenCtx = new KitContext()) =>
			(screen() as unknown as { instructionRows(d: KitContext, s: HypnoSuggestion, i: number, c: KitContext): HTMLElement[] }).instructionRows(new KitContext(), sg, ix, screenCtx);
		const connector = (rows: HTMLElement[]) => rows.find(r => r.classList.contains("lscg-delay-connector")) as HTMLDetailsElement | undefined;
		const rowIn = (scope: ParentNode, label: string) =>
			Array.from(scope.querySelectorAll(".lscg-kit-row")).find(r => r.querySelector("label")?.textContent === label) as HTMLElement;
		const type = (el: HTMLInputElement, value: string) => { el.value = value; el.dispatchEvent(new Event("change")); };

		it("is a thin connector above every instruction after the first, and only once it is chosen", () => {
			const sg = suggestion("Kitty", [instruction(LSCGHypnoInstruction.strip), instruction(LSCGHypnoInstruction.pose)]);
			expect(connector(rowsFor(sg, 0))).toBeUndefined();
			const second = connector(rowsFor(sg, 1))!;
			expect(second.open).toBe(false);
			expect(second.querySelector("summary")!.textContent).toBe("\u21b3 wait 1s");
			// an empty slot has nothing to wait for yet
			expect(connector(rowsFor(sg, 2))).toBeUndefined();
		});

		it("sets a custom delay on the instruction, shows it, and goes back to the default", () => {
			const sg = suggestion("Kitty", [instruction(LSCGHypnoInstruction.strip), instruction(LSCGHypnoInstruction.pose)]);
			const screenCtx = new KitContext(); const changed = vi.fn(); screenCtx.watch(changed); changed.mockClear();
			const panel = connector(rowsFor(sg, 1, screenCtx))!;
			const custom = () => rowIn(panel, "Custom delay").querySelector("input") as HTMLInputElement;
			const seconds = () => rowIn(panel, "Wait (seconds)");
			const summary = () => panel.querySelector("summary")!.textContent;

			custom().checked = true; custom().dispatchEvent(new Event("change"));
			expect(sg.instructions[1].delay).toBe(1000);
			expect(summary()).toBe("\u21b3 wait 1s (custom)");
			type(seconds().querySelector("input") as HTMLInputElement, "7.5");
			expect(sg.instructions[1].delay).toBe(7500);
			expect(summary()).toBe("\u21b3 wait 7.5s (custom)");
			expect((seconds().querySelector("input") as HTMLInputElement).min).toBe("1");
			expect(changed).toHaveBeenCalled(); // the screen behind learns of it

			custom().checked = false; custom().dispatchEvent(new Event("change"));
			expect(sg.instructions[1].delay).toBeUndefined();
			expect("delay" in sg.instructions[1]).toBe(false);
			expect(summary()).toBe("\u21b3 wait 1s");
		});

		it("works for an extension's instruction too, and shows an out-of-range stored delay within the limits", () => {
			api.hypno.registerInstruction(purr());
			const sg = suggestion("Kitty", [instruction(LSCGHypnoInstruction.strip), Object.assign(instruction(id("purr")), { delay: 99_999_999 })]);
			expect(connector(rowsFor(sg, 1))!.querySelector("summary")!.textContent).toBe("\u21b3 wait 30s (custom)");
		});
	});

	describe("in the editor and the block list", () => {
		// The screen needs a character to open on; its lists only need the settings, so use the prototype directly.
		const screen = (blocked: string[] = []) =>
			Object.create(RemoteSuggestions.prototype, { settings: { value: { blockedInstructions: blocked } } }) as RemoteSuggestions;

		it("labels and describes an extension's instruction, and flags one that isn't installed", () => {
			api.hypno.registerInstruction(purr());
			expect(instructionLabel(id("purr"))).toBe("Purr");
			expect(instructionLabel(LSCGHypnoInstruction.say)).toBe("Speak Phrase");
			expect(instructionLabel("gone.purr")).toBe("(unavailable) gone.purr");
			expect(InstructionDescription(id("purr"))).toBe("Compel the subject to purr.");
			expect(InstructionDescription("gone.purr")).toBe("");
		});

		it("offers it after LSCG's own, unless the player blocked it", () => {
			api.hypno.registerInstruction(purr());
			const all = screen().ActualInstructions;
			expect(all.slice(0, -1)).toEqual(Object.values(LSCGHypnoInstruction).filter(i => i !== LSCGHypnoInstruction.none));
			expect(all.at(-1)).toBe(id("purr"));
			expect(screen([id("purr")]).ActualInstructions).not.toContain(id("purr"));
		});

		it("keeps an unrepeatable instruction to one slot, and ends the suggestion after a terminating one", () => {
			api.hypno.registerInstruction(purr({ unrepeatable: true }));
			api.hypno.registerInstruction(purr({ name: "last", label: "Last", terminating: true }));
			const sg = suggestion("Kitty", [instruction(id("purr")), instruction(id("last"))]);
			const ui = screen();
			expect(ui.AvailableInstructions(sg, 1)).not.toContain(id("purr"));
			expect(ui.AvailableInstructions(sg, 0)).toContain(id("purr"));
			expect(ui.PreviousInstructionIsTerminating(sg, 2)).toBe(true);
			expect(ui.PreviousInstructionIsTerminating(sg, 1)).toBe(false);
		});
	});
});
