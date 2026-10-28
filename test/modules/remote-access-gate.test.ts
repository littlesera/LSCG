// The one rule for remote access (Modules/remoteAccess.ts, docs/remote-access.md), checked identically against every
// module that has remote screens: hypno, collar, magic and speech analysis. Hypno suggestions have their own feature flag
// but share the hypnotizer/owner rules, and are checked at the end. Anything that reads or changes a wearer's settings
// remotely must be listed in REMOTE_SETTINGS_COMMANDS, so a new path can't skip the gate.
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CoreModule } from "Modules/core";
import { HypnoModule } from "Modules/hypno";
import { CollarModule } from "Modules/collar";
import { MagicModule } from "Modules/magic";
import { StateModule } from "Modules/states";
import { SpeechAnalysisModule } from "Modules/speech-analysis";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import {
	REMOTE_SETTINGS_COMMANDS, REMOTE_TRANCE_DEFAULTS, canRemoteCollar, canRemoteHypno, canRemoteMagic, canRemoteSpeech, remoteCollarChanges,
	remoteHypnoChanges, remoteMagicChanges, tranceOptions,
} from "Modules/remoteAccess";
import { boot, resetWorld, addToRoom, player } from "../harness/world";
import { receive, sent } from "../harness/room";
import { makeCharacter, type FixtureCharacter } from "../harness/fixtures";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

const OWNER = 99;
const SENDER = 111;
const OTHER = 222;

interface GatedModule {
	name: string;
	key: "HypnoModule" | "CollarModule" | "MagicModule" | "SpeechAnalysisModule";
	can: (wearer: never, sender: never) => boolean;
	/** Setting holding the member ids that replace item permission, if the module has one. */
	list?: string;
	/** The trance option's name in this module's settings. */
	tranceKey: string;
	/** Other settings the module needs for anyone to pass. */
	base: Record<string, unknown>;
}

const MODULES: GatedModule[] = [
	{ name: "hypno", key: "HypnoModule", can: canRemoteHypno as never, list: "overrideMemberIds", tranceKey: "remoteAccessRequiredTrance", base: {} },
	{ name: "collar", key: "CollarModule", can: canRemoteCollar as never, list: "allowedMembers", tranceKey: "remoteAccessRequiredTrance", base: { breathplayEnabled: true, limitToCrafted: false } },
	{ name: "magic", key: "MagicModule", can: canRemoteMagic as never, list: "remoteMemberIds", tranceKey: "remoteAccessRequiredTrance", base: {} },
	{ name: "speech analysis", key: "SpeechAnalysisModule", can: canRemoteSpeech as never, tranceKey: "remoteRequiresTrance", base: { remoteLevel: "Public" } },
];

