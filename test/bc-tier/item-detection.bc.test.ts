// Item-detection/permission functions whose real behavior depends on real BC prerequisite
// logic or the real ServerChatRoomGetAllowItem permission ladder -- not just an asset/craft
// name match a fake-tier fixture can already stand in for (those are covered in
// test/modules/splatter-reactions.test.ts and test/modules/magic.test.ts). Specifically:
// SplatterModule.canGiveSplat's "naked" check goes through the real InventoryPrerequisiteMessage
// AccessCrotch prerequisite (Scripts/Inventory.js), and MagicModule.CanUseMagic's permission
// check goes through the real ServerChatRoomGetAllowItem (Scripts/Server.js) -- both need real
// BC semantics to be meaningfully exercised, which is exactly what the "bc" tier is for.
import { beforeEach, describe, expect, it } from "vitest";
import { registerModule } from "modules";
import { CoreModule } from "Modules/core";
import { SplatterModule } from "Modules/splatter";
import { MagicModule } from "Modules/magic";
import { evalInBcRealm } from "../harness/bc-loader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

function findAsset(group: string, name: string): Asset {
	const found = (g.Asset as Asset[]).find(a => a.Group.Name === group && a.Name === name);
	if (!found) throw new Error(`Expected real BC Asset "${group}:${name}" to exist -- has it been renamed in a newer client?`);
	return found;
}

function makeCharacter(memberNumber: number): Character {
	const C = g.CharacterCreate("Female3DCG", g.CharacterType.ONLINE, memberNumber);
	C.MemberNumber = memberNumber;
	return C;
}

describe("item-detection functions needing real BC prerequisite/permission logic", () => {
	beforeEach(() => {
		evalInBcRealm(`
			globalThis.AsylumGGTSGetLevel = function() { return 0; };
			globalThis.PrivateCharacter = [];
		`);
	});

	describe("SplatterModule.canGiveSplat", () => {
		let splatter: SplatterModule;

		beforeEach(() => {
			registerModule(new CoreModule());
			splatter = registerModule(new SplatterModule());
			splatter.settings.minArousal = 90;
		});

		function actor(arousal: number): Character {
			const C = makeCharacter(2);
			(C as never as { LSCG: unknown }).LSCG = { SplatterModule: { enabled: true, giver: true } };
			(C as never as { ArousalSettings: unknown }).ArousalSettings = { Progress: arousal };
			return C;
		}

		it("a naked, sufficiently aroused, giver-enabled character can give a splat", () => {
			const C = actor(95);
			expect(splatter.canGiveSplat(C)).toBe(true);
		});

		it("a character wearing panties (blocking crotch access) cannot give a splat", () => {
			const C = actor(95);
			const panties = findAsset("Panties", "Panties1");
			(C as never as { Appearance: { Asset: Asset; Property: object }[] }).Appearance.push({ Asset: panties, Property: {} });
			C.Effect = g.CharacterGetEffects(C);
			expect(splatter.canGiveSplat(C)).toBe(false);
		});

		it("insufficient arousal blocks giving even when naked", () => {
			const C = actor(50);
			expect(splatter.canGiveSplat(C)).toBe(false);
		});

		it("giver disabled in LSCG settings blocks giving even when naked and aroused", () => {
			const C = actor(95);
			(C as never as { LSCG: { SplatterModule: { giver: boolean } } }).LSCG.SplatterModule.giver = false;
			expect(splatter.canGiveSplat(C)).toBe(false);
		});
	});

	describe("MagicModule.CanUseMagic (real ServerChatRoomGetAllowItem permission ladder)", () => {
		let magic: MagicModule;

		beforeEach(() => {
			magic = registerModule(new MagicModule());
			magic.settings.enabled = true;
			// CanCastSpell (reached via CanUseMagic) requires at least one known spell;
			// without one, CanUseMagic is false regardless of the permission ladder below.
			magic.settings.knownSpells = [{ name: "frost bolt" } as never];
			// BaseModule.Enabled (magic.ts's Enabled calls super.Enabled) requires
			// Player.LSCG.GlobalModule.enabled and ServerPlayerIsInChatRoom() -- neither
			// is true by default on a freshly created real Player (bc-globals.ts only sets
			// Player.LSCG = {}). ServerPlayerIsInChatRoom's real implementation depends on
			// full real chat-room join state this harness doesn't simulate, so it's
			// overridden directly here (the same "true" default bc-lite.ts uses for the
			// fake tier).
			g.Player.LSCG.GlobalModule = { enabled: true };
			g.ServerPlayerIsInChatRoom = () => true;
			g.Player.AllowedInteractions = 0; // Everyone
			g.Player.WhiteList = [];
			g.Player.Ownership = undefined;
			g.Player.Lovership = [];
		});

		function target(): Character {
			const C = makeCharacter(2);
			(C as never as { LSCG: unknown }).LSCG = { MagicModule: { enabled: true, requireWhitelist: false } };
			(C as never as { WhiteList: number[] }).WhiteList = [];
			return C;
		}

		it("allows use when the target's MagicModule is enabled and the real permission check passes", () => {
			const C = target();
			expect(magic.CanUseMagic(C, false, false)).toBe(true);
		});

		it("blocks use when the target's AllowedInteractions level rejects the caster", () => {
			// ServerChatRoomGetAllowItem(Source=Player, Target=C) is gated on the TARGET's
			// own AllowedInteractions -- Player.AllowedInteractions is irrelevant here.
			const C = target();
			C.AllowedInteractions = 4; // OwnerLoversOnly -- Player isn't a lover of C
			expect(magic.CanUseMagic(C, false, false)).toBe(false);
		});

		it("a lover passes a stricter AllowedInteractions level", () => {
			// Level 4's check is Source.IsLoverOfCharacter(Target) i.e. Player.IsLoverOfCharacter(C)
			// -- Player.Lovership (not C's) is what needs to list C as a lover.
			const C = target();
			C.AllowedInteractions = 4; // OwnerLoversOnly
			g.Player.Lovership = [{ MemberNumber: C.MemberNumber }];
			expect(magic.CanUseMagic(C, false, false)).toBe(true);
		});

		it("blocks use when the target's own MagicModule is disabled, even if the permission check would pass", () => {
			const C = target();
			(C as never as { LSCG: { MagicModule: { enabled: boolean } } }).LSCG.MagicModule.enabled = false;
			expect(magic.CanUseMagic(C, false, false)).toBe(false);
		});
	});
});
