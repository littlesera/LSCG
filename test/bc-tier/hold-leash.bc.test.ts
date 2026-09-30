// LSCG's Hold Leash and Let Go Of Leash activities copy the game's own dialog options, so they should be
// offered exactly when ChatRoomCanHoldLeash/ChatRoomCanStopHoldLeash say so, on real BC characters and leashes.
//
// The game's checks run in the BC realm and read its CurrentCharacter and ChatRoomLeashList, while
// LeashingModule reads ours, so held() sets the list on both sides. Both Let Go checks drop a leash that
// can't be held any more, which is compared too.
import { beforeEach, describe, expect, it } from "vitest";
import { LeashingModule } from "Modules/leashing";
import { evalInBcRealm } from "../harness/bc-loader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;
const leashing = new LeashingModule();

function findAsset(group: string, name: string): Asset {
	const found = (g.Asset as Asset[]).find(a => a.Group.Name === group && a.Name === name);
	if (!found) throw new Error(`Expected real BC Asset "${group}:${name}" to exist -- has it been renamed in a newer client?`);
	return found;
}

function makeCharacter(memberNumber: number): Character {
	const C = g.CharacterCreate("Female3DCG", g.CharacterType.ONLINE, memberNumber);
	C.MemberNumber = memberNumber;
	C.OnlineSharedSettings = { AllowPlayerLeashing: true };
	return C;
}

function wear(C: Character, groupName: string, assetName: string): void {
	const asset = findAsset(groupName, assetName);
	(C as never as { Appearance: { Asset: Asset; Property: object }[] }).Appearance.push({ Asset: asset, Property: {} });
	C.Effect = g.CharacterGetEffects(C);
}

function leashed(memberNumber: number): Character {
	const C = makeCharacter(memberNumber);
	wear(C, "ItemNeckRestraints", "CollarLeash");
	return C;
}

function held(...memberNumbers: number[]): void {
	evalInBcRealm(`ChatRoomLeashList = ${JSON.stringify(memberNumbers)};`);
	g.ChatRoomLeashList = [...memberNumbers];
}

// [offered Hold, offered Let Go, still on the held list afterwards], from the game's dialog and from us
function offers(C: Character) {
	g.jsdom.window.holdLeashTarget = C;
	const game = evalInBcRealm<boolean[]>(`(() => {
		CurrentCharacter = holdLeashTarget;
		// What the dialog asks the server for when it opens
		CurrentCharacter.AllowItem = ServerChatRoomGetAllowItem(Player, CurrentCharacter);
		const offered = [ChatRoomCanHoldLeash(), ChatRoomCanStopHoldLeash(), ChatRoomLeashList.includes(CurrentCharacter.MemberNumber)];
		CurrentCharacter = null;
		return offered;
	})()`);
	const ours = [leashing.CanHoldLeash(C), leashing.CanLetGoOfLeash(C), g.ChatRoomLeashList.includes(C.MemberNumber)];
	return { game, ours };
}

describe("Hold Leash and Let Go Of Leash match the game's dialog options (real BC data)", () => {
	beforeEach(() => {
		g.Player.Appearance = [];
		g.Player.Effect = [];
		evalInBcRealm(`
			globalThis.AsylumGGTSGetLevel = function() { return 0; };
			globalThis.PrivateCharacter = [];
			ChatRoomData = null;
		`);
		held();
	});

	it("someone free with a leash on can be held", () => {
		const C = leashed(2);
		expect(offers(C)).toEqual({ game: [true, false, false], ours: [true, false, false] });
	});

	it("a leash we hold can be let go, not held again", () => {
		const C = leashed(2);
		held(2);
		expect(offers(C)).toEqual({ game: [false, true, true], ours: [false, true, true] });
	});

	it("holding one leash doesn't stop us holding another", () => {
		const C = leashed(2);
		held(3);
		expect(offers(C)).toEqual({ game: [true, false, false], ours: [true, false, false] });
	});

	it("nothing without a leash on", () => {
		const C = makeCharacter(2);
		wear(C, "ItemNeck", "LeatherCollar");
		expect(offers(C)).toEqual({ game: [false, false, false], ours: [false, false, false] });
	});

	it("nothing once they've turned leashing off, but we keep hold until it's fixed", () => {
		const C = leashed(2);
		C.OnlineSharedSettings = { AllowPlayerLeashing: false } as never;
		held(2);
		expect(offers(C)).toEqual({ game: [false, false, true], ours: [false, false, true] });
	});

	it("nothing while our hands are bound", () => {
		const C = leashed(2);
		wear(g.Player, "ItemArms", "LeatherArmbinder");
		held(2);
		expect(offers(C)).toEqual({ game: [false, false, true], ours: [false, false, true] });
	});

	it("nothing without item permission on them", () => {
		const C = leashed(2);
		C.AllowedInteractions = g.AllowedInteractions.OwnerOnly;
		held(2);
		expect(offers(C)).toEqual({ game: [false, false, true], ours: [false, false, true] });
	});

	it("a held leash that's come off drops off the list", () => {
		const C = makeCharacter(2);
		held(2);
		expect(offers(C)).toEqual({ game: [false, false, false], ours: [false, false, false] });
	});

	it("nothing in a room that blocks leashing", () => {
		const C = leashed(2);
		evalInBcRealm(`ChatRoomData = { BlockCategory: ["Leashing"] };`);
		expect(offers(C)).toEqual({ game: [false, false, false], ours: [false, false, false] });
	});
});
