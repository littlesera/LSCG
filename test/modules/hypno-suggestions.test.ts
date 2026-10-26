// HypnoModule's suggestion system and chat commands: the /zonk-style commands,
// influence bookkeeping (increase/reduce/downgrade), suggestion request/push from other
// players, the resist roll, and each instruction a suggestion can carry (pose, say,
// strip, follow/forget, maid, orgasm, denial, insatiable, blocked instructions), plus
// trigger blanking in immersive mode.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { HypnoInstruction, HypnoModule, HypnoSuggestion, SuggestionMiniGameOptions } from "Modules/hypno";
import { StateModule } from "Modules/states";
import { LeashingModule } from "Modules/leashing";
import { LSCGHypnoInstruction } from "Settings/Models/hypno";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeAsset, makeCharacter, makeGroup, makeItem, wear, type FixtureCharacter } from "../harness/fixtures";
import { sent } from "../harness/room";
import { rawStub } from "../harness/bc-lite";
import { seedRandom, restoreRandom } from "../harness/time";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

describe("HypnoModule suggestions", () => {
	let hypno: HypnoModule;
	let states: StateModule;
	let leashing: LeashingModule;
	let alice: FixtureCharacter;

	beforeAll(() => {
		[, leashing, hypno, states] = boot(new CoreModule(), new LeashingModule(), new HypnoModule(), new StateModule());
		vi.useFakeTimers();
	});

	beforeEach(() => {
		resetWorld({ MemberNumber: 1, Nickname: "Sera", OwnerMemberNumber: 99, LSCG: { GlobalModule: { enabled: true } } });
		hypno.init();
		states.init();
		leashing.Pairings = [];
		addToRoom(player());
		alice = addToRoom(makeCharacter({ MemberNumber: 2, Nickname: "Alice" }));
		hypno.settings.enabled = true;
		hypno.settings.influence = [];
		hypno.settings.suggestions = [];
		hypno.settings.blockedInstructions = [];
		hypno.forceSay_sayText = "";
		hypno.forceSay_BypassingSpeechBlock = false;
		states.settings.immersive = false;
		Object.assign(g.Player, { GetDifficulty: () => 0, CanChangeOwnClothes: () => true });
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.unstubAllGlobals();
		restoreRandom();
	});

	const local = () => sent.local().join("\n");
	const influenceOf = (n: number) => hypno.settings.influence.find(i => i.memberId === n)?.influence;

	function suggestion(name: string, instructions: HypnoInstruction[] = [], installedBy = 2): HypnoSuggestion {
		const s = new HypnoSuggestion(name);
		s.installedBy = installedBy;
		s.installedByName = "Alice";
		s.trigger = name.toLowerCase();
		s.instructions = instructions;
		return s;
	}

	function instruction(type: LSCGHypnoInstruction, args: Record<string, unknown> = {}) {
		const i = new HypnoInstruction(type);
		i.arguments = args;
		return i;
	}

	const opts = (msg = "", s = suggestion("Test")) => new SuggestionMiniGameOptions(s, alice as never, msg);

	describe("SuggestionMiniGameOptions / HypnoSuggestion", () => {
		it("words its prompts around the sender", () => {
			const o = opts();
			expect([o.senderNum, o.senderName]).toEqual([2, "Alice"]);
			expect(o.hintText).toBe("Alice's words compel you...");
			expect(o.failText).toContain("fail to resist Alice's");
			expect(o.successText).toContain("shake off Alice's");
			expect(o.submissionText).toContain("submit to Alice's");
		});

		it("a new suggestion records who installed it", () => {
			const s = new HypnoSuggestion("Sit");
			expect(s).toMatchObject({ name: "Sit", installedBy: 1, exclusive: false, instructions: [] });
		});
	});

	describe("commands", () => {
		const run = (tag: string, args = "") => hypno.commands.find(c => c.Tag === tag)!.Action!(args, "", []);

		it("zonk / unzonk hypnotize and wake the player", () => {
			run("zonk");
			expect(hypno.hypnoActivated).toBe(true);
			run("unzonk");
			expect(hypno.hypnoActivated).toBe(false);
		});

		it("are refused while immersive", () => {
			states.settings.immersive = true;
			for (const tag of ["zonk", "unzonk", "cycle-trigger", "show-influence", "show-suggestions"]) run(tag);
			expect(hypno.hypnoActivated).toBe(false);
			expect(sent.local()).toHaveLength(5);
			expect(local()).toContain("zonk disabled while immersive");
		});

		it("zonk does nothing when hypno is disabled", () => {
			hypno.settings.enabled = false;
			run("zonk");
			expect(hypno.hypnoActivated).toBe(false);
		});

		it("cycle-trigger rolls a new word only when cycling is on", () => {
			hypno.settings.enableCycle = false;
			hypno.settings.trigger = "same";
			run("cycle-trigger");
			expect(hypno.settings.trigger).toBe("same");
			hypno.settings.enableCycle = true;
			run("cycle-trigger");
			expect(hypno.settings.trigger).not.toBe("same");
		});

		it("show-influence lists each influence with a relative age", () => {
			const now = Date.now();
			hypno.settings.influence = [
				{ memberId: 2, memberName: "Alice", influence: 10, lastInfluenced: now - 5 * 60_000 },
				{ memberId: 3, memberName: "Bea", influence: 4, lastInfluenced: now - 3 * 3600_000 },
				{ memberId: 4, memberName: "Cat", influence: 2, lastInfluenced: now - 3 * 86400_000 },
				{ memberId: 5, memberName: "Dee", influence: 1, lastInfluenced: now - 30 * 86400_000 },
			] as never;
			run("show-influence");
			expect(sent.local()).toHaveLength(4);
			expect(sent.local()[0]).toContain("5 minutes ago");
			expect(sent.local()[1]).toContain("hours ago");
			expect(sent.local()[2]).toContain("days ago");
			expect(sent.local()[3]).toContain("weeks ago");
		});

		it("show-suggestions lists installed suggestions", () => {
			hypno.settings.suggestions = [suggestion("Sit")];
			run("show-suggestions");
			expect(local()).toContain("<b>Sit</b>");
		});

		describe("remove-suggestion", () => {
			beforeEach(() => {
				hypno.settings.allowSuggestionRemoval = true;
				hypno.settings.suggestions = [suggestion("Sit")];
			});

			it("removes a suggestion by name, ignoring case", () => {
				run("remove-suggestion", " sit ");
				expect(hypno.settings.suggestions).toEqual([]);
				expect(local()).toContain("Suggestion 'Sit' by Alice [2] removed");
			});

			it("explains why it can't", () => {
				run("remove-suggestion", "");
				run("remove-suggestion", "stand");
				g.Player.GetDifficulty = () => 3;
				run("remove-suggestion", "sit");
				g.Player.GetDifficulty = () => 0;
				states.settings.immersive = true;
				run("remove-suggestion", "sit");
				hypno.settings.allowSuggestionRemoval = false;
				run("remove-suggestion", "sit");
				expect(sent.local()).toEqual([
					expect.stringContaining("No suggestion name provided"),
					expect.stringContaining("Suggestion 'stand' not found"),
					expect.stringContaining("unavailable on extreme difficulty"),
					expect.stringContaining("disabled while immersive"),
					expect.stringContaining("disabled in settings"),
				]);
				expect(hypno.settings.suggestions).toHaveLength(1);
			});
		});
	});

	describe("safeword", () => {
		it("wakes the player and locks down suggestions and remote access", () => {
			hypno.StartTriggerWord(true, 2);
			Object.assign(hypno.settings, { allowSuggestions: true, remoteAccess: true, locked: true });
			hypno.safeword();
			expect(hypno.hypnoActivated).toBe(false);
			expect(hypno.settings).toMatchObject({ allowSuggestions: false, allowSuggestionRemoval: true, remoteAccess: false, locked: false });
		});
	});

	describe("influence", () => {
		it("increases by 2 per step, capped at 100, tracking the name", () => {
			hypno.IncreaseSpeakerInfluence(2);
			expect(hypno.settings.influence[0]).toMatchObject({ memberId: 2, memberName: "Alice", influence: 2 });
			hypno.IncreaseSpeakerInfluence(2, 3);
			expect(influenceOf(2)).toBe(8);
			hypno.IncreaseSpeakerInfluence(2, 100);
			expect(influenceOf(2)).toBe(100);
			hypno.IncreaseSpeakerInfluence(77);
			expect(hypno.settings.influence[1].memberName).toBe("Someone");
		});

		it("reduces by one, only for someone with influence", () => {
			hypno.IncreaseSpeakerInfluence(2);
			hypno.ReduceSpeakerInfluence(2, true);
			hypno.ReduceSpeakerInfluence(3);
			expect(influenceOf(2)).toBe(1);
			expect(hypno.settings.influence).toHaveLength(1);
		});

		it("downgrades logarithmically, dropping anyone at or below 1", () => {
			hypno.settings.influence = [
				{ memberId: 2, influence: 100 }, { memberId: 3, influence: 9 }, { memberId: 4, influence: 1 }, { memberId: 5, influence: 0 },
			] as never;
			hypno.DowngradeInfluences();
			expect(hypno.settings.influence.map(i => [i.memberId, i.influence])).toEqual([[2, 98], [3, 8]]);
			hypno.settings.influence = undefined as never;
			hypno.DowngradeInfluences();
			expect(hypno.settings.influence).toEqual([]);
		});

		it("a suggestion's pull is half each of the installer's and speaker's influence, doubled in trance", () => {
			hypno.settings.influence = [{ memberId: 2, influence: 40 }, { memberId: 3, influence: 20 }] as never;
			const s = suggestion("Sit", [], 3);
			expect(hypno.GetSuggestionInfluence(s, alice as never)).toBe(30);
			hypno.StartTriggerWord(true, 2);
			expect(hypno.GetSuggestionInfluence(s, alice as never)).toBe(60);
			hypno.settings.influence = [{ memberId: 2, influence: 100 }, { memberId: 3, influence: 100 }] as never;
			expect(hypno.GetSuggestionInfluence(s, alice as never)).toBe(100);
		});
	});

	describe("request / push from other players", () => {
		it("an owner can always read suggestions, filtered to what they may see", () => {
			const owner = addToRoom(makeCharacter({ MemberNumber: 99 }));
			const mine = suggestion("Mine", [], 2);
			const secret = Object.assign(suggestion("Secret", [], 3), { exclusive: true });
			hypno.settings.suggestions = [mine, secret];
			hypno.SuggestionsRequestHandler(owner.MemberNumber, {} as never);
			const reply = sent.beeps()[0];
			expect(reply.target).toBe(99);
			expect(reply.message.command?.args.find(a => a.name === "suggestions")?.value).toHaveLength(2);
		});

		it("a hypnotizer only sees non-exclusive suggestions and their own", () => {
			hypno.settings.allowSuggestions = true;
			hypno.settings.overrideMemberIds = "2";
			hypno.StartTriggerWord(true, 2);
			hypno.settings.suggestions = [suggestion("Mine", [], 2), Object.assign(suggestion("Secret", [], 3), { exclusive: true }), suggestion("Open", [], 3)];
			hypno.SuggestionsRequestHandler(2, {} as never);
			const value = sent.beeps()[0].message.command?.args.find(a => a.name === "suggestions")?.value as HypnoSuggestion[];
			expect(value.map(s => s.name)).toEqual(["Mine", "Open"]);
		});

		it("a stranger gets nothing", () => {
			hypno.SuggestionsRequestHandler(2, {} as never);
			expect(sent.beeps()).toEqual([]);
		});

		it("push adds, updates and removes suggestions, raising the sender's influence for new ones", () => {
			const owner = addToRoom(makeCharacter({ MemberNumber: 99, Nickname: "Boss" }));
			const kept = suggestion("Kept");
			const gone = suggestion("Gone");
			gone.id = "gone";
			hypno.settings.suggestions = [kept, gone];
			const added = suggestion("Added");
			added.id = "new";
			const untriggered = Object.assign(suggestion("Nope"), { id: "nope", trigger: "" });
			hypno.SuggestionsPushHandler(owner.MemberNumber, { command: { name: "set-suggestions", args: [
				{ name: "suggestions", value: [{ ...kept, name: "Kept2" }, added, untriggered] },
				{ name: "removed", value: [gone] },
			] } } as never);
			expect(hypno.settings.suggestions.map(s => s.name)).toEqual(["Kept2", "Added"]);
			expect(influenceOf(99)).toBe(8);
			expect(local()).toContain("Boss whispers into your ear");
		});

		it("push from a stranger is ignored", () => {
			hypno.SuggestionsPushHandler(2, { command: { name: "set-suggestions", args: [{ name: "suggestions", value: [suggestion("Sit")] }] } } as never);
			expect(hypno.settings.suggestions).toEqual([]);
		});
	});

	describe("resisting", () => {
		it("a roll over the influence resists, costing the speaker and installer influence", () => {
			hypno.settings.influence = [{ memberId: 2, influence: 10 }, { memberId: 3, influence: 10 }] as never;
			vi.spyOn(hypno, "GetResistRoll").mockReturnValueOnce(50);
			const doIt = vi.spyOn(hypno, "DoSuggestion");
			hypno.AttemptResistSuggestion(suggestion("Sit", [], 3), alice as never, "");
			expect(local()).toContain("Successfully resisted the suggestion! [50/10]");
			expect([influenceOf(2), influenceOf(3)]).toEqual([9, 9]);
			expect(doIt).not.toHaveBeenCalled();
			doIt.mockRestore();
		});

		it("a roll at or under the influence submits", () => {
			hypno.settings.influence = [{ memberId: 2, influence: 100 }] as never;
			vi.spyOn(hypno, "GetResistRoll").mockReturnValueOnce(10);
			const doIt = vi.spyOn(hypno, "DoSuggestion").mockImplementation(() => {});
			hypno.AttemptResistSuggestion(suggestion("Sit"), alice as never, "");
			expect(local()).toContain("Failed to resist");
			expect(doIt).toHaveBeenCalledOnce();
			doIt.mockRestore();
		});

		it("GetResistRoll is a d100", () => {
			seedRandom([0.42]);
			expect(hypno.GetResistRoll()).toBe(42);
		});

		it("the prompt buttons submit or resist, and remove themselves", () => {
			vi.stubGlobal("ChatRoomCurrentTime", () => "12:00");
			vi.stubGlobal("ChatRoomAppendChat", (div: HTMLElement) => document.body.appendChild(div));
			const resist = vi.spyOn(hypno, "AttemptResistSuggestion").mockImplementation(() => {});
			const doIt = vi.spyOn(hypno, "DoSuggestion").mockImplementation(() => {});
			hypno.PromptResistSuggestion(suggestion("Sit"), alice as never, "msg");
			(document.querySelector("[id^=suggestion-resist-]") as HTMLElement).click();
			expect(resist).toHaveBeenCalledOnce();
			expect(document.querySelectorAll("button")).toHaveLength(0);

			hypno.PromptResistSuggestion(suggestion("Sit"), alice as never, "msg");
			(document.querySelector("[id^=suggestion-submit-]") as HTMLElement).click();
			expect(doIt).toHaveBeenCalledOnce();
			resist.mockRestore();
			doIt.mockRestore();
		});

		it("the minigame's end resists or submits whatever was pending", () => {
			const doIt = vi.spyOn(hypno, "DoSuggestion").mockImplementation(() => {});
			hypno.settings.influence = [{ memberId: 2, influence: 5 }] as never;
			hypno.MiniGameOptions = opts();
			hypno.MiniGameEnd(true);
			expect(influenceOf(2)).toBe(4);
			expect(hypno.MiniGameOptions).toBeUndefined();
			hypno.MiniGameOptions = opts();
			hypno.MiniGameEnd(false);
			expect(doIt).toHaveBeenCalledOnce();
			hypno.MiniGameEnd(false);
			expect(doIt).toHaveBeenCalledOnce();
			doIt.mockRestore();
		});

		it("CompelSuggestion submits outright when influence is total, or starts the minigame", () => {
			hypno.settings.allowSuggestions = true;
			const doIt = vi.spyOn(hypno, "DoSuggestion").mockImplementation(() => {});
			hypno.CompelSuggestion(suggestion("Sit"), alice as never, "");
			expect(g.MiniGameStart).toHaveBeenCalled();
			expect(hypno.MiniGameOptions).toBeDefined();
			hypno.settings.alwaysSubmitMemberIds = "5, 2";
			hypno.CompelSuggestion(suggestion("Sit"), alice as never, "");
			expect(doIt).toHaveBeenCalledOnce();
			doIt.mockRestore();
		});
	});

	describe("DoSuggestion instructions", () => {
		function doSuggestion(...instructions: HypnoInstruction[]) {
			hypno.DoSuggestion(opts("", suggestion("Test", instructions)));
			vi.advanceTimersByTime(instructions.length * 1000);
		}

		it("raises the sender's and installer's influence, and runs instructions a second apart", () => {
			const strip = vi.spyOn(hypno, "ForceStrip").mockImplementation(() => {});
			const say = vi.spyOn(hypno, "ForceSay").mockImplementation(() => {});
			hypno.DoSuggestion(new SuggestionMiniGameOptions(suggestion("Test", [instruction(LSCGHypnoInstruction.strip), instruction(LSCGHypnoInstruction.say)], 3), alice as never, ""));
			expect([influenceOf(2), influenceOf(3)]).toEqual([2, 2]);
			vi.advanceTimersByTime(0);
			expect(strip).toHaveBeenCalledOnce();
			expect(say).not.toHaveBeenCalled();
			vi.advanceTimersByTime(1000);
			expect(say).toHaveBeenCalledOnce();
			strip.mockRestore();
			say.mockRestore();
		});

		it("refuses blocked instructions", () => {
			hypno.settings.blockedInstructions = [LSCGHypnoInstruction.orgasm];
			hypno.IncreaseSpeakerInfluence(2, 5);
			doSuggestion(instruction(LSCGHypnoInstruction.orgasm));
			expect(local()).toContain(`immune to the suggestion's "Orgasm" instruction`);
			expect(g.ActivityOrgasmPrepare).not.toHaveBeenCalled();
			expect(influenceOf(2)).toBe(11);
		});

		it("orgasm", () => {
			vi.stubGlobal("CurrentTime", 1000);
			doSuggestion(instruction(LSCGHypnoInstruction.orgasm));
			expect(sent.actions().at(-1)).toContain("gasps as pleasure rushes");
			expect(player().ArousalSettings.Progress).toBe(100);
			expect(g.ActivityOrgasmPrepare).toHaveBeenCalled();
		});

		it("denial and insatiable start their states, and forget ends them", () => {
			doSuggestion(instruction(LSCGHypnoInstruction.denial), instruction(LSCGHypnoInstruction.insatiable));
			expect(states.DeniedState.Active).toBe(true);
			expect(states.HornyState.Active).toBe(true);
			doSuggestion(instruction(LSCGHypnoInstruction.forget, { selection: { all: true, instructions: [] } }));
			expect(states.DeniedState.Active).toBe(false);
			expect(states.HornyState.Active).toBe(false);
		});

		it("forget can pick just some instructions, and needs a selection", () => {
			doSuggestion(instruction(LSCGHypnoInstruction.denial), instruction(LSCGHypnoInstruction.insatiable));
			doSuggestion(instruction(LSCGHypnoInstruction.forget));
			expect(states.DeniedState.Active).toBe(true);
			doSuggestion(instruction(LSCGHypnoInstruction.forget, { selection: { instructions: [LSCGHypnoInstruction.denial] } }));
			expect(states.DeniedState.Active).toBe(false);
			expect(states.HornyState.Active).toBe(true);
		});

		it("forget clears a forced phrase", () => {
			hypno.forceSay_sayText = "meow";
			doSuggestion(instruction(LSCGHypnoInstruction.forget, { selection: { instructions: [LSCGHypnoInstruction.say] } }));
			expect(hypno.forceSay_sayText).toBe("");
		});

		it("routes the remaining types to their handlers", () => {
			const spies = (["ForceActivity", "ForceFollow", "ForceMaidWork", "ForcePose"] as const).map(name => vi.spyOn(hypno, name).mockImplementation(() => {}));
			doSuggestion(instruction(LSCGHypnoInstruction.activity), instruction(LSCGHypnoInstruction.follow), instruction(LSCGHypnoInstruction.maid), instruction(LSCGHypnoInstruction.pose), instruction(LSCGHypnoInstruction.none));
			for (const s of spies) {
				expect(s).toHaveBeenCalledOnce();
				s.mockRestore();
			}
		});
	});

	describe("FindConfigurableTarget", () => {
		it("picks the player, the speaker, a configured name, a name in the message, or falls back to the speaker", () => {
			const bea = addToRoom(makeCharacter({ MemberNumber: 3, Nickname: "Bea" }));
			const find = (args: Record<string, unknown>, msg = "") => hypno.FindConfigurableTarget(instruction(LSCGHypnoInstruction.activity, args), alice as never, msg);
			expect(find({ self: true })).toBe(player());
			expect(find({ speakerOnly: true })).toBe(alice);
			expect(find({ config: "Bea" })).toBe(bea);
			expect(find({}, "Bea")).toBe(bea);
			expect(find({ config: "nobody" }, "nobody either")).toBe(alice);
		});
	});

	describe("ForcePose", () => {
		beforeEach(() => {
			vi.stubGlobal("PoseCategoryAvailable", vi.fn(() => true));
			vi.stubGlobal("CharacterRefresh", vi.fn());
			vi.stubGlobal("CharacterLoadCanvas", vi.fn());
		});

		const pose = (selection?: unknown) => hypno.ForcePose(opts(), instruction(LSCGHypnoInstruction.pose, { selection }));

		it("sets a full-body pose and sends the update", () => {
			pose({ full: "Kneel" });
			expect(sent.actions().at(-1)).toContain("into a pose obediently");
			expect(sent.raw().some(([type]) => type === "ChatRoomCharacterPoseUpdate")).toBe(true);
		});

		it("sets upper and lower poses separately", () => {
			pose({ upper: "Yoked", lower: "Kneel" });
			expect(sent.raw().some(([type]) => type === "ChatRoomCharacterPoseUpdate")).toBe(true);
		});

		it("is blocked when the pose isn't available, costing influence", () => {
			hypno.IncreaseSpeakerInfluence(2);
			g.PoseCategoryAvailable.mockReturnValue(false);
			pose({ full: "Kneel" });
			pose({ upper: "Yoked" });
			pose({ lower: "Kneel" });
			expect(local()).toContain("current state prevents you");
			expect(influenceOf(2)).toBeLessThan(2);
			expect(sent.raw().some(([type]) => type === "ChatRoomCharacterPoseUpdate")).toBe(false);
		});

		it("needs a selection", () => {
			pose();
			expect(local()).toContain("vague and incomplete instructions");
		});
	});

	describe("ForceSay", () => {
		const say = (config?: string, msg = "") => hypno.ForceSay(opts(msg), instruction(LSCGHypnoInstruction.say, { config }));

		it("sets the phrase from the instruction or the message", () => {
			say("I love Alice");
			expect(hypno.forceSay_sayText).toBe("I love Alice");
			expect(local()).toContain("loudly say 'I love Alice'");
			say(undefined, "meow");
			expect(hypno.forceSay_sayText).toBe("meow");
			expect(local()).toContain("A new phrase enters your mind");
		});

		it("rejects empty, OOC and command phrases", () => {
			say();
			say("(ooc)");
			say("/command");
			say("*emote");
			expect(hypno.forceSay_sayText).toBe("");
			expect(local()).toContain("You are prompted no sentence");
			expect(local()).toContain("is invalid");
		});

		it("lifts a trance's speech block so the phrase can be said", () => {
			hypno.StartTriggerWord(true, 2);
			states.HypnoState.Restrictions.Speech = "true";
			say("meow");
			expect(hypno.forceSay_BypassingSpeechBlock).toBe(true);
		});
	});

	describe("ForceStrip", () => {
		let cloth: ReturnType<typeof makeGroup>;
		let shoes: ReturnType<typeof makeGroup>;

		beforeEach(() => {
			vi.stubGlobal("CharacterLoadCanvas", vi.fn());
			cloth = Object.assign(makeGroup({ Name: "Cloth", Category: "Appearance", Clothing: true }), { AllowCustomize: true });
			shoes = Object.assign(makeGroup({ Name: "Shoes", Category: "Appearance", Clothing: true }), { AllowCustomize: true });
			wear(player(), makeItem(makeAsset(cloth, { Name: "Shirt" })));
			wear(player(), makeItem(makeAsset(shoes, { Name: "Heels" })));
		});

		const strip = (selection?: unknown) => hypno.ForceStrip(opts(), instruction(LSCGHypnoInstruction.strip, { selection }));
		const worn = () => player().Appearance.map(i => i.Asset.Name);

		it("removes the chosen groups", () => {
			strip({ groups: ["Shoes"] });
			expect(worn()).toEqual(["Shirt"]);
			expect(sent.actions().at(-1)).toContain("starts to remove clothing");
		});

		it("removes everything with all", () => {
			strip({ groups: [], all: true });
			expect(worn()).toEqual([]);
		});

		it("removes one random worn piece with random", () => {
			seedRandom([0]);
			strip({ groups: [], random: true });
			expect(worn()).toHaveLength(1);
			player().Appearance = [];
			strip({ groups: [], random: true });
			expect(local()).toContain("no more clothes to remove");
		});

		it("can't strip without permission or instructions", () => {
			strip();
			g.Player.CanChangeOwnClothes = () => false;
			strip({ groups: ["Shoes"] });
			expect(worn()).toEqual(["Shirt", "Heels"]);
			expect(local()).toContain("fuzzy confusion");
			expect(local()).toContain("struggle to remove");
		});
	});

	describe("ForceFollow / BreakFollow", () => {
		it("compels the player to follow the target, and forgetting breaks it", () => {
			hypno.ForceFollow(opts(), instruction(LSCGHypnoInstruction.follow, { speakerOnly: true }));
			expect(leashing.Pairings).toMatchObject([{ PairedMember: 2, Type: "compulsion", IsSource: false }]);
			expect(sent.beeps()[0]).toMatchObject({ target: 2, message: { command: { name: "add-leashing" } } });
			expect(sent.actions().at(-1)).toContain("follow Alice's every movement");

			hypno.BreakFollow(opts(), instruction(LSCGHypnoInstruction.forget));
			expect(leashing.Pairings).toEqual([]);
			expect(sent.beeps()[1]).toMatchObject({ target: 2, message: { command: { name: "remove-leashing" } } });
		});

		it("won't follow the player themself", () => {
			hypno.ForceFollow(opts(), instruction(LSCGHypnoInstruction.follow, { self: true }));
			expect(leashing.Pairings).toEqual([]);
			expect(local()).toContain("unable to find the person");
		});

		it("BreakFollow does nothing with no one to stop following", () => {
			hypno.BreakFollow(opts(), instruction(LSCGHypnoInstruction.forget));
			expect(sent.actions()).toEqual([]);
		});
	});

	describe("ForceMaidWork", () => {
		it("is refused by the maids without maid reputation", () => {
			vi.stubGlobal("ReputationCharacterGet", () => 0);
			hypno.ForceMaidWork(opts(), instruction(LSCGHypnoInstruction.maid));
			expect(sent.actions().at(-1)).toContain("maids refuse");
		});

		it("needs the player to walk and talk", () => {
			vi.stubGlobal("ReputationCharacterGet", () => 10);
			player().flags.canTalk = false;
			hypno.ForceMaidWork(opts(), instruction(LSCGHypnoInstruction.maid));
			expect(sent.actions().at(-1)).toContain("inability to both walk and talk");
		});

		it("sends the player off to serve drinks", () => {
			const maid = { CurrentDialog: "", Stage: "" };
			vi.stubGlobal("ReputationCharacterGet", () => 10);
			vi.stubGlobal("CharacterSetCurrent", vi.fn());
			vi.stubGlobal("MaidQuartersMaid", maid);
			vi.stubGlobal("MaidQuartersOnlineDrinkFromOwner", false);
			hypno.ForceMaidWork(opts(), instruction(LSCGHypnoInstruction.maid));
			expect(sent.actions().at(-1)).toContain("walks off in the direction of the maid quarters");
			expect(rawStub("CommonSetScreen")).toHaveBeenCalledWith("Room", "MaidQuarters");
			expect(maid.Stage).toBe("205");
		});
	});

	describe("BlankOutTriggers", () => {
		it("hides trigger words from an allowed speaker in immersive mode", () => {
			hypno.settings.trigger = "sleepy";
			hypno.settings.overrideMemberIds = "2";
			expect(hypno.BlankOutTriggers("so sleepy now", alice as never)).toBe("so sleepy now");
			states.settings.immersive = true;
			const out = hypno.BlankOutTriggers("so sleepy now", alice as never);
			expect(out).toMatch(/^so ⚠-+⚠ now$/);
		});
	});
});
