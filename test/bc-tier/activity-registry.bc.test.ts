// T1: the activity registry contract, checked generically over every activity
// LSCG registers into the *real* ActivityFemale3DCG (not a fake array), and
// every custom prerequisite it wires into the real ActivityCheckPrerequisite
// hook chain. Table-driven rather than one test per activity: this is exactly
// the kind of "every entry satisfies the same invariants" case the plan calls
// for a data-driven check instead of hand enumeration.
//
// Registration runs at plain module top level (not inside beforeAll()): this
// file's describe.each() below needs the real activity list *before* it runs,
// and describe.each() bodies are evaluated at collection time -- before any
// beforeAll would get a chance to run. bc-globals.ts (this project's
// setupFiles entry) has already loaded the real BC client by the time this
// file's own top-level code executes, so CharacterCreate/AssetGroup/etc. are
// already real here too.
import { describe, expect, it } from "vitest";
import { registerModule } from "modules";
import { ActivityModule, type ActivityTarget } from "Modules/activities";
import { ConsentModule } from "Modules/consent";
import { CoreModule } from "Modules/core";
import { CollarModule } from "Modules/collar";
import { HypnoModule } from "Modules/hypno";
import { LeashingModule } from "Modules/leashing";
import { SplatterModule } from "Modules/splatter";
import { StateModule } from "Modules/states";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

registerModule(new CoreModule()).init();
registerModule(new ConsentModule());
// Several custom prerequisites reach these via getModule() (e.g.
// CheckTongueGrabbing -> this.leashingModule.IsCustomGagged) -- plain
// registration (no init()/load()) is enough for the getters to resolve.
registerModule(new CollarModule());
registerModule(new HypnoModule());
registerModule(new LeashingModule());
registerModule(new SplatterModule());
registerModule(new StateModule());
const activities = registerModule(new ActivityModule());
activities.init();
activities.load();

function dictText(key: string): string | undefined {
	return g.ActivityDictionaryLoad().cache[key];
}

