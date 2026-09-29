// isAllowedMember/hasRemotePermission (member-permission gates) and IsIncapacitated/
// IsActivityAllowed (LSCG state-shape logic gated behind a member-permission check) against
// real BC Character objects. isAllowedMember in particular delegates straight to the real
// ServerChatRoomGetAllowItem (Scripts/Server.js), which reads real AllowedInteractions
// levels plus real IsOwnedByCharacter/IsLoverOfCharacter/HasOnBlacklist/HasOnWhitelist --
// exactly the kind of real-permission-ladder logic this "bc" tier exists to exercise
// against actual BC objects rather than hand-rolled fixture stand-ins.
import { beforeEach, describe, expect, it } from "vitest";
import { hasRemotePermission, IsActivityAllowed, isAllowedMember, IsIncapacitated } from "utils";
import type { ActivityEntryModel } from "Settings/Models/activities";
import { evalInBcRealm } from "../harness/bc-loader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

function makeCharacter(memberNumber: number): Character {
	const C = g.CharacterCreate("Female3DCG", g.CharacterType.ONLINE, memberNumber);
	C.MemberNumber = memberNumber;
	return C;
}

function activity(overrides: Partial<ActivityEntryModel> = {}): ActivityEntryModel {
	return {
		name: "Test", group: "ItemMouth", hypno: false, sleep: false, hypnoThreshold: 0,
		hypnoRequiredRepeats: 0, orgasm: false, orgasmThreshold: 0, awakener: false,
		allowedMemberIds: [],
		...overrides,
	};
}

