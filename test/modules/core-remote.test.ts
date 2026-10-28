// Command()'s "remote" case (core.ts): settings sent from another player's remote screens. The receiver checks the
// sender again with the same rules the screens use (Modules/remoteAccess.ts) -- remote access on, owner or allowed
// member or item permission, the trance and hypnotizer limits -- since a sender needn't go through the screens at
// all, and takes only the settings those screens show: never remote access itself, who may use it, or anything else
// the wearer keeps to themselves.
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { HypnoModule } from "Modules/hypno";
import { CollarModule } from "Modules/collar";
import { MagicModule } from "Modules/magic";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { boot, resetWorld, addToRoom, player } from "../harness/world";
import { receive, sent } from "../harness/room";
import { makeCharacter, type FixtureCharacter } from "../harness/fixtures";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

describe("CoreModule remote-settings receiver (Command() \"remote\")", () => {
	let hypno: HypnoModule;
	let collar: CollarModule;
	let magic: MagicModule;
	let sender: FixtureCharacter;

	beforeAll(() => {
		[, , , hypno, collar, magic] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new HypnoModule(), new CollarModule(), new MagicModule());
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true }, StateModule: { states: [] } } });
		hypno.init();
		collar.init();
		magic.init();
		// Open to remote access by anyone item permissions allow, with no trance requirement
		Object.assign(hypno.settings, { enabled: true, remoteAccess: true, remoteAccessRequiredTrance: false, limitRemoteAccessToHypnotizer: false, overrideMemberIds: "" });
		Object.assign(collar.settings, { enabled: true, remoteAccess: true, breathplayEnabled: true, allowedMembers: "", limitToCrafted: false });
		Object.assign(magic.settings, { enabled: true, remoteAccess: true, remoteAccessRequiredTrance: false, limitRemoteAccessToHypnotizer: false, remoteMemberIds: "" });
		sender = addToRoom(makeCharacter({ MemberNumber: 111, Nickname: "Kai" }));
	});

	function sendRemote(from: FixtureCharacter, settings: Record<string, unknown>) {
		receive.hidden(from, {
			IsLSCG: true, type: "command", reply: false, target: player().MemberNumber,
			version: "v0", settings, command: { name: "remote", args: [] },
		} as unknown as LSCGMessageModel);
	}

	const hypnotizedBy = (memberNumber: number) => { player().LSCG.StateModule.states = [{ type: "hypnotized", active: true, activatedBy: memberNumber, extensions: {} }]; };

	describe("hypnosis", () => {
		it("applies the screen's settings for an allowed sender, and tells the player", () => {
			sendRemote(sender, { HypnoModule: { overrideWords: "sleepy", cooldownTime: 30 } });
			expect(hypno.settings.overrideWords).toBe("sleepy");
			expect(hypno.settings.cooldownTime).toBe(30);
			expect(sent.local().at(-1)).toContain("Kai has accessed your remote settings");
		});

		it("needs hypnosis and remote access on", () => {
			hypno.settings.enabled = false;
			sendRemote(sender, { HypnoModule: { overrideWords: "sleepy" } });
			hypno.settings.enabled = true;
			hypno.settings.remoteAccess = false;
			sendRemote(sender, { HypnoModule: { overrideWords: "sleepy" } });
			expect(hypno.settings.overrideWords).not.toBe("sleepy");
			expect(sent.local()).toEqual([]);
		});

		it("needs item permission, or to be on the allowed list when there is one", () => {
			g.ServerChatRoomGetAllowItem.mockReturnValueOnce(false);
			sendRemote(sender, { HypnoModule: { overrideWords: "a" } });
			expect(hypno.settings.overrideWords).not.toBe("a");
			hypno.settings.overrideMemberIds = "999";
			sendRemote(sender, { HypnoModule: { overrideWords: "b" } });
			expect(hypno.settings.overrideWords).not.toBe("b");
			hypno.settings.overrideMemberIds = "999, 111";
			sendRemote(sender, { HypnoModule: { overrideWords: "c" } });
			expect(hypno.settings.overrideWords).toBe("c");
		});

		it("respects the trance and hypnotizer limits", () => {
			hypno.settings.remoteAccessRequiredTrance = true;
			sendRemote(sender, { HypnoModule: { overrideWords: "a" } });
			expect(hypno.settings.overrideWords).not.toBe("a");
			hypno.settings.limitRemoteAccessToHypnotizer = true;
			hypnotizedBy(222);
			sendRemote(sender, { HypnoModule: { overrideWords: "b" } });
			expect(hypno.settings.overrideWords).not.toBe("b");
			hypnotizedBy(111);
			sendRemote(sender, { HypnoModule: { overrideWords: "c" } });
			expect(hypno.settings.overrideWords).toBe("c");
		});

		it("an owner gets in past the other limits, but still needs remote access on", () => {
			player().OwnerMemberNumber = 111;
			hypno.settings.enabled = false;
			hypno.settings.overrideMemberIds = "999";
			sendRemote(sender, { HypnoModule: { overrideWords: "owner" } });
			expect(hypno.settings.overrideWords).toBe("owner");
			hypno.settings.remoteAccess = false;
			sendRemote(sender, { HypnoModule: { overrideWords: "again" } });
			expect(hypno.settings.overrideWords).toBe("owner");
		});

		it("never takes settings the screen doesn't offer", () => {
			sendRemote(sender, { HypnoModule: { remoteAccess: false, enabled: false, trigger: "chosen", allowLocked: true, stats: {}, overrideWords: "ok" } });
			expect(hypno.settings).toMatchObject({ remoteAccess: true, enabled: true, overrideWords: "ok" });
			expect(hypno.settings.trigger).not.toBe("chosen");
			expect(hypno.settings.allowLocked).not.toBe(true);
		});

		it("the member list and the lock only change when the wearer allows it", () => {
			sendRemote(sender, { HypnoModule: { overrideMemberIds: "111", locked: true } });
			expect(hypno.settings.overrideMemberIds).toBe("");
			expect(hypno.settings.locked).not.toBe(true);
			Object.assign(hypno.settings, { allowRemoteModificationOfMemberOverride: true, allowLocked: true });
			sendRemote(sender, { HypnoModule: { overrideMemberIds: "111", locked: true } });
			expect(hypno.settings).toMatchObject({ overrideMemberIds: "111", locked: true });
		});

		it("ignores values of the wrong kind", () => {
			sendRemote(sender, { HypnoModule: { cooldownTime: "<b>5</b>", enableCycle: "yes", overrideWords: 42 } });
			expect(hypno.settings.cooldownTime).not.toBe("<b>5</b>");
			expect(hypno.settings.enableCycle).not.toBe("yes");
			expect(hypno.settings.overrideWords).not.toBe(42);
		});
	});

	describe("collar", () => {
		it("applies the screen's settings for an allowed sender", () => {
			sendRemote(sender, { CollarModule: { tightTrigger: "squeeze", collar: { name: "Choker", creator: 111, extra: "x" } } });
			expect(collar.settings.tightTrigger).toBe("squeeze");
			expect(collar.settings.collar).toEqual({ name: "Choker", creator: 111 });
		});

		it("needs remote access on, even from the owner", () => {
			player().OwnerMemberNumber = 111;
			collar.settings.remoteAccess = false;
			sendRemote(sender, { CollarModule: { tightTrigger: "squeeze" } });
			expect(collar.settings.tightTrigger).not.toBe("squeeze");
		});

		it("only from the allowed members, or the collar's maker when limited to it", () => {
			collar.settings.allowedMembers = "999";
			sendRemote(sender, { CollarModule: { tightTrigger: "a" } });
			expect(collar.settings.tightTrigger).not.toBe("a");
			Object.assign(collar.settings, { limitToCrafted: true, collar: { name: "Choker", creator: 111 } });
			sendRemote(sender, { CollarModule: { tightTrigger: "b" } });
			expect(collar.settings.tightTrigger).toBe("b");
		});

		it("never opts the player into breathplay, nor touches a collar whose breathplay is off", () => {
			sendRemote(sender, { CollarModule: { breathplayEnabled: false, remoteAccess: false, chokeLevel: 4 } });
			expect(collar.settings).toMatchObject({ breathplayEnabled: true, remoteAccess: true });
			expect(collar.settings.chokeLevel).not.toBe(4);
			collar.settings.breathplayEnabled = false;
			sendRemote(sender, { CollarModule: { breathplayEnabled: true, tightTrigger: "squeeze" } });
			expect(collar.settings.breathplayEnabled).toBe(false);
			expect(collar.settings.tightTrigger).not.toBe("squeeze");
		});

		it("locks only when lockable", () => {
			sendRemote(sender, { CollarModule: { locked: true } });
			expect(collar.settings.locked).toBe(false);
			collar.settings.lockable = true;
			sendRemote(sender, { CollarModule: { locked: true } });
			expect(collar.settings.locked).toBe(true);
		});
	});

	describe("magic", () => {
		it("applies the screen's settings, never who may cast or whether remote access is on", () => {
			magic.settings.knownSpells = [{ Name: "Mine" }] as never;
			sendRemote(sender, { MagicModule: { neverDefend: true, blockedSpellEffects: ["blind"], requireWhitelist: false, remoteAccess: false, remoteMemberIds: "111", knownSpells: [] } });
			expect(magic.settings).toMatchObject({ neverDefend: true, blockedSpellEffects: ["blind"], remoteAccess: true, remoteMemberIds: "" });
			expect(magic.settings.knownSpells).toEqual([{ Name: "Mine" }]);
		});

		it("only from the allowed members when there's a list, and not while magic is off", () => {
			magic.settings.remoteMemberIds = "999";
			sendRemote(sender, { MagicModule: { neverDefend: true } });
			expect(magic.settings.neverDefend).not.toBe(true);
			magic.settings.remoteMemberIds = "";
			magic.settings.enabled = false;
			sendRemote(sender, { MagicModule: { neverDefend: true } });
			expect(magic.settings.neverDefend).not.toBe(true);
		});

		it("a list of effects must be a list of names", () => {
			sendRemote(sender, { MagicModule: { blockedSpellEffects: [{ evil: true }] } });
			expect(magic.settings.blockedSpellEffects).not.toEqual([{ evil: true }]);
		});

		describe("locked spell effects", () => {
			it("an allowed sender locks effects the player can then no longer cast", () => {
				sendRemote(sender, { MagicModule: { lockedSpellEffects: ["Deafening"] } });
				expect(magic.settings.lockedSpellEffects).toEqual(["Deafening"]);
				sendRemote(sender, { MagicModule: { lockedSpellEffects: [] } });
				expect(magic.settings.lockedSpellEffects).toEqual([]);
			});

			it("follows the same access rules as the other magic settings", () => {
				magic.settings.remoteAccess = false;
				sendRemote(sender, { MagicModule: { lockedSpellEffects: ["Deafening"] } });
				magic.settings.remoteAccess = true;
				magic.settings.remoteMemberIds = "999";
				sendRemote(sender, { MagicModule: { lockedSpellEffects: ["Deafening"] } });
				magic.settings.remoteMemberIds = "";
				magic.settings.remoteAccessRequiredTrance = true;
				sendRemote(sender, { MagicModule: { lockedSpellEffects: ["Deafening"] } });
				expect(magic.settings.lockedSpellEffects).toEqual([]);
				hypnotizedBy(111);
				sendRemote(sender, { MagicModule: { lockedSpellEffects: ["Deafening"] } });
				expect(magic.settings.lockedSpellEffects).toEqual(["Deafening"]);
			});

			it("a list of effects must be a list of names", () => {
				sendRemote(sender, { MagicModule: { lockedSpellEffects: [{ evil: true }, 5] } });
				sendRemote(sender, { MagicModule: { lockedSpellEffects: "Deafening" } });
				expect(magic.settings.lockedSpellEffects).toEqual([]);
			});

			it("the player's own blocked list is a separate list", () => {
				sendRemote(sender, { MagicModule: { lockedSpellEffects: ["Deafening"], blockedSpellEffects: ["Blinding"] } });
				expect(magic.settings).toMatchObject({ lockedSpellEffects: ["Deafening"], blockedSpellEffects: ["Blinding"] });
			});
		});
	});

	it("does nothing for a sender who isn't in the room", () => {
		const elsewhere = makeCharacter({ MemberNumber: 555 });
		sendRemote(elsewhere, { HypnoModule: { overrideWords: "far" } });
		expect(hypno.settings.overrideWords).not.toBe("far");
		expect(sent.local()).toEqual([]);
		vi.restoreAllMocks();
	});
});