describe("remote access: one rule for every module", () => {
	let core: CoreModule;
	let hypno: HypnoModule;
	let sender: FixtureCharacter;

	beforeAll(() => {
		[core, , , hypno] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new HypnoModule(), new CollarModule(), new MagicModule(), new StateModule(), new SpeechAnalysisModule());
	});

	/** A wearer whose `key` settings are open to anyone item permission allows, no trance needed; `overrides` adjust them. */
	function wearerWith(module: GatedModule, overrides: Record<string, unknown> = {}, wearer: Record<string, unknown> = {}) {
		return makeCharacter({
			MemberNumber: 1, OwnerMemberNumber: OWNER,
			LSCG: {
				GlobalModule: { enabled: true },
				StateModule: { states: [] },
				[module.key]: { enabled: true, remoteAccess: true, [module.tranceKey]: false, limitRemoteAccessToHypnotizer: false, ...(module.list ? { [module.list]: "" } : {}), ...module.base, ...overrides },
			} as never,
			...wearer,
		});
	}
	const hypnotizedBy = (wearer: FixtureCharacter, by: number) => { wearer.LSCG.StateModule!.states = [{ type: "hypnotized", active: true, activatedBy: by, extensions: {} }] as never; };
	const who = (n: number) => makeCharacter({ MemberNumber: n });

	beforeEach(() => {
		g.ServerChatRoomGetAllowItem.mockReset();
		g.ServerChatRoomGetAllowItem.mockReturnValue(true);
	});

	describe.each(MODULES)("$name", module => {
		const can = (wearer: FixtureCharacter, from = SENDER) => module.can(wearer as never, who(from) as never);

		it("lets an item-permitted sender in when remote access is on, with no trance needed", () => {
			expect(can(wearerWith(module))).toBe(true);
		});

		it("needs remote access on, from everyone, the owner included", () => {
			const wearer = wearerWith(module, { remoteAccess: false });
			expect(can(wearer)).toBe(false);
			expect(can(wearer, OWNER)).toBe(false);
		});

		it("has no settings, or LSCG off for the wearer: nobody gets in, the owner included", () => {
			expect(module.can(makeCharacter({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } as never }) as never, who(SENDER) as never)).toBe(false);
			const off = wearerWith(module);
			off.LSCG.GlobalModule!.enabled = false;
			expect(can(off)).toBe(false);
			expect(can(off, OWNER)).toBe(false);
		});

		it("never lets the wearer through their own remote access", () => {
			expect(can(wearerWith(module), 1)).toBe(false);
		});

		it("the owner passes the module being off, item permission, a member list, and the trance rules", () => {
			g.ServerChatRoomGetAllowItem.mockReturnValue(false);
			const wearer = wearerWith(module, { enabled: false, [module.tranceKey]: true, limitRemoteAccessToHypnotizer: true, ...(module.list ? { [module.list]: "555" } : {}) });
			if (module.key === "SpeechAnalysisModule") wearer.LSCG.SpeechAnalysisModule!.remoteLevel = "Owner";
			expect(can(wearer, OWNER)).toBe(true);
			expect(can(wearer)).toBe(false);
		});

		it("anyone else needs the module on", () => {
			expect(can(wearerWith(module, { enabled: false }))).toBe(false);
		});

		it("anyone else needs item permission", () => {
			g.ServerChatRoomGetAllowItem.mockReturnValue(false);
			expect(can(wearerWith(module))).toBe(false);
		});

		if (module.list) {
			it("a member list replaces item permission: those listed get in, others don't, whatever item permission says", () => {
				const wearer = wearerWith(module, { [module.list!]: "111, 333" });
				g.ServerChatRoomGetAllowItem.mockReturnValue(false);
				expect(can(wearer)).toBe(true);
				g.ServerChatRoomGetAllowItem.mockReturnValue(true);
				expect(can(wearer, OTHER)).toBe(false);
			});
		}

		it("requiring trance: nobody but the owner gets in unless the wearer is hypnotized", () => {
			const wearer = wearerWith(module, { [module.tranceKey]: true });
			expect(can(wearer)).toBe(false);
			hypnotizedBy(wearer, OTHER);
			expect(can(wearer)).toBe(true);
		});

		it("limited to the hypnotizer: only whoever hypnotized the wearer gets in", () => {
			const wearer = wearerWith(module, { limitRemoteAccessToHypnotizer: true });
			expect(can(wearer)).toBe(false); // not hypnotized at all
			hypnotizedBy(wearer, OTHER);
			expect(can(wearer)).toBe(false);
			hypnotizedBy(wearer, SENDER);
			expect(can(wearer)).toBe(true);
		});

		it("options the wearer never set fall back to the module's defaults, the same ones its settings screen shows", () => {
			const wearer = wearerWith(module);
			delete (wearer.LSCG[module.key] as Record<string, unknown>)[module.tranceKey];
			delete (wearer.LSCG[module.key] as Record<string, unknown>).limitRemoteAccessToHypnotizer;
			const defaults = REMOTE_TRANCE_DEFAULTS[module.key];
			expect(tranceOptions(module.key, wearer.LSCG[module.key] as never)).toEqual(defaults);
			expect(can(wearer)).toBe(!defaults.trance);
			hypnotizedBy(wearer, SENDER);
			expect(can(wearer)).toBe(true);
		});
	});

	describe("module-specific rules on top", () => {
		it("collar: breathplay off shuts everyone out, the owner included, and the crafter counts as listed when limited to crafted", () => {
			const collar = MODULES[1];
			const off = wearerWith(collar, { breathplayEnabled: false });
			expect(canRemoteCollar(off as never, who(OWNER) as never)).toBe(false);
			const crafted = wearerWith(collar, { limitToCrafted: true, collar: { name: "Choker", creator: SENDER } });
			g.ServerChatRoomGetAllowItem.mockReturnValue(false);
			expect(canRemoteCollar(crafted as never, who(SENDER) as never)).toBe(true);
			expect(canRemoteCollar(crafted as never, who(OTHER) as never)).toBe(false);
		});

		it.each([
			["Public", { sender: OTHER, allowed: true }],
			["Whitelist", { sender: OTHER, allowed: false }],
			["Whitelist", { sender: 60, allowed: true }],
			["Lovers", { sender: 60, allowed: false }],
			["Lovers", { sender: 50, allowed: true }],
			["Owner", { sender: 50, allowed: false }],
			["PublicExceptBlacklist", { sender: 66, allowed: false }],
			["PublicExceptBlacklist", { sender: OTHER, allowed: true }],
			["Friends", { sender: 70, allowed: true }],
			["Friends", { sender: OTHER, allowed: false }],
		] as const)("speech analysis: access level %s, sender %j", (level, { sender: from, allowed }) => {
			const speech = MODULES[3];
			const wearer = wearerWith(speech, { remoteLevel: level }, { WhiteList: [60], BlackList: [66], LoverMemberNumber: [50] } as never);
			(wearer as unknown as { FriendList: number[]; IsPlayer: () => boolean }).FriendList = [70];
			(wearer as unknown as { IsPlayer: () => boolean }).IsPlayer = () => true;
			Object.assign(globalThis, { Player: wearer });
			expect(canRemoteSpeech(wearer as never, who(from) as never)).toBe(allowed);
		});

		it("speech analysis: item permission applies on top of the level (a level never grants more than item permission)", () => {
			const speech = MODULES[3];
			g.ServerChatRoomGetAllowItem.mockReturnValue(false);
			expect(canRemoteSpeech(wearerWith(speech, { remoteLevel: "Public" }) as never, who(SENDER) as never)).toBe(false);
		});
	});

	describe("what each remote screen may change", () => {
		const hypnoWearer = () => wearerWith(MODULES[0]);

		it("never access itself, who may use it, or the lock without the wearer's say-so", () => {
			const forged = { remoteAccess: false, enabled: false, overrideMemberIds: "111", allowedMembers: "111", remoteMemberIds: "111", lockable: true, allowLocked: true, locked: true };
			expect(remoteHypnoChanges(hypnoWearer() as never, who(SENDER) as never, forged)).toEqual({});
			// The collar's own "who may use it" list is something its remote screen edits (see docs/remote-access.md); the rest isn't.
			expect(remoteCollarChanges(wearerWith(MODULES[1]) as never, forged)).toEqual({ allowedMembers: "111" });
			expect(remoteMagicChanges(wearerWith(MODULES[2]) as never, forged)).toEqual({});
		});

		it("the lock is writable once the wearer allows it, under either of its names", () => {
			expect(remoteHypnoChanges(wearerWith(MODULES[0], { allowLocked: true }) as never, who(SENDER) as never, { locked: true })).toEqual({ locked: true });
			expect(remoteCollarChanges(wearerWith(MODULES[1], { lockable: true }) as never, { locked: true })).toEqual({ locked: true });
			expect(remoteMagicChanges(wearerWith(MODULES[2], { lockable: true }) as never, { locked: true })).toEqual({ locked: true });
		});

		it("a remote user can't switch the collar's module off", () => {
			expect(remoteCollarChanges(wearerWith(MODULES[1]) as never, { enabled: false, tightTrigger: "squeeze" })).toEqual({ tightTrigger: "squeeze" });
		});
	});

	describe("the receiver (\"remote\" command)", () => {
		beforeEach(() => {
			resetWorld({ MemberNumber: 1, OwnerMemberNumber: OWNER, LSCG: { GlobalModule: { enabled: true }, StateModule: { states: [] } } });
			sender = addToRoom(makeCharacter({ MemberNumber: SENDER, Nickname: "Kai" }));
			core.init?.();
			for (const m of [hypno]) m.init();
		});

		const sendRemote = (settings: Record<string, unknown>) => receive.hidden(sender, {
			IsLSCG: true, type: "command", reply: false, target: player().MemberNumber, version: "v0", settings, command: { name: "remote", args: [] },
		} as unknown as LSCGMessageModel);

		it("does nothing while LSCG is off for the wearer, even from the owner", () => {
			Object.assign(hypno.settings, { enabled: true, remoteAccess: true, remoteAccessRequiredTrance: false });
			player().LSCG.GlobalModule!.enabled = false;
			sendRemote({ HypnoModule: { overrideWords: "sleepy" } });
			expect(hypno.settings.overrideWords).not.toBe("sleepy");
			expect(sent.local()).toEqual([]);
		});
	});

	describe("hypno suggestions", () => {
		beforeEach(() => {
			resetWorld({ MemberNumber: 1, OwnerMemberNumber: OWNER, LoverMemberNumber: [50], LSCG: { GlobalModule: { enabled: true }, StateModule: { states: [] } } });
			hypno.init();
			Object.assign(hypno.settings, { enabled: true, allowSuggestions: true, suggestionRequireHypnotizer: false, overrideMemberIds: "" });
			for (const n of [SENDER, OTHER, OWNER, 50]) addToRoom(makeCharacter({ MemberNumber: n }));
		});

		const hypnotize = (by: number) => { player().LSCG.StateModule!.states = [{ type: "hypnotized", active: true, activatedBy: by, extensions: {} }] as never; };

		it("the owner and lovers always may, hypnotized or not, but never with hypnosis off (the precedence bug)", () => {
			expect(hypno.CanModifySuggestions(OWNER)).toBe(true);
			expect(hypno.CanModifySuggestions(50)).toBe(true);
			hypno.settings.enabled = false;
			expect(hypno.CanModifySuggestions(OWNER)).toBe(false);
			hypnotize(SENDER);
			expect(hypno.CanModifySuggestions(SENDER)).toBe(false);
		});

		it("anyone else needs the player hypnotized, suggestions allowed and item permission", () => {
			expect(hypno.CanModifySuggestions(SENDER)).toBe(false);
			hypnotize(OTHER);
			expect(hypno.CanModifySuggestions(SENDER)).toBe(true);
			hypno.settings.allowSuggestions = false;
			expect(hypno.CanModifySuggestions(SENDER)).toBe(false);
			hypno.settings.allowSuggestions = true;
			g.ServerChatRoomGetAllowItem.mockReturnValue(false);
			expect(hypno.CanModifySuggestions(SENDER)).toBe(false);
		});

		it("limited to the hypnotizer is enforced here too, not only on the sender's screen", () => {
			hypno.settings.suggestionRequireHypnotizer = true;
			hypnotize(OTHER);
			expect(hypno.CanModifySuggestions(SENDER)).toBe(false);
			hypnotize(SENDER);
			expect(hypno.CanModifySuggestions(SENDER)).toBe(true);
			expect(hypno.CanModifySuggestions(OWNER)).toBe(true);
		});
	});

	describe("coverage guard", () => {
		it("every command that reads or changes settings remotely is listed with its gate", () => {
			const registered = core.CommandListeners.map(l => String(l.command));
			const settingsish = [...registered, "remote"].filter(name => /settings|suggestions|^remote$/.test(name));
			expect(settingsish.length).toBeGreaterThan(0);
			for (const name of settingsish)
				expect(Object.keys(REMOTE_SETTINGS_COMMANDS), `${name} is a remote settings command with no gate listed`).toContain(name);
		});

		it("lists no command nothing handles", () => {
			const registered = core.CommandListeners.map(l => String(l.command));
			for (const name of Object.keys(REMOTE_SETTINGS_COMMANDS))
				expect([...registered, "remote"]).toContain(name);
		});
	});
});
