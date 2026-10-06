// forceOrgasm (the Forced Orgasm effect, the cum command and speech reactions) hands off to BC's own ActivityOrgasmPrepare, so BC's denial and edging
// rules decide what happens. Checked against the real thing: a player in denial mode or edged is held at the edge and no orgasm starts, while anyone
// else has the orgasm begin (which they can then resist or surrender to).
import { beforeEach, describe, expect, it } from "vitest";
import { forceOrgasm } from "utils";
import { evalInBcRealm } from "../harness/bc-loader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

describe("forceOrgasm against real BC", () => {
	let player: Character;

	beforeEach(() => {
		evalInBcRealm(`
			globalThis.ServerPlayerIsInChatRoom = function() { return false; };
			globalThis.ActivityChatRoomArousalSync = function() {};
			globalThis.DialogLeave = function() {};
			globalThis.CurrentTime = Date.now();
			// The edging check reads BC's own Player, so the player has to be set there
			Player = CharacterCreate("Female3DCG", CharacterType.PLAYER, 1);
		`);
		player = g.Player;
		player.ArousalSettings = { Active: "Automatic", Visible: "Access", ShowOtherMeter: true, AffectExpression: true, AffectStutter: "All", VFX: "VFXInactive", VFXVibrator: "VFXVibratorSolid", VFXFilter: "VFXFilterLight", Progress: 0, ProgressTimer: 0, VibratorLevel: 0, ChangeTime: 0, Activity: [], Zone: [], Fetish: [], OrgasmTimer: 0, OrgasmStage: 0, OrgasmCount: 0 } as never;
		player.Effect = [];
	});

	const underway = () => (player.ArousalSettings?.OrgasmTimer ?? 0) > 0;

	it("starts the orgasm for an ordinary player", () => {
		forceOrgasm();
		expect(player.ArousalSettings!.Progress).toBe(100);
		expect(underway()).toBe(true);
	});

	it("holds a player in denial mode at the edge, with no orgasm started", () => {
		player.Effect = ["DenialMode"];
		forceOrgasm();
		expect(player.ArousalSettings!.Progress).toBe(99);
		expect(underway()).toBe(false);
	});

	it("holds a player wearing a crafted item with the Edging property just short, with no orgasm started", () => {
		(player as never as { Appearance: unknown[] }).Appearance.push({ Asset: (g.Asset as { Name: string; Group: { Name: string } }[]).find(a => a.Group.Name === "ItemHandheld") ?? { Name: "x", Group: { Name: "ItemHandheld" } }, Property: {}, Craft: { Effects: { Edging: 1 } } });
		forceOrgasm();
		expect(player.ArousalSettings!.Progress).toBe(95);
		expect(underway()).toBe(false);
	});

	it("denial mode takes priority over edging", () => {
		player.Effect = ["DenialMode"];
		(player as never as { Appearance: unknown[] }).Appearance.push({ Asset: { Name: "x", Group: { Name: "ItemHandheld" } }, Property: {}, Craft: { Effects: { Edging: 1 } } });
		forceOrgasm();
		expect(player.ArousalSettings!.Progress).toBe(99);
		expect(underway()).toBe(false);
	});
});
