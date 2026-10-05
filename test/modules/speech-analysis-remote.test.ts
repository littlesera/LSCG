// SpeechAnalysisModule's remote-configuration receiver ("speech-settings-set" /
// "speech-settings-get" CoreModule commands): the permission ladder gating who can
// remotely tune the wearer's detectors/thresholds/reactions, sanitization of what a
// remote sender can send, and the private-phrase-group visibility rules layered on
// top. Ported from the pre-Vitest standalone suite (test/speech-analysis/test.ts,
// now removed), driven here through the real CoreModule command dispatch (receive.
// command()) rather than calling the registered listener's func directly.
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CoreModule } from "Modules/core";
import { HypnoModule } from "Modules/hypno";
import { StateModule } from "Modules/states";
import { SpeechAnalysisModule } from "Modules/speech-analysis";
import { defaultSpeechPublicSettings } from "Settings/Models/speech-analysis";
import { boot, resetWorld, addToRoom, currentBcLite } from "../harness/world";
import { makeCharacter, type FixtureCharacter } from "../harness/fixtures";
import { receive, sent } from "../harness/room";

describe("SpeechAnalysisModule remote configuration + hidden phrases", () => {
	let speech: SpeechAnalysisModule;
	let states: StateModule;

	beforeAll(() => {
		[, , states, speech] = boot(new CoreModule(), new HypnoModule(), new StateModule(), new SpeechAnalysisModule());
	});

	beforeEach(() => {
		resetWorld({
			MemberNumber: 1,
			Nickname: "Sera",
			OwnerMemberNumber: 99,
			LoverMemberNumber: [50],
			WhiteList: [60],
			BlackList: [66],
			FriendList: [70],
			LSCG: { GlobalModule: { enabled: true } },
		});
		states.init();
		for (const [num, name] of [[2, "Alice"], [3, "Bob"], [50, "Lover"], [60, "Whitelisted"], [66, "Blacklisted"], [70, "Friend"], [99, "Ownerperson"]] as [number, string][])
			addToRoom(makeCharacter({ MemberNumber: num, Nickname: name }));

		speech.settings.enabled = true;
		speech.settings.detectors = { tone: true, profanity: true, erudite: false, phrases: true };
		speech.unload();
		speech.load();
	});

	function send(senderNum: number, value: Record<string, unknown>): void {
		receive.command({ MemberNumber: senderNum } as FixtureCharacter, "speech-settings-set", [{ name: "settings", value }]);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function get(senderNum: number): any {
		currentBcLite().ServerSend.mockClear();
		receive.command({ MemberNumber: senderNum } as FixtureCharacter, "speech-settings-get", []);
		return sent.hidden().at(-1);
	}

	describe("permission gating", () => {
		beforeEach(() => {
			speech.settings.remoteAccess = true;
			speech.settings.remoteLevel = "Public";
		});

		it("requires trance by default", () => {
			expect(speech.settings.remoteRequiresTrance).toBe(true);
		});

		it("requiring trance: ignored while not hypnotized, even from the owner", () => {
			states.HypnoState.Recover(false);
			send(99, { eruditeGrade: 7 });
			expect(speech.settings.eruditeGrade).not.toBe(7);
		});

		it("requiring trance: applied once hypnotized", () => {
			states.HypnoState.Activate(1);
			send(3, { eruditeGrade: 7 });
			expect(speech.settings.eruditeGrade).toBe(7);
		});

		it("hypnotized but failing the permission level is still ignored", () => {
			states.HypnoState.Activate(1);
			speech.settings.remoteLevel = "Owner";
			send(3, { eruditeGrade: 8 });
			expect(speech.settings.eruditeGrade).not.toBe(8);
		});

		it("a remote sender cannot turn off the trance requirement", () => {
			states.HypnoState.Activate(1);
			send(99, { remoteRequiresTrance: false });
			expect(speech.settings.remoteRequiresTrance).toBe(true);
		});

		it("remote disabled entirely -> ignored", () => {
			speech.settings.remoteRequiresTrance = false;
			speech.settings.remoteAccess = false;
			send(99, { negativeThreshold: -1 });
			expect(speech.settings.negativeThreshold).not.toBe(-1);
		});

		it("Owner level: only the actual owner is accepted", () => {
			speech.settings.remoteRequiresTrance = false;
			speech.settings.remoteLevel = "Owner";
			send(2, { negativeThreshold: -1 });
			expect(speech.settings.negativeThreshold).not.toBe(-1);
			send(99, { negativeThreshold: -1 });
			expect(speech.settings.negativeThreshold).toBe(-1);
		});

		it("Friends level: stranger ignored, friend/whitelisted/lover applied", () => {
			speech.settings.remoteRequiresTrance = false;
			speech.settings.remoteLevel = "Friends";
			send(3, { positiveThreshold: 1 });
			expect(speech.settings.positiveThreshold).not.toBe(1);
			send(70, { positiveThreshold: 1 });
			expect(speech.settings.positiveThreshold).toBe(1);
			send(60, { eruditeGrade: 12 });
			expect(speech.settings.eruditeGrade).toBe(12);
		});

		it("PublicExceptBlacklist: blacklisted sender ignored", () => {
			speech.settings.remoteRequiresTrance = false;
			speech.settings.remoteLevel = "PublicExceptBlacklist";
			speech.settings.eruditeGrade = 12;
			send(66, { eruditeGrade: 5 });
			expect(speech.settings.eruditeGrade).toBe(12);
		});
	});

	describe("sanitization", () => {
		beforeEach(() => {
			speech.settings.remoteAccess = true;
			speech.settings.remoteRequiresTrance = false;
			speech.settings.remoteLevel = "PublicExceptBlacklist";
		});

		it("forged access-control fields (remoteAccess/lockable/remoteLevel/enabled) are ignored", () => {
			send(99, { remoteAccess: false, lockable: true, remoteLevel: "Public", enabled: false });
			expect(speech.settings.remoteAccess).toBe(true);
			expect(speech.settings.lockable).toBe(false);
			expect(speech.settings.remoteLevel).toBe("PublicExceptBlacklist");
			expect(speech.settings.enabled).toBe(true);
		});

		it("locking is rejected until lockable is turned on locally, then accepted", () => {
			send(99, { locked: true });
			expect(speech.settings.locked).toBe(false);
			speech.settings.lockable = true;
			send(99, { locked: true });
			expect(speech.settings.locked).toBe(true);
		});

		it("safeword clears a remote lock", () => {
			speech.settings.lockable = true;
			send(99, { locked: true });
			speech.safeword();
			expect(speech.settings.locked).toBe(false);
		});

		it("out-of-range numbers and wrong-typed numbers are dropped", () => {
			speech.settings.negativeThreshold = -1;
			send(99, { negativeThreshold: 50, contextWindowSeconds: "10" });
			expect(speech.settings.negativeThreshold).toBe(-1);
			expect(speech.settings.contextWindowSeconds).toBe(60);
		});

		it("reaction rules with an invalid state are dropped; valid ones kept; capped at 128", () => {
			send(99, {
				reactions: [
					{ enabled: true, detection: "negative", action: "applyState", state: "hacked" },
					{ enabled: true, detection: "profanity", action: "shock", cooldownMs: 5000 },
					...Array(20).fill({ enabled: true, detection: "positive", action: "removeState", state: "denied", cooldownMs: 1 }),
				],
			});
			expect(speech.settings.reactions).toHaveLength(21);
			expect(speech.settings.reactions[0].action).toBe("shock");

			send(99, { reactions: Array(200).fill({ enabled: true, detection: "positive", action: "removeState", state: "denied", cooldownMs: 1 }) });
			expect(speech.settings.reactions).toHaveLength(128);
		});

		it("trance-state rules are accepted; a redressed apply/empty/overlong outfit key is dropped", () => {
			send(99, {
				reactions: [
					{ enabled: true, detection: "negative", action: "applyState", state: "hypnotized", cooldownMs: 0 },
					{ enabled: true, detection: "negative", action: "applyState", state: "redressed", cooldownMs: 0 },
					{ enabled: true, detection: "positive", action: "removeState", state: "redressed", cooldownMs: 0 },
					{ enabled: true, detection: "profanity", action: "outfit", outfitKey: "  maid ", cooldownMs: 0 },
					{ enabled: true, detection: "profanity", action: "outfit", outfitKey: "", cooldownMs: 0 },
					{ enabled: true, detection: "profanity", action: "outfit", outfitKey: "x".repeat(71), cooldownMs: 0 },
				],
			});
			expect(speech.settings.reactions.map(r => r.state ?? r.outfitKey)).toEqual(["hypnotized", "redressed", "maid"]);
		});

		it("remote phrase groups: duplicate/bad id/junk entries dropped, name capped, non-string phrases emptied", () => {
			send(99, {
				phraseGroups: [
					{ id: "release", name: "Release", phrases: "sorry mistress" },
					{ id: "release", name: "Duplicate", phrases: "x" },
					{ id: "BAD ID!", name: "Bad", phrases: "x" },
					{ id: "banned", name: "N".repeat(80), phrases: 42 },
					"junk",
				],
				reactions: [
					{ enabled: true, detection: "phrase", phraseGroup: "release", action: "removeState", state: "redressed", cooldownMs: 0 },
					{ enabled: true, detection: "phrase", phraseGroup: "<script>", action: "shock", cooldownMs: 0 },
					{ enabled: true, detection: "phrase", action: "shock", cooldownMs: 0 },
				],
			});
			expect(speech.settings.phraseGroups.map(p => `${p.id}:${p.name.length}:${p.phrases}`)).toEqual(["release:7:sorry mistress", "banned:40:"]);
			expect(speech.settings.reactions.map(r => r.phraseGroup)).toEqual(["release"]);
		});

		it("detectors merge partially remotely; unknown detector keys and wrong types are dropped", () => {
			speech.settings.detectors = { tone: true, profanity: true, erudite: false, phrases: true };
			send(99, { detectors: { erudite: true, bogus: true, tone: "no" } });
			expect(speech.settings.detectors).toEqual({ tone: true, profanity: true, erudite: true, phrases: true });
		});
	});

	describe("private config + hidden phrases", () => {
		beforeEach(() => {
			speech.settings.detectors = { tone: true, profanity: true, erudite: false, phrases: true };
			speech.settings.remoteAccess = true;
			speech.settings.remoteLevel = "Public";
			speech.settings.remoteRequiresTrance = false;
			speech.settings.phraseGroups = [{ id: "release", name: "Release", phrases: "wearer secret" }];
		});

		it("the public settings model only carries access-control fields", () => {
			expect(Object.keys(defaultSpeechPublicSettings()).sort()).toEqual(["enabled", "lockable", "locked", "remoteAccess", "remoteLevel", "remoteRequiresTrance"]);
		});

		it("a stranger's get is answered, but they can't see the wearer's phrases", () => {
			const resp = get(3);
			expect(resp?.command.name).toBe("speech-settings-response");
			expect(resp?.target).toBe(3);
			const groups = resp.command.args[0].value.phraseGroups;
			expect(groups[0].hidden).toBe(true);
			expect(groups[0].phrases).toBe("");
			expect(Array.isArray(resp.command.args[0].value.reactions)).toBe(true);
			expect(typeof resp.command.args[0].value.negativeThreshold).toBe("number");
		});

		it("a stranger's save can't touch a hidden group, but creates their own", () => {
			send(3, { phraseGroups: [{ id: "release", name: "Hacked", hidden: true }, { id: "g-abc123", name: "Stranger's", phrases: "stranger secret" }] });
			expect(speech.settings.phraseGroups[0].name).toBe("Release");
			expect(speech.settings.phraseGroups[0].phrases).toBe("wearer secret");
			expect(speech.settings.phraseGroups[1].installedBy).toBe(3);
			expect(speech.settings.phraseGroups[1].phrases).toBe("stranger secret");
		});

		it("a stranger can't delete a group they can't see by omitting it", () => {
			send(3, { phraseGroups: [{ id: "release", name: "Hacked", hidden: true }, { id: "g-abc123", name: "Stranger's", phrases: "stranger secret" }] });
			send(3, { phraseGroups: [{ id: "g-abc123", name: "Stranger's", phrases: "stranger secret" }] });
			expect(speech.settings.phraseGroups.map(p => p.id)).toEqual(["g-abc123", "release"]);
		});

		it("a stranger sees their own group's phrases, but everyone else's group stays hidden", () => {
			send(3, { phraseGroups: [{ id: "g-abc123", name: "Stranger's", phrases: "stranger secret" }] });
			const groups = get(3).command.args[0].value.phraseGroups;
			expect(groups.map((p: { id: string; hidden?: boolean; phrases: string }) => `${p.id}:${p.hidden ? "hidden" : p.phrases}`)).toEqual(["g-abc123:stranger secret", "release:hidden"]);
		});

		it("the owner sees every group unhidden", () => {
			send(3, { phraseGroups: [{ id: "g-abc123", name: "Stranger's", phrases: "stranger secret" }] });
			expect(get(99).command.args[0].value.phraseGroups.every((p: { hidden?: boolean }) => !p.hidden)).toBe(true);
		});

		it("isGroupHiddenFromWearer reflects who installed each group", () => {
			send(3, { phraseGroups: [{ id: "g-abc123", name: "Stranger's", phrases: "stranger secret" }] });
			expect(speech.isGroupHiddenFromWearer("g-abc123")).toBe(true);
			expect(speech.isGroupHiddenFromWearer("release")).toBe(false);
		});

		it("describe() never reveals a hidden group's match, but the match still exists for reactions", () => {
			send(3, { phraseGroups: [{ id: "g-abc123", name: "Stranger's", phrases: "stranger secret" }] });
			const analysis = speech.analyze("stranger secret");
			expect(speech.describe(analysis)).toContain("phrases: none");
			expect(analysis.phrases.matched).toEqual(["g-abc123"]);
		});

		it("the owner re-setting the wearer's own group makes it hidden from the wearer too", () => {
			send(99, { phraseGroups: [{ id: "release", name: "Release", phrases: "owner secret" }, { id: "g-abc123", name: "Stranger's", phrases: "stranger secret" }] });
			expect(speech.isGroupHiddenFromWearer("release")).toBe(true);
			expect(speech.settings.phraseGroups.find(p => p.id === "release")?.installedBy).toBe(99);
		});

		it("get is refused once remote access is off", () => {
			speech.settings.remoteAccess = false;
			expect(get(99)).toBeUndefined();
		});

		it("a remote change notifies the wearer by name", () => {
			send(99, { eruditeGrade: 8 });
			expect(sent.local().some(x => x.includes("changed your speech analysis settings"))).toBe(true);
		});
	});
});
