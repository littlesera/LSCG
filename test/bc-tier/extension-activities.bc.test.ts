// Extension activities against the *real* BC client: BC's own lookups find the activity, offer it on the right
// groups, resolve its menu text, and run its namespaced prerequisite through the real ActivityCheckPrerequisite
// hook chain. What the fake-BC unit tests (test/api/activities.test.ts) can't prove.
//
// Registration runs at plain module top level, as in activity-registry.bc.test.ts: bc-globals.ts has already
// loaded the real client by the time this file's code executes.
import { describe, expect, it } from "vitest";
import { registerModule } from "modules";
import { ActivityModule } from "Modules/activities";
import { ConsentModule } from "Modules/consent";
import { CoreModule } from "Modules/core";
import { CollarModule } from "Modules/collar";
import { HypnoModule } from "Modules/hypno";
import { LeashingModule } from "Modules/leashing";
import { SplatterModule } from "Modules/splatter";
import { StateModule } from "Modules/states";
import { registerExtension } from "api/extensions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

registerModule(new CoreModule()).init();
registerModule(new ConsentModule());
registerModule(new CollarModule());
registerModule(new HypnoModule());
registerModule(new LeashingModule());
registerModule(new SplatterModule());
registerModule(new StateModule());
const activities = registerModule(new ActivityModule());
activities.init();
activities.load();

const api = registerExtension({ id: "bc-ext", name: "BC Extension", version: "1" });
const NAME = "LSCG_bc-ext.pat";

api.activities.registerPrerequisite({ name: "first-member-only", check: ({ acting }) => acting.MemberNumber === 1 });
api.activities.register({
    name: "pat",
    prerequisites: ["first-member-only"],
    targets: [{ group: "ItemHead", label: "Pat head", action: "SourceCharacter pats TargetCharacter." }],
});

function makeCharacter(memberNumber: number): Character {
    const C = g.CharacterCreate("Female3DCG", g.CharacterType.ONLINE, memberNumber);
    C.MemberNumber = memberNumber;
    return C;
}

/** What BC does for an activity, going through the (patched) global like the game does in a browser. The loader runs
 *  BC's scripts so that BC's own ActivityCheckPrerequisites calls the unpatched original, which would answer "true"
 *  for any name it doesn't know, so it can't be used to prove the hook. */
const prerequisitesMet = (a: Activity, acting: Character, acted: Character) =>
    (a.Prerequisite ?? []).every(p => g.ActivityCheckPrerequisite(p, acting, acted, headGroup()));

const headGroup = () => (g.AssetGroup as AssetGroup[]).find(a => a.Name === "ItemHead")!;
const activity = () => g.AssetGetActivity("Female3DCG", NAME) as Activity | null;

describe("extension activities (real BC data)", () => {
    it("BC finds the activity by its name", () => {
        expect(activity()).toMatchObject({ Name: NAME, Target: ["ItemHead"], Prerequisite: ["bc-ext.first-member-only", "ZoneAccessible"] });
    });

    it("BC offers it on the groups it targets, and only those", () => {
        const names = (group: string) => (g.AssetActivitiesForGroup("Female3DCG", group, "other") as Activity[]).map(a => a.Name);
        expect(names("ItemHead")).toContain(NAME);
        expect(names("ItemFeet")).not.toContain(NAME);
    });

    it("every target group is a real BC item group (catches typos in extensions)", () => {
        for (const group of activity()!.Target ?? [])
            expect((g.AssetGroup as AssetGroup[]).some(a => a.Name === group && a.Category === "Item")).toBe(true);
    });

    it("its menu text resolves from BC's activity dictionary", () => {
        const cache = g.ActivityDictionaryLoad().cache as Record<string, string>;
        expect(cache[`Label-ChatOther-ItemHead-${NAME}`]).toBe("Pat head");
        expect(cache[`ChatOther-ItemHead-${NAME}`]).toBe("SourceCharacter pats TargetCharacter.");
    });

    it("its namespaced prerequisite runs through BC's real prerequisite checks", () => {
        const first = makeCharacter(1);
        const second = makeCharacter(2);
        expect(prerequisitesMet(activity()!, first, second)).toBe(true);
        expect(prerequisitesMet(activity()!, second, first)).toBe(false);
    });

    it("an extension's prerequisite can sit alongside BC's own and both must pass", () => {
        const handle = registerExtension({ id: "bc-ext-two", name: "Two", version: "1" });
        handle.activities.registerPrerequisite({ name: "always", check: () => true });
        handle.activities.register({
            name: "both",
            prerequisites: ["UseArms", "always"],
            targets: [{ group: "ItemHead", action: "x" }],
        });
        const both = g.AssetGetActivity("Female3DCG", "LSCG_bc-ext-two.both") as Activity;
        const free = makeCharacter(3);
        expect(prerequisitesMet(both, free, free)).toBe(true);
        handle.dispose();
    });

    it("disposing removes it from BC's lookups", () => {
        const handle = registerExtension({ id: "bc-ext-gone", name: "Gone", version: "1" });
        handle.activities.register({ name: "poof", targets: [{ group: "ItemHead", action: "x" }] });
        expect(g.AssetGetActivity("Female3DCG", "LSCG_bc-ext-gone.poof")).not.toBeNull();
        handle.dispose();
        expect(g.AssetGetActivity("Female3DCG", "LSCG_bc-ext-gone.poof")).toBeNull();
        expect((g.AssetActivitiesForGroup("Female3DCG", "ItemHead", "other") as Activity[]).some(a => (a.Name as string) === "LSCG_bc-ext-gone.poof")).toBe(false);
    });
});
