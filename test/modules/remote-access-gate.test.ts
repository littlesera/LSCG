// The one rule for remote access (Modules/remoteAccess.ts, docs/remote-access.md), checked identically against every
// module that has remote screens: hypno, collar, magic and speech analysis. Who gets in is the access level the wearer
// picked (BC's interaction levels plus friends) or a member on their list of allowed member ids, never BC item permission.
// Hypno suggestions have their own feature flag but share the hypnotizer/owner rules, and are checked at the end. Anything
// that reads or changes a wearer's settings remotely must be listed in REMOTE_SETTINGS_COMMANDS, so a new path can't skip
// the gate.
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
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
	/** The trance option's name in this module's settings. */
	tranceKey: string;
	/** Other settings the module needs for anyone to pass. */
	base: Record<string, unknown>;
}

const MODULES: GatedModule[] = [
	{ name: "hypno", key: "HypnoModule", can: canRemoteHypno as never, tranceKey: "remoteAccessRequiredTrance", base: {} },
	{ name: "collar", key: "CollarModule", can: canRemoteCollar as never, tranceKey: "remoteAccessRequiredTrance", base: { breathplayEnabled: true, limitToCrafted: false } },
	{ name: "magic", key: "MagicModule", can: canRemoteMagic as never, tranceKey: "remoteAccessRequiredTrance", base: {} },
	{ name: "speech analysis", key: "SpeechAnalysisModule", can: canRemoteSpeech as never, tranceKey: "remoteRequiresTrance", base: {} },
];

