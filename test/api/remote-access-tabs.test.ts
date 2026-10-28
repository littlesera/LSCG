// "Remote Access" is its own tab on every settings section that offers it (hypno, collar, magic, speech analysis), built
// from the same rows (Settings/remoteAccessRows.ts), and General has a Remote Access tab with the defaults sections can use.
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CoreModule } from "Modules/core";
import { HypnoModule } from "Modules/hypno";
import { CollarModule } from "Modules/collar";
import { MagicModule } from "Modules/magic";
import { StateModule } from "Modules/states";
import { SpeechAnalysisModule } from "Modules/speech-analysis";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { GuiHypno } from "../../src/Settings/hypno";
import { GuiCollar } from "../../src/Settings/collar";
import { GuiGlobal } from "../../src/Settings/global";
import { KitContext } from "../../src/Dom/kit";
import { buildMagicTabs } from "../../src/Settings/magic-pages";
import { buildSpeechTabs } from "../../src/Settings/speech-analysis-pages";
import { boot, resetWorld } from "../harness/world";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

type Tab = { label: string; panel: HTMLElement };

describe("Remote Access tabs", () => {
	let core: CoreModule;
	let hypno: HypnoModule;
	let collar: CollarModule;
	let magic: MagicModule;
	let speech: SpeechAnalysisModule;

	beforeAll(() => {
		[core, , , hypno, collar, magic, , speech] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new HypnoModule(), new CollarModule(), new MagicModule(), new StateModule(), new SpeechAnalysisModule());
	});

	beforeEach(() => {
		resetWorld({
			MemberNumber: 1, Nickname: "Sera",
			// the General screen reads a row from most of the other sections
			LSCG: {
				GlobalModule: { enabled: true }, StateModule: { states: [] }, MiscModule: {}, LeashingModule: { enabled: true }, BoopsModule: {}, LipstickModule: {},
				OpacityModule: {}, SplatterModule: {}, MapModule: {}, ChaoticItemModule: {},
			} as never,
		});
		// the hypnosis screen lists BC's numbered eye styles
		g.AssetGroupGet = () => ({ Asset: [] });
		(Player as unknown as { GetDifficulty: () => number }).GetDifficulty = () => 0;
		for (const m of [hypno, collar, magic]) m.init();
		Object.assign(hypno.settings, { enabled: true, locked: false });
		Object.assign(collar.settings, { enabled: true, breathplayEnabled: true, locked: false });
		magic.settings.enabled = true;
	});

	afterEach(() => { document.body.replaceChildren(); delete g.AssetGroupGet; });

	/** The tabs of a settings screen's rendered DOM, each with its panel. */
	function tabsOf(root: HTMLElement): Tab[] {
		document.body.append(root);
		const labels = Array.from(root.querySelectorAll(".lscg-kit-tabbar > *")).map(b => b.textContent ?? "");
		const panels = Array.from(root.querySelectorAll("[role=tabpanel]")) as HTMLElement[];
		return labels.map((label, i) => ({ label, panel: panels[i] }));
	}
	const rowLabels = (panel: HTMLElement) => Array.from(panel.querySelectorAll(".lscg-kit-row label")).map(l => l.textContent);
	const tab = (tabs: Tab[], label: string) => tabs.find(t => t.label === label)!;
	const SHARED_ROWS = ["Use global defaults", "Who can access", "Allowed member ids", "Requires trance", "Only the hypnotizer"];

	describe("hypnosis", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const build = () => tabsOf((new GuiHypno(hypno) as any).build());

		it("splits the trance settings from remote access", () => {
			const tabs = build();
			expect(tabs.map(t => t.label)).toEqual(expect.arrayContaining(["Triggers", "Remote Access", "Trance", "Suggestions"]));
			expect(tabs.map(t => t.label)).not.toContain("Trance & remote");
		});

		it("Remote Access holds only the remote rows, with the shared access rows in order", () => {
			const labels = rowLabels(tab(build(), "Remote Access").panel);
			expect(labels).toEqual([
				"Allow remote access", ...SHARED_ROWS, "Allow remote override member modification", "Lockable",
			]);
		});

		it("Trance holds what happens while hypnotized, and nothing about remote access", () => {
			const labels = rowLabels(tab(build(), "Trance").panel);
			expect(labels).toEqual(expect.arrayContaining(["Build arousal while hypnotized", "Enable spirals", "Enable wake-up on snaps", "Hypnotized eye color", "Hypnotized eye type"]));
			expect(labels.filter(l => /remote|global|trance$/i.test(l ?? "") && l !== "Requires trance")).toEqual([]);
			expect(labels).not.toContain("Allow remote access");
		});
	});

	describe("collar", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const build = () => tabsOf((new GuiCollar(collar) as any).build());

		it("has a Remote Access tab apart from the control collar", () => {
			const tabs = build();
			expect(tabs.map(t => t.label)).toEqual(expect.arrayContaining(["Breathplay", "Control collar", "Remote Access"]));
			expect(rowLabels(tab(tabs, "Control collar").panel)).not.toContain("Allow remote access");
			expect(rowLabels(tab(tabs, "Control collar").panel)).toContain("Tighten trigger");
		});

		it("Remote Access has the shared access rows", () => {
			expect(rowLabels(tab(build(), "Remote Access").panel)).toEqual(["Allow remote access", ...SHARED_ROWS, "Lockable"]);
		});

		it("both collar tabs give way to a notice while a remote user has locked the settings", () => {
			collar.settings.locked = true;
			const tabs = build();
			for (const label of ["Control collar", "Remote Access"]) {
				const panel = tab(tabs, label).panel;
				expect(panel.textContent).toContain("Collar Settings Locked");
				expect((panel.querySelector(".lscg-kit-panel") as HTMLElement).hidden).toBe(true);
			}
		});
	});

	describe("magic", () => {
		it("has the same rows as the others", () => {
			const panel = buildMagicTabs(new KitContext(), magic.settings, { remote: false, effects: [] }).find(t => t.label === "Remote Access")!;
			const root = document.createElement("div");
			root.append(...panel.render());
			expect(rowLabels(root)).toEqual(["Allow remote access", "Lockable", ...SHARED_ROWS]);
		});
	});

	describe("speech analysis", () => {
		it("calls its tab Remote Access and has the same rows", () => {
			const tabs = buildSpeechTabs(new KitContext(), speech.settings, { remote: false });
			expect(tabs.map(t => t.label)).toContain("Remote Access");
			expect(tabs.map(t => t.label)).not.toContain("Remote");
			const root = document.createElement("div");
			root.append(...tabs.find(t => t.label === "Remote Access")!.render());
			expect(rowLabels(root)).toEqual(["Allow remote configuration", "Use global defaults", "Who can configure", "Allowed member ids", "Requires trance", "Only the hypnotizer", "Allow lockout"]);
		});

		it("a remote view of someone using the global defaults says who can access follows them, and still shows their trance rules", () => {
			const target = { ...speech.settings, useGlobalRemote: true, remoteRequiresTrance: true, limitRemoteAccessToHypnotizer: true };
			const root = document.createElement("div");
			root.append(...buildSpeechTabs(new KitContext(), target, { remote: true }).find(t => t.label === "Remote Access")!.render());
			expect(root.textContent).toContain("wearer's global default, while hypnotized, hypnotizer only");
		});
	});

	describe("General", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const build = () => tabsOf((new GuiGlobal(core) as any).build());
		const global = () => Player.LSCG.GlobalModule as unknown as Record<string, unknown>;
		const select = (panel: HTMLElement) => panel.querySelector("select") as HTMLSelectElement;

		it("has a Remote Access tab with who can access, and nothing about trance, 'use global' or an on/off switch", () => {
			const tabs = build();
			expect(tabs.map(t => t.label)).toContain("Remote Access");
			expect(rowLabels(tab(tabs, "Remote Access").panel)).toEqual(["Who can access", "Allowed member ids"]);
		});

		it("edits the global defaults", () => {
			const panel = tab(build(), "Remote Access").panel;
			const level = select(panel);
			level.value = "Whitelist"; level.dispatchEvent(new Event("change"));
			expect(global().remoteLevel).toBe("Whitelist");
			const ids = panel.querySelector("input[type=text]") as HTMLInputElement;
			ids.value = "12, 34"; ids.dispatchEvent(new Event("change"));
			expect(global().remoteMemberIds).toBe("12, 34");
		});

		it("starts at the secure end: owner only, no trance rules", () => {
			expect(core.defaultSettings).toMatchObject({ remoteLevel: "Owner", remoteMemberIds: "" });
		});

		it("new sections start out using them", () => {
			for (const m of [hypno, collar, magic, speech])
				expect((m.defaultSettings as unknown as { useGlobalRemote: boolean }).useGlobalRemote, m.constructor.name).toBe(true);
		});
	});
});