describe("activity registry contract (real BC data)", () => {
	it("registered at least the activities and prerequisites this module is known to add", () => {
		const lscgActivities = (g.ActivityFemale3DCG as { Name: string }[]).filter(a => a.Name.startsWith("LSCG_"));
		expect(lscgActivities.length).toBeGreaterThanOrEqual(30);
		expect(activities.PatchedActivities.length).toBeGreaterThanOrEqual(19);
		expect(activities.CustomPrerequisiteFuncs.size).toBeGreaterThan(0);
	});

	describe.each(
		(g.ActivityFemale3DCG as { Name: string; Target?: string[]; TargetSelf?: string[] | boolean }[])
			.filter(a => a.Name.startsWith("LSCG_")),
	)("$Name", (activity) => {
		it("is listed in ActivityFemale3DCGOrdering", () => {
			expect(g.ActivityFemale3DCGOrdering).toContain(activity.Name);
		});

		it("has a resolvable label and action text for every configured target group", () => {
			for (const groupName of activity.Target ?? []) {
				expect(dictText(`Label-ChatOther-${groupName}-${activity.Name}`), `Label-ChatOther-${groupName}-${activity.Name}`).toBeTruthy();
				expect(dictText(`ChatOther-${groupName}-${activity.Name}`), `ChatOther-${groupName}-${activity.Name}`).toBeTruthy();
			}
			if (Array.isArray(activity.TargetSelf)) {
				for (const groupName of activity.TargetSelf) {
					expect(dictText(`Label-ChatSelf-${groupName}-${activity.Name}`), `Label-ChatSelf-${groupName}-${activity.Name}`).toBeTruthy();
					expect(dictText(`ChatSelf-${groupName}-${activity.Name}`), `ChatSelf-${groupName}-${activity.Name}`).toBeTruthy();
				}
			}
		});
	});

	describe.each(activities.PatchedActivities)("patched BC activity: %s", (activityName) => {
		it("still exists in the real ActivityFemale3DCG (PatchActivity only ever mutates a real entry)", () => {
			expect((g.ActivityFemale3DCG as { Name: string }[]).some(a => a.Name === activityName)).toBe(true);
		});
	});

	it("every custom prerequisite is actually referenced by at least one activity's Prerequisite list (no dead registrations)", () => {
		// RegisterCustomFuncs() (activities.ts) always does both halves of the
		// wiring together -- pushes the name into activity.Prerequisite *and*
		// registers its func -- so the only way these two could drift apart is
		// a name registered without ever being attached to an activity.
		const allPrereqLists = (g.ActivityFemale3DCG as { Prerequisite?: string[] }[]).flatMap(a => a.Prerequisite ?? []);
		for (const name of activities.CustomPrerequisiteFuncs.keys()) {
			expect(allPrereqLists, `"${name}" is registered but not referenced by any activity`).toContain(name);
		}
	});

	it("the real ActivityCheckPrerequisite hook actually routes to a custom prerequisite's own function", () => {
		const acting = g.CharacterCreate("Female3DCG", g.CharacterType.PLAYER, 1);
		const acted = g.CharacterCreate("Female3DCG", g.CharacterType.NPC, 2);
		const group = g.AssetGroup.find((grp: { Name: string }) => grp.Name === "ItemHead");
		// CanHeadbutt (Headbutt activity): true unless the acting character has a
		// fixed head. Exercised through the real, hooked global, not by calling
		// the stored function directly, so this also proves the hookFunction
		// wiring (priority 100 over ActivityCheckPrerequisite) actually works.
		expect(g.ActivityCheckPrerequisite("CanHeadbutt", acting, acted, group)).toBe(true);
		acting.Effect = ["FixedHead"];
		expect(g.ActivityCheckPrerequisite("CanHeadbutt", acting, acted, group)).toBe(false);
	});

	it("every registered custom prerequisite function runs without throwing for a representative character/group", () => {
		const acting = g.CharacterCreate("Female3DCG", g.CharacterType.PLAYER, 1);
		const acted = g.CharacterCreate("Female3DCG", g.CharacterType.NPC, 2);
		const group = g.AssetGroup.find((grp: { Name: string }) => grp.Name === "ItemMouth");

		for (const [name, func] of activities.CustomPrerequisiteFuncs) {
			expect(() => func(acting, acted, group), `prerequisite "${name}" threw`).not.toThrow();
		}
	});

	it("AddCustomPrereq is first-wins: a duplicate registration does not replace the original", () => {
		const first = () => true;
		const second = () => false;
		activities.AddCustomPrereq({ Name: "__test_dupe__" as never, Func: first });
		activities.AddCustomPrereq({ Name: "__test_dupe__" as never, Func: second });
		expect(activities.CustomPrerequisiteFuncs.get("__test_dupe__" as never)).toBe(first);
	});

	it("PatchActivity only patches an activity that actually exists in ActivityFemale3DCG", () => {
		const before = activities.PatchedActivities.length;
		activities.PatchActivity({ ActivityName: "__does_not_exist__", AddedTargets: [{ Name: "ItemMouth" } as ActivityTarget] });
		expect(activities.PatchedActivities.length).toBe(before); // silently no-ops
	});

	it("PatchActivity's AddedPrerequisites appends a named prerequisite onto the real activity", () => {
		// "Caress" isn't one of LSCG's own patched activities, so this is isolated from any
		// real patch's own Prerequisite state.
		const activity = (g.ActivityFemale3DCG as { Name: string; Prerequisite: string[] }[]).find(a => a.Name === "Caress")!;
		const before = activity.Prerequisite.length;
		activities.PatchActivity({ ActivityName: "Caress", AddedPrerequisites: ["__test_added_prereq__" as never] });
		expect(activity.Prerequisite).toContain("__test_added_prereq__");
		expect(activity.Prerequisite.length).toBe(before + 1);
	});

	it("PatchActivity's AddedPrerequisites does not add a duplicate if already present", () => {
		const activity = (g.ActivityFemale3DCG as { Name: string; Prerequisite: string[] }[]).find(a => a.Name === "Caress")!;
		activities.PatchActivity({ ActivityName: "Caress", AddedPrerequisites: ["__test_dedup_prereq__" as never] });
		const afterFirst = activity.Prerequisite.length;
		activities.PatchActivity({ ActivityName: "Caress", AddedPrerequisites: ["__test_dedup_prereq__" as never] });
		expect(activity.Prerequisite.length).toBe(afterFirst);
	});
});
