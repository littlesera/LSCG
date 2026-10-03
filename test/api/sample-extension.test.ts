// Runs examples/sample-extension.js, the example in docs/api.md, against the real API, so the example can't
// silently drift from it: everything it registers is there, nothing it does throws, and pasting it twice is safe.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { CoreModule } from "Modules/core";
import { ActivityModule } from "Modules/activities";
import { ConsentModule } from "Modules/consent";
import { HypnoModule } from "Modules/hypno";
import { InjectorModule } from "Modules/injector";
import { LeashingModule } from "Modules/leashing";
import { StateModule } from "Modules/states";
import { announceReady, installLoadQueue } from "api";
import { extensions } from "api/extensions";
import { extensionActivities, extensionPrerequisites } from "api/activities";
import { extensionDrugs } from "api/drugs";
import { extensionScreens } from "api/settings";
import { spellEffects } from "Modules/Magic/spellEffects";
import { boot, resetWorld } from "../harness/world";

const source = readFileSync("examples/sample-extension.js", "utf8"); // tests run from the repo root
/** Runs the example the way pasting it into the console would. */
const paste = () => new Function(source)();

describe("examples/sample-extension.js", () => {
    let injector: InjectorModule;
    let states: StateModule;
    const g = globalThis as any;

    beforeAll(() => {
        // The same modules the drug tests boot: the injector leans on the others.
        [, , , , injector, , states] = boot(
            new CoreModule(), new ConsentModule(), new ActivityModule(), new LeashingModule(),
            new InjectorModule(), new HypnoModule(), new StateModule(),
        );
        installLoadQueue();
        announceReady();
    });

    beforeEach(() => {
        resetWorld({ MemberNumber: 1, LSCG: { GlobalModule: { enabled: true } } });
        states.init();
        injector.init();
        injector.settings.enabled = true;
        // BC's chat commands: the example adds one with CommandCombine and checks Commands to avoid duplicates.
        g.Commands = [];
        g.CommandCombine = vi.fn((cmds: { Tag: string }[]) => { g.Commands.push(...cmds); });
    });

    afterEach(() => {
        extensions.get("sample")?.dispose();
        delete (window as any).__lscgSampleApi;
    });

    const sample = () => extensions.get("sample")!;
    const command = () => (g.Commands as { Tag: string; Action: () => void }[]).find(c => c.Tag === "sample-dose")!;
    const localNotes = () => (g.ChatRoomSendLocal as ReturnType<typeof vi.fn>).mock.calls.map(c => String(c[0]));

    it("registers everything the docs describe, without errors", () => {
        paste();
        expect(sample()).toBeDefined();
        expect(spellEffects.get("sample.bark")).toBeDefined();
        expect(extensionActivities.get("sample.headpat")).toBeDefined();
        expect(extensionDrugs.get("sample.giggle")).toBeDefined();
        expect(extensionScreens.get("sample.greeting")).toBeDefined();
        expect(command()).toBeDefined();
        expect(sample().errorCount).toBe(0);
        expect(extensionPrerequisites.all().filter(p => p.id.startsWith("sample.")).length).toBe(0); // it adds none
    });

    it("can be pasted twice: the second copy replaces the first", () => {
        paste();
        const first = sample();
        expect(() => paste()).not.toThrow();
        expect(first.disposed).toBe(true);
        expect(sample()).not.toBe(first);
        expect(spellEffects.get("sample.bark")).toBeDefined();
        expect((g.Commands as { Tag: string }[]).filter(c => c.Tag === "sample-dose").length).toBe(1);
    });

    it("narrates the sedative's stages as the bar fills and empties", () => {
        paste();
        const max = injector.settings.sedativeMax * injector.drugLevelMultiplier;
        injector.sedativeLevel = max * 0.6;
        expect(localNotes()).toEqual(["[Sample] Your head swims a little.", "[Sample] Your eyelids feel heavy."]);
        injector.sedativeLevel = max * 0.1;
        expect(localNotes().at(-1)).toBe("[Sample] Your head clears.");
        injector.sedativeLevel = 0;
    });

    it("/sample-dose doses the sedative only once the player has enabled it", () => {
        paste();
        injector.settings.enableSedative = false;
        command().Action();
        expect(localNotes().at(-1)).toContain("Nothing happened");
        expect(injector.sedativeLevel).toBe(0);

        injector.settings.enableSedative = true;
        command().Action();
        expect(injector.sedativeLevel).toBeGreaterThan(0);
        injector.sedativeLevel = 0;
    });
});
