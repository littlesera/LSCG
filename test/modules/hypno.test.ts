// HypnoModule: who's allowed to speak a trigger (allowedSpeaker), the OOC-ignored /
// while-hypnotized-filtered / cooldown-gated trigger pipeline (TopLevelCheckTriggers),
// the four distinct wake-up paths (word/boop/snap/timeout), arousal-threshold delayed
// triggers, suggestion compel + exclusivity, and trigger-word cycling.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { HypnoModule } from "Modules/hypno";
import { StateModule } from "Modules/states";
import { replace_template } from "utils";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeCharacter, type FixtureCharacter } from "../harness/fixtures";
import { receive, sent } from "../harness/room";
import { seedRandom, restoreRandom } from "../harness/time";

describe("HypnoModule", () => {
	let hypno: HypnoModule;
	let states: StateModule;
	let alice: FixtureCharacter;

	beforeAll(() => {
		[, hypno, states] = boot(new CoreModule(), new HypnoModule(), new StateModule());
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({
			MemberNumber: 1, Nickname: "Sera", OwnerMemberNumber: 99, LoverMemberNumber: [50],
			LSCG: { GlobalModule: { enabled: true } },
		});
		hypno.init();
		states.init();
		// Real BC's ChatRoomCharacter includes the player themself (getCharacter() looks
		// them up the same way as anyone else) -- needed for the OnAction "snaps" handler's
		// own-message check, which resolves the sender via getCharacter(data.Sender).
		addToRoom(player());
		alice = addToRoom(makeCharacter({ MemberNumber: 2, Nickname: "Alice" }));
		hypno.settings.enabled = true;
		hypno.settings.trigger = "sleepy";
		hypno.settings.overrideWords = "";
		hypno.settings.enableCycle = false;
		hypno.settings.cooldownTime = 0;
		// defaultSettings() doesn't set these (a possible gap worth a human's attention,
		// not touched here per this project's "don't fix unflagged issues" policy) --
		// CompelSuggestion reads alwaysSubmitMemberIds unconditionally and throws if it's
		// still undefined.
		hypno.settings.alwaysSubmitMemberIds = "";
	});

	function emote(raw: string): string {
		return replace_template(raw, null);
	}

	describe("allowedSpeaker", () => {
		it("the player is never their own allowed speaker", () => {
			expect(hypno.allowedSpeaker(player() as never)).toBe(false);
		});

		it("with no override IDs configured, falls back to the general allow-item check", () => {
			hypno.settings.overrideMemberIds = "";
			expect(hypno.allowedSpeaker(alice as never)).toBe(true);
			vi.mocked(globalThis.ServerChatRoomGetAllowItem).mockReturnValueOnce(false);
			expect(hypno.allowedSpeaker(alice as never)).toBe(false);
		});

		it("with override IDs configured, only those exact members are allowed", () => {
			hypno.settings.overrideMemberIds = "2";
			expect(hypno.allowedSpeaker(alice as never)).toBe(true);
			const bob = addToRoom(makeCharacter({ MemberNumber: 3, Nickname: "Bob" }));
			expect(hypno.allowedSpeaker(bob as never)).toBe(false);
		});
	});

	describe("IsOnCooldown", () => {
		it("blocks retriggering for cooldownTime seconds after the last recovery, sending the message only once", () => {
			hypno.settings.cooldownTime = 30;
			states.HypnoState.Activate(1);
			states.HypnoState.Recover(false);
			expect(hypno.IsOnCooldown()).toBe(true);
			expect(hypno.IsOnCooldown()).toBe(true);
			expect(sent.actions()).toHaveLength(1);
		});

		it("is not on cooldown once the window has elapsed", () => {
			hypno.settings.cooldownTime = 30;
			states.HypnoState.Activate(1);
			states.HypnoState.Recover(false);
			vi.advanceTimersByTime(31_000);
			expect(hypno.IsOnCooldown()).toBe(false);
		});

		it("is never on cooldown when never previously recovered", () => {
			hypno.settings.cooldownTime = 30;
			expect(hypno.IsOnCooldown()).toBe(false);
		});
	});

	describe("TopLevelCheckTriggers: trigger word detection", () => {
		it("an OOC line (leading paren) is ignored entirely", () => {
			hypno.TopLevelCheckTriggers("(sleepy is just a test note", alice as never);
			expect(states.HypnoState.Active).toBe(false);
		});

		it("a line containing the trigger word hypnotizes the player", () => {
			hypno.TopLevelCheckTriggers("you are getting sleepy now", alice as never);
			expect(states.HypnoState.Active).toBe(true);
			expect(sent.actions()[0]).toContain("trigger word");
		});

		it("the trigger word from an unauthorized speaker does nothing", () => {
			vi.mocked(globalThis.ServerChatRoomGetAllowItem).mockReturnValueOnce(false);
			hypno.TopLevelCheckTriggers("you are getting sleepy now", alice as never);
			expect(states.HypnoState.Active).toBe(false);
		});

		it("does nothing when the module is disabled", () => {
			hypno.settings.enabled = false;
			hypno.TopLevelCheckTriggers("you are getting sleepy now", alice as never);
			expect(states.HypnoState.Active).toBe(false);
		});

		it("respects cooldown: the trigger word is ignored while on cooldown", () => {
			hypno.settings.cooldownTime = 30;
			states.HypnoState.Activate(1);
			states.HypnoState.Recover(false);
			hypno.TopLevelCheckTriggers("you are getting sleepy now", alice as never);
			expect(states.HypnoState.Active).toBe(false);
		});
	});

	describe("TopLevelCheckTriggers: while hypnotized, only named/hypnotizer messages are processed", () => {
		beforeEach(() => {
			hypno.settings.awakeners = "wakey";
		});

		it("a message from the character who activated the trance is processed", () => {
			states.HypnoState.Activate(2);
			hypno.TopLevelCheckTriggers("wakey wakey", alice as never);
			expect(states.HypnoState.Active).toBe(false);
		});

		it("a message from an unrelated bystander in a busy room is not processed", () => {
			addToRoom(makeCharacter({ MemberNumber: 3, Nickname: "Bob" }));
			states.HypnoState.Activate(2);
			const bystander = { MemberNumber: 3, Nickname: "Bob" } as never;
			hypno.TopLevelCheckTriggers("wakey wakey", bystander);
			expect(states.HypnoState.Active).toBe(true);
		});

		it("a message that mentions the player's name is processed even from a bystander", () => {
			addToRoom(makeCharacter({ MemberNumber: 3, Nickname: "Bob" }));
			states.HypnoState.Activate(2);
			hypno.TopLevelCheckTriggers("Sera, wakey wakey", { MemberNumber: 3, Nickname: "Bob" } as never);
			expect(states.HypnoState.Active).toBe(false);
		});

		it("activatedBy -1 (unknown activator) accepts any speaker", () => {
			states.HypnoState.Activate(-1);
			hypno.TopLevelCheckTriggers("wakey wakey", alice as never);
			expect(states.HypnoState.Active).toBe(false);
		});
	});

	describe("CheckAwakener -> TriggerRestoreWord", () => {
		it("an awakener phrase from the hypnotizer restores with the voice-specific emote", () => {
			hypno.settings.awakeners = "wakey";
			states.HypnoState.Activate(2);
			hypno.TopLevelCheckTriggers("wakey wakey", alice as never);
			expect(states.HypnoState.Active).toBe(false);
			expect(sent.actions()[0]).toBe(replace_template("%NAME% snaps back into %POSSESSIVE% senses at %OPP_NAME%'s voice.", alice as never));
		});
	});

	describe("CheckSpeechTriggers", () => {
		it("a silence-trigger phrase blocks speech while hypnotized", () => {
			hypno.settings.silenceTriggers = "hush";
			states.HypnoState.Activate(2);
			hypno.TopLevelCheckTriggers("hush now", alice as never);
			expect(states.HypnoState.Restrictions.Speech).toBe("true");
		});

		it("a speak-trigger phrase allows speech again", () => {
			hypno.settings.speakTriggers = "speak";
			states.HypnoState.Activate(2);
			states.HypnoState.Restrictions.Speech = "true";
			hypno.TopLevelCheckTriggers("you may speak", alice as never);
			expect(states.HypnoState.Restrictions.Speech).toBe("false");
		});
	});

	describe("wake-up paths", () => {
		it("TriggerRestoreBoop (via a Boop activity) wakes the player with its own emote", () => {
			player().LSCG.ActivityModule = { activities: [{ name: "Boop", group: "ItemHead", hypno: false, sleep: false, hypnoThreshold: 0, hypnoRequiredRepeats: 1, orgasm: false, orgasmThreshold: 0, awakener: true, allowedMemberIds: [] }] };
			states.HypnoState.Activate(2);
			receive.activity(alice, "ItemHead", "Boop", player());
			expect(states.HypnoState.Active).toBe(false);
			expect(sent.actions()[0]).toBe(emote("%NAME% reboots, blinking and gasping as %PRONOUN% regains %POSSESSIVE% senses."));
		});

		it("a Boop from the player themself does not wake them (only others can boop-wake)", () => {
			player().LSCG.ActivityModule = { activities: [{ name: "Boop", group: "ItemHead", hypno: false, sleep: false, hypnoThreshold: 0, hypnoRequiredRepeats: 1, orgasm: false, orgasmThreshold: 0, awakener: true, allowedMemberIds: [] }] };
			states.HypnoState.Activate(2);
			receive.activity(player(), "ItemHead", "Boop", player());
			expect(states.HypnoState.Active).toBe(true);
		});

		it("TriggerRestoreSnap (via a snap action) wakes the player when enableSnapWakeup is on", () => {
			hypno.settings.enableSnapWakeup = true;
			states.HypnoState.Activate(2);
			receive.action(alice, "*snaps her fingers*");
			expect(states.HypnoState.Active).toBe(false);
			expect(sent.actions()[0]).toBe(emote("%NAME% blinks, shaking %POSSESSIVE% head with confusion as %PRONOUN% regains %POSSESSIVE% senses."));
		});

		it("a snap does nothing when enableSnapWakeup is off", () => {
			hypno.settings.enableSnapWakeup = false;
			states.HypnoState.Activate(2);
			receive.action(alice, "*snaps her fingers*");
			expect(states.HypnoState.Active).toBe(true);
		});

		it("a snap from the player themself does not wake them", () => {
			hypno.settings.enableSnapWakeup = true;
			states.HypnoState.Activate(2);
			receive.action(player(), "*snaps her fingers*");
			expect(states.HypnoState.Active).toBe(true);
		});

		it("TriggerRestoreTimeout wakes the player once triggerTime minutes elapse, via the tick", () => {
			hypno.settings.triggerTime = 10;
			states.HypnoState.Activate(2);
			vi.advanceTimersByTime(10 * 60_000 + 1000);
			globalThis.TimerProcess();
			expect(states.HypnoState.Active).toBe(false);
			expect(sent.actions().at(-1)).toBe(emote("%NAME% gasps, blinking and blushing with confusion."));
		});

		it("does not time out before triggerTime has elapsed", () => {
			hypno.settings.triggerTime = 10;
			states.HypnoState.Activate(2);
			vi.advanceTimersByTime(5 * 60_000);
			globalThis.TimerProcess();
			expect(states.HypnoState.Active).toBe(true);
		});
	});

	describe("DelayedTrigger: arousal-threshold activity trigger", () => {
		it("repeating an arousal-threshold activity enough times triggers hypnosis", () => {
			player().ArousalSettings = { Progress: 80 } as never;
			player().LSCG.ActivityModule = { activities: [{ name: "Pet", group: "ItemHead", hypno: true, sleep: false, hypnoThreshold: 50, hypnoRequiredRepeats: 2, orgasm: false, orgasmThreshold: 0, awakener: false, allowedMemberIds: [] }] };
			receive.activity(alice, "ItemHead", "Pet", player());
			expect(states.HypnoState.Active).toBe(false);
			receive.activity(alice, "ItemHead", "Pet", player());
			vi.advanceTimersByTime(5000);
			expect(states.HypnoState.Active).toBe(true);
		});

		it("does not trigger when arousal is below the activity's threshold", () => {
			player().ArousalSettings = { Progress: 10 } as never;
			player().LSCG.ActivityModule = { activities: [{ name: "Pet", group: "ItemHead", hypno: true, sleep: false, hypnoThreshold: 50, hypnoRequiredRepeats: 1, orgasm: false, orgasmThreshold: 0, awakener: false, allowedMemberIds: [] }] };
			receive.activity(alice, "ItemHead", "Pet", player());
			vi.advanceTimersByTime(5000);
			expect(states.HypnoState.Active).toBe(false);
		});

		it("does not trigger while already hypnotized", () => {
			player().ArousalSettings = { Progress: 80 } as never;
			player().LSCG.ActivityModule = { activities: [{ name: "Pet", group: "ItemHead", hypno: true, sleep: false, hypnoThreshold: 50, hypnoRequiredRepeats: 1, orgasm: false, orgasmThreshold: 0, awakener: false, allowedMemberIds: [] }] };
			states.HypnoState.Activate(2);
			sent.raw().length = 0;
			receive.activity(alice, "ItemHead", "Pet", player());
			vi.advanceTimersByTime(5000);
			// StartTriggerWord no-ops while already active; the state's activatedBy is unchanged.
			expect(states.settings.states.find(s => s.type === "hypnotized")?.activatedBy).toBe(2);
		});
	});

	describe("CheckSuggestions", () => {
		beforeEach(() => {
			hypno.settings.allowSuggestions = true;
			// Bypasses the resist-suggestion minigame (a canvas/GUI feature out of this
			// project's scope) so a compelled suggestion deterministically applies instead
			// of rolling influence -- what's under test here is whether CompelSuggestion
			// gets invoked at all, not the resistance minigame's own mechanics.
			hypno.settings.alwaysSubmit = true;
			states.HypnoState.Activate(2);
		});

		it("a matching, non-exclusive suggestion compels regardless of who says it", () => {
			hypno.settings.suggestions = [{ id: "s1", name: "test", trigger: "do a trick", installedBy: 99, installedByName: "Owner", installedAt: 0, exclusive: false, instructions: [] }];
			const compelSpy = vi.spyOn(hypno, "CompelSuggestion");
			hypno.TopLevelCheckTriggers("do a trick now", alice as never);
			vi.advanceTimersByTime(600);
			expect(compelSpy).toHaveBeenCalled();
		});

		it("an exclusive suggestion only compels when spoken by its installer", () => {
			hypno.settings.suggestions = [{ id: "s1", name: "test", trigger: "do a trick", installedBy: 99, installedByName: "Owner", installedAt: 0, exclusive: true, instructions: [] }];
			const compelSpy = vi.spyOn(hypno, "CompelSuggestion");
			hypno.TopLevelCheckTriggers("do a trick now", alice as never);
			vi.advanceTimersByTime(600);
			expect(compelSpy).not.toHaveBeenCalled();
		});

		it("an exclusive suggestion compels when spoken by its own installer", () => {
			// The installer also needs to pass the separate "who a hypnotized person still
			// listens to" gate in TopLevelCheckTriggers (named / the activator / Player) --
			// make them the activator so their message isn't garbled before it ever reaches
			// CheckSuggestions.
			const owner = addToRoom(makeCharacter({ MemberNumber: 99, Nickname: "Owner" }));
			states.settings.states.find(s => s.type === "hypnotized")!.activatedBy = 99;
			hypno.settings.suggestions = [{ id: "s1", name: "test", trigger: "do a trick", installedBy: 99, installedByName: "Owner", installedAt: 0, exclusive: true, instructions: [] }];
			const compelSpy = vi.spyOn(hypno, "CompelSuggestion");
			hypno.TopLevelCheckTriggers("do a trick now", owner as never);
			vi.advanceTimersByTime(600);
			expect(compelSpy).toHaveBeenCalled();
		});

		it("suggestions do nothing when allowSuggestions is off", () => {
			hypno.settings.allowSuggestions = false;
			hypno.settings.suggestions = [{ id: "s1", name: "test", trigger: "do a trick", installedBy: 99, installedByName: "Owner", installedAt: 0, exclusive: false, instructions: [] }];
			const compelSpy = vi.spyOn(hypno, "CompelSuggestion");
			hypno.TopLevelCheckTriggers("do a trick now", alice as never);
			vi.advanceTimersByTime(600);
			expect(compelSpy).not.toHaveBeenCalled();
		});
	});

	describe("trigger word cycling", () => {
		it("cycles to a new trigger once cycleTime minutes have passed since the last activation/recovery", () => {
			hypno.settings.enableCycle = true;
			hypno.settings.overrideWords = "sleepy, drowsy, dreamy";
			hypno.settings.cycleTime = 10;
			hypno.settings.triggerCycled = false;
			states.HypnoState.Activate(1);
			states.HypnoState.Recover(false);
			vi.advanceTimersByTime(11 * 60_000);
			hypno.CheckNewTrigger();
			expect(hypno.settings.triggerCycled).toBe(true);
		});

		it("does not cycle before cycleTime has elapsed", () => {
			hypno.settings.enableCycle = true;
			hypno.settings.overrideWords = "sleepy, drowsy, dreamy";
			hypno.settings.cycleTime = 10;
			hypno.settings.triggerCycled = false;
			states.HypnoState.Activate(1);
			states.HypnoState.Recover(false);
			vi.advanceTimersByTime(2 * 60_000);
			hypno.CheckNewTrigger();
			expect(hypno.settings.triggerCycled).toBe(false);
		});

		it("does not cycle while currently hypnotized", () => {
			hypno.settings.enableCycle = true;
			hypno.settings.cycleTime = 10;
			hypno.settings.triggerCycled = false;
			states.HypnoState.Activate(1);
			vi.advanceTimersByTime(11 * 60_000);
			hypno.CheckNewTrigger();
			expect(hypno.settings.triggerCycled).toBe(false);
		});

		it("does not cycle when enableCycle is off", () => {
			hypno.settings.enableCycle = false;
			hypno.settings.cycleTime = 10;
			hypno.settings.triggerCycled = false;
			states.HypnoState.Activate(1);
			states.HypnoState.Recover(false);
			vi.advanceTimersByTime(11 * 60_000);
			hypno.CheckNewTrigger();
			expect(hypno.settings.triggerCycled).toBe(false);
		});
	});

	describe("getNewTriggerWord", () => {
		afterEach(() => restoreRandom());

		it("can select the last word in the override list, not just [0, length-1)", () => {
			// getRandomInt(max) is [0, max); a Math.random() near 1 must be able to
			// resolve to the *last* valid index (words.length - 1), not be excluded from it.
			hypno.settings.overrideWords = "sleepy, drowsy, dreamy";
			hypno.settings.trigger = "";
			seedRandom([0.999999]);
			expect(hypno.getNewTriggerWord()).toBe("dreamy");
		});
	});
});