describe("member-permission gates (real BC data)", () => {
	beforeEach(() => {
		// AllowedInteractions.Everyone === 0, BC's own default -- explicit here so each
		// test's AllowedInteractions override is unambiguous against the real enum.
		g.Player.AllowedInteractions = 0;
		g.Player.WhiteList = [];
		g.Player.BlackList = [];
		// A prior test setting Player.Ownership/Lovership (e.g. the "own owner" isAllowedMember
		// case) would otherwise leak into every later test in this file via the shared real
		// Player object -- reset explicitly rather than relying on bc-globals.ts's once-per-file
		// Player creation.
		g.Player.Ownership = undefined;
		g.Player.Lovership = [];
		// IsOwned()'s AsylumGGTSGetLevel() fallback and IsOwned()'s PrivateCharacter walk
		// (for the "player" case) both come from Asylum.js/NPC.js, neither loaded by this
		// harness's sparse checkout -- see locks.bc.test.ts for the fuller explanation.
		// These live as bare `var`s in the real BC vm realm, so evalInBcRealm is required.
		evalInBcRealm(`
			globalThis.AsylumGGTSGetLevel = function() { return 0; };
			globalThis.PrivateCharacter = [];
		`);
	});

	describe("isAllowedMember (delegates to real ServerChatRoomGetAllowItem)", () => {
		it("returns false for undefined", () => {
			expect(isAllowedMember(undefined)).toBe(false);
		});

		it("Everyone level allows any real character", () => {
			const stranger = makeCharacter(2);
			expect(isAllowedMember(stranger)).toBe(true);
		});

		it("EveryoneExceptBlacklist blocks a blacklisted member and allows everyone else", () => {
			g.Player.AllowedInteractions = 1; // EveryoneExceptBlacklist
			const blacklisted = makeCharacter(2);
			const other = makeCharacter(3);
			g.Player.BlackList = [2];
			expect(isAllowedMember(blacklisted)).toBe(false);
			expect(isAllowedMember(other)).toBe(true);
		});

		it("OwnerLoversWhitelistOnly allows a whitelisted member and a lover, blocks a stranger", () => {
			g.Player.AllowedInteractions = 3; // OwnerLoversWhitelistOnly
			const whitelisted = makeCharacter(2);
			const lover = makeCharacter(3);
			const stranger = makeCharacter(4);
			g.Player.WhiteList = [2];
			lover.Lovership = [{ MemberNumber: g.Player.MemberNumber } as never];
			expect(isAllowedMember(whitelisted)).toBe(true);
			expect(isAllowedMember(lover)).toBe(true);
			expect(isAllowedMember(stranger)).toBe(false);
		});

		it("OwnerLoversOnly allows only a lover", () => {
			g.Player.AllowedInteractions = 4; // OwnerLoversOnly
			const lover = makeCharacter(2);
			const whitelistedNonLover = makeCharacter(3);
			g.Player.WhiteList = [3];
			lover.Lovership = [{ MemberNumber: g.Player.MemberNumber } as never];
			expect(isAllowedMember(lover)).toBe(true);
			expect(isAllowedMember(whitelistedNonLover)).toBe(false);
		});

		it("the member's own owner is always allowed, regardless of level", () => {
			g.Player.AllowedInteractions = 4; // OwnerLoversOnly -- strictest level this ladder reaches
			const owner = makeCharacter(2);
			g.Player.Ownership = { MemberNumber: 2, Stage: 1 };
			expect(isAllowedMember(owner)).toBe(true);
		});

		it("sending to yourself is always allowed", () => {
			g.Player.AllowedInteractions = 4;
			expect(isAllowedMember(g.Player)).toBe(true);
		});
	});

	describe("hasRemotePermission", () => {
		it("the wearer's owner passes every level", () => {
			const wearer = makeCharacter(2);
			wearer.Ownership = { MemberNumber: 1, Stage: 1 } as never;
			expect(hasRemotePermission(wearer, "Owner", 1)).toBe(true);
			expect(hasRemotePermission(wearer, "Public", 1)).toBe(true);
		});

		it("Owner level rejects a non-owner even if they're a lover", () => {
			const wearer = makeCharacter(2);
			wearer.Lovership = [{ MemberNumber: 1 } as never];
			expect(hasRemotePermission(wearer, "Owner", 1)).toBe(false);
		});

		it("Lovers level accepts a lover, rejects a stranger", () => {
			const wearer = makeCharacter(2);
			wearer.Lovership = [{ MemberNumber: 1 } as never];
			expect(hasRemotePermission(wearer, "Lovers", 1)).toBe(true);
			expect(hasRemotePermission(wearer, "Lovers", 99)).toBe(false);
		});

		it("Whitelist level accepts a whitelisted member", () => {
			const wearer = makeCharacter(2);
			wearer.WhiteList = [5];
			expect(hasRemotePermission(wearer, "Whitelist", 5)).toBe(true);
			expect(hasRemotePermission(wearer, "Whitelist", 6)).toBe(false);
		});

		it("PublicExceptBlacklist rejects only a blacklisted member", () => {
			const wearer = makeCharacter(2);
			wearer.BlackList = [7];
			expect(hasRemotePermission(wearer, "PublicExceptBlacklist", 7)).toBe(false);
			expect(hasRemotePermission(wearer, "PublicExceptBlacklist", 8)).toBe(true);
		});

		it("Public level accepts anyone", () => {
			const wearer = makeCharacter(2);
			expect(hasRemotePermission(wearer, "Public", 12345)).toBe(true);
		});
	});

	describe("IsIncapacitated", () => {
		it("defaults to Player when no character is given, and is false with no LSCG state", () => {
			g.Player.LSCG = {};
			expect(IsIncapacitated()).toBe(false);
		});

		it("is true when the StateModule has an active 'hypnotized' state", () => {
			const C = makeCharacter(2);
			(C as never as { LSCG: unknown }).LSCG = { StateModule: { states: [{ type: "hypnotized", active: true }] } };
			expect(IsIncapacitated(C as never)).toBe(true);
		});

		it("is false when the matching state exists but is inactive", () => {
			const C = makeCharacter(2);
			(C as never as { LSCG: unknown }).LSCG = { StateModule: { states: [{ type: "asleep", active: false }] } };
			expect(IsIncapacitated(C as never)).toBe(false);
		});

		it("is true via the legacy HypnoModule/InjectorModule fallback when StateModule is absent", () => {
			const C = makeCharacter(2);
			(C as never as { LSCG: unknown }).LSCG = {
				HypnoModule: { hypnotized: true },
				InjectorModule: { brainwashed: false, asleep: false },
			};
			expect(IsIncapacitated(C as never)).toBe(true);
		});
	});

	describe("IsActivityAllowed", () => {
		it("returns false with no sender or no activity", () => {
			const sender = makeCharacter(2);
			expect(IsActivityAllowed(undefined as never, sender)).toBe(false);
			expect(IsActivityAllowed(activity(), undefined as never)).toBe(false);
		});

		it("an empty allowedMemberIds list falls back to isAllowedMember (real ServerChatRoomGetAllowItem)", () => {
			g.Player.AllowedInteractions = 1; // EveryoneExceptBlacklist
			const blacklisted = makeCharacter(2);
			g.Player.BlackList = [2];
			expect(IsActivityAllowed(activity({ allowedMemberIds: [] }), blacklisted)).toBe(false);

			const other = makeCharacter(3);
			expect(IsActivityAllowed(activity({ allowedMemberIds: [] }), other)).toBe(true);
		});

		it("a non-empty allowedMemberIds list only allows a listed sender, bypassing isAllowedMember entirely", () => {
			g.Player.AllowedInteractions = 4; // OwnerLoversOnly -- would reject a non-lover via isAllowedMember
			const listed = makeCharacter(2);
			const unlisted = makeCharacter(3);
			expect(IsActivityAllowed(activity({ allowedMemberIds: [2] }), listed)).toBe(true);
			expect(IsActivityAllowed(activity({ allowedMemberIds: [2] }), unlisted)).toBe(false);
		});
	});
});