describe("remote access: one rule for every module", () => {
	let core: CoreModule;
	let hypno: HypnoModule;
	let sender: FixtureCharacter;

	beforeAll(() => {
		[core, , , hypno] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new HypnoModule(), new CollarModule(), new MagicModule(), new StateModule(), new SpeechAnalysisModule());
	});

	/** A wearer whose `key` settings are open to everyone, no trance needed; `overrides` adjust them. */
	function wearerWith(module: GatedModule, overrides: Record<string, unknown> = {}, wearer: Record<string, unknown> = {}) {
		return makeCharacter({
			MemberNumber: 1, OwnerMemberNumber: OWNER,
			LSCG: {
				GlobalModule: { enabled: true },
				StateModule: { states: [] },
				[module.key]: { enabled: true, remoteAccess: true, [module.tranceKey]: false, limitRemoteAccessToHypnotizer: false, useGlobalRemote: false, remoteLevel: "Public", remoteMemberIds: "", ...module.base, ...overrides },
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

		it("lets a sender within the level in when remote access is on, with no trance needed", () => {
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

		it("the owner passes the module being off, the level, and the trance rules", () => {
			const wearer = wearerWith(module, { enabled: false, remoteLevel: "Lovers", [module.tranceKey]: true, limitRemoteAccessToHypnotizer: true });
			expect(can(wearer, OWNER)).toBe(true);
			expect(can(wearer)).toBe(false);
		});

		it("anyone else needs the module on", () => {
			expect(can(wearerWith(module, { enabled: false }))).toBe(false);
		});

		it("never consults BC item permission: the level decides", () => {
			g.ServerChatRoomGetAllowItem.mockReturnValue(false);
			expect(can(wearerWith(module))).toBe(true);
			g.ServerChatRoomGetAllowItem.mockReturnValue(true);
			expect(can(wearerWith(module, { remoteLevel: "Owner" }))).toBe(false);
		});

		it("allowed member ids get in whatever the level says, and nobody else does", () => {
			const wearer = wearerWith(module, { remoteLevel: "Owner", remoteMemberIds: "111, 333" });
			expect(can(wearer)).toBe(true);
			expect(can(wearer, 333)).toBe(true);
			expect(can(wearer, OTHER)).toBe(false);
			expect(can(wearer, OWNER)).toBe(true);
		});

		it("allowed member ids don't skip the module being on or the trance rules", () => {
			expect(can(wearerWith(module, { remoteLevel: "Owner", remoteMemberIds: "111", enabled: false }))).toBe(false);
			const wearer = wearerWith(module, { remoteLevel: "Owner", remoteMemberIds: "111", [module.tranceKey]: true });
			expect(can(wearer)).toBe(false);
			hypnotizedBy(wearer, OTHER);
			expect(can(wearer)).toBe(true);
		});

		it("allowed member ids still need remote access on, and junk in the list is ignored", () => {
			expect(can(wearerWith(module, { remoteLevel: "Owner", remoteMemberIds: "111", remoteAccess: false }))).toBe(false);
			const junk = wearerWith(module, { remoteLevel: "Owner", remoteMemberIds: "abc, -5, 0, 111x, , 222" });
			expect(can(junk)).toBe(false);
			expect(can(junk, 222)).toBe(true);
		});

		it("a level that isn't one of ours falls back to owner only", () => {
			expect(can(wearerWith(module, { remoteLevel: "Everyone" }))).toBe(false);
			expect(can(wearerWith(module, { remoteLevel: undefined }))).toBe(false);
			expect(can(wearerWith(module, { remoteLevel: "Everyone" }), OWNER)).toBe(true);
		});

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
		it("collar: breathplay off shuts everyone out, the owner included, and the collar's maker gets in past the level when limited to the maker", () => {
			const collar = MODULES[1];
			const off = wearerWith(collar, { breathplayEnabled: false });
			expect(canRemoteCollar(off as never, who(OWNER) as never)).toBe(false);
			const crafted = wearerWith(collar, { remoteLevel: "Owner", limitToCrafted: true, collar: { name: "Choker", creator: SENDER } });
			expect(canRemoteCollar(crafted as never, who(SENDER) as never)).toBe(true);
			expect(canRemoteCollar(crafted as never, who(OTHER) as never)).toBe(false);
		});
	});

	describe.each(MODULES)("access levels: $name", module => {
		const STRANGER = 222, BLACKLISTED = 66, FRIEND = 70, DOMINANT = 80, WHITELISTED = 60, LOVER = 50;
		// Who gets in at each level, as a list of the senders above (the owner always does).
		const ALLOWED: Record<string, number[]> = {
			Public: [STRANGER, BLACKLISTED, FRIEND, DOMINANT, WHITELISTED, LOVER, OWNER],
			PublicExceptBlacklist: [STRANGER, FRIEND, DOMINANT, WHITELISTED, LOVER, OWNER],
			Friends: [FRIEND, WHITELISTED, LOVER, OWNER],
			Dominants: [DOMINANT, WHITELISTED, LOVER, OWNER],
			Whitelist: [WHITELISTED, LOVER, OWNER],
			Lovers: [LOVER, OWNER],
			Owner: [OWNER],
		};
		const realPlayer = globalThis.Player;

		beforeEach(() => {
			resetWorld({ MemberNumber: 5, LSCG: { GlobalModule: { enabled: true } } });
			addToRoom(makeCharacter({ MemberNumber: DOMINANT }));
			// BC's dominant reputation: the sender needs to be within 25 points of the wearer's
			g.ReputationCharacterGet = (c: { MemberNumber: number }) => c.MemberNumber === DOMINANT ? 100 : c.MemberNumber === 1 ? 50 : 0;
		});

		afterEach(() => { globalThis.Player = realPlayer; delete g.ReputationCharacterGet; });

		it.each(Object.keys(ALLOWED))("%s", level => {
			const wearer = wearerWith(module, { remoteLevel: level }, { WhiteList: [WHITELISTED], BlackList: [BLACKLISTED], LoverMemberNumber: [LOVER], FriendList: [FRIEND] } as never);
			(wearer as unknown as { IsPlayer: () => boolean }).IsPlayer = () => true;
			globalThis.Player = wearer as never; // "Friends" is the wearer's own client's call, so the wearer is the player
			for (const sender of [STRANGER, BLACKLISTED, FRIEND, DOMINANT, WHITELISTED, LOVER, OWNER])
				expect(module.can(wearer as never, who(sender) as never), `${level}: sender ${sender}`).toBe(ALLOWED[level].includes(sender));
		});
	});

	describe.each(MODULES)("global defaults: $name", module => {
		const GLOBAL = { enabled: true, remoteLevel: "Lovers", remoteMemberIds: "333" };
		const can = (wearer: FixtureCharacter, from = SENDER) => module.can(wearer as never, who(from) as never);
		/** A wearer whose own settings are wide open, with the global defaults strict, and `overrides` on the section. */
		const wearer = (overrides: Record<string, unknown> = {}, global: Record<string, unknown> = {}) => {
			const w = wearerWith(module, { remoteLevel: "Public", ...overrides });
			w.LSCG.GlobalModule = { ...GLOBAL, ...global } as never;
			return w;
		};

		it("a section that uses them ignores its own level and member ids", () => {
			const w = wearer({ useGlobalRemote: true, remoteMemberIds: "444" });
			expect(can(w)).toBe(false); // the section says Public, the defaults say Lovers
			expect(can(w, 444)).toBe(false); // its own list isn't in force
			expect(can(w, 333)).toBe(true); // the defaults' list is
			expect(can(w, OWNER)).toBe(true);
		});

		it("a section that doesn't, or doesn't say, keeps its own settings", () => {
			expect(can(wearer({ useGlobalRemote: false }))).toBe(true);
			expect(can(wearer({ useGlobalRemote: undefined }))).toBe(true); // a copy from an older client
			expect(can(wearer({ useGlobalRemote: "yes" }))).toBe(true); // only a real true counts
		});

		it("the defaults' level works like any section's", () => {
			const lover = makeCharacter({ MemberNumber: 50 });
			const w = wearer({ useGlobalRemote: true }, { remoteMemberIds: "" });
			w.LoverMemberNumber = [50];
			expect(module.can(w as never, lover as never)).toBe(true);
			expect(can(w)).toBe(false);
		});

		it("the trance rules are always the section's own, so a remote user's edits of them count", () => {
			const needsTrance = wearer({ useGlobalRemote: true, [module.tranceKey]: true }, { remoteLevel: "Public" });
			expect(can(needsTrance)).toBe(false);
			hypnotizedBy(needsTrance, OTHER);
			expect(can(needsTrance)).toBe(true);

			const noTrance = wearer({ useGlobalRemote: true, [module.tranceKey]: false }, { remoteLevel: "Public" });
			expect(can(noTrance)).toBe(true);

			const hypnotizerOnly = wearer({ useGlobalRemote: true, limitRemoteAccessToHypnotizer: true }, { remoteLevel: "Public" });
			hypnotizedBy(hypnotizerOnly, OTHER);
			expect(can(hypnotizerOnly)).toBe(false);
			hypnotizedBy(hypnotizerOnly, SENDER);
			expect(can(hypnotizerOnly)).toBe(true);
		});

		it("a global entry with trance fields has no say over them", () => {
			const w = wearer({ useGlobalRemote: true, [module.tranceKey]: false }, { remoteLevel: "Public", remoteAccessRequiredTrance: true, limitRemoteAccessToHypnotizer: true });
			expect(can(w)).toBe(true);
		});

		it("still needs the section's own remote access and enabled switches", () => {
			expect(can(wearer({ useGlobalRemote: true, remoteAccess: false }, { remoteLevel: "Public" }))).toBe(false);
			expect(can(wearer({ useGlobalRemote: true, enabled: false }, { remoteLevel: "Public" }))).toBe(false);
			expect(can(wearer({ useGlobalRemote: true, enabled: false }, { remoteLevel: "Public" }), OWNER)).toBe(true);
		});

		it("defaults nobody filled in are owner only", () => {
			const w = wearerWith(module, { useGlobalRemote: true, remoteLevel: "Public" });
			w.LSCG.GlobalModule = { enabled: true } as never;
			expect(can(w)).toBe(false);
			expect(can(w, OWNER)).toBe(true);
			w.LSCG.GlobalModule = { enabled: true, remoteLevel: "Public" } as never;
			expect(can(w)).toBe(true);
		});
	});

	describe("what each remote screen may change", () => {
		const hypnoWearer = () => wearerWith(MODULES[0]);

		it("never access itself, who may use it, or the lock without the wearer's say-so", () => {
			const forged = {
				remoteAccess: false, enabled: false, remoteLevel: "Public", remoteMemberIds: "111", overrideMemberIds: "111", allowedMembers: "111",
				lockable: true, allowLocked: true, locked: true,
			};
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

		it("the trance options are editable whether or not a section uses the global defaults, since they're always in force", () => {
			const trance = { remoteAccessRequiredTrance: true, limitRemoteAccessToHypnotizer: true };
			for (const useGlobalRemote of [true, false]) {
				expect(remoteHypnoChanges(wearerWith(MODULES[0], { useGlobalRemote }) as never, who(SENDER) as never, { ...trance, cooldownTime: 30 })).toEqual({ ...trance, cooldownTime: 30 });
				expect(remoteMagicChanges(wearerWith(MODULES[2], { useGlobalRemote }) as never, trance)).toEqual(trance);
			}
		});

		it("nor whether the section uses them, or the defaults themselves", () => {
			const forged = { useGlobalRemote: false, remoteLevel: "Public" };
			expect(remoteHypnoChanges(wearerWith(MODULES[0], { useGlobalRemote: true }) as never, who(SENDER) as never, forged)).toEqual({});
			expect(remoteCollarChanges(wearerWith(MODULES[1], { useGlobalRemote: true }) as never, forged)).toEqual({});
			expect(remoteMagicChanges(wearerWith(MODULES[2], { useGlobalRemote: true }) as never, forged)).toEqual({});
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
			Object.assign(hypno.settings, { enabled: true, remoteAccess: true, useGlobalRemote: false, remoteLevel: "Public", remoteAccessRequiredTrance: false });
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
