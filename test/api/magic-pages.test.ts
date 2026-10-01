// Magic™ settings pages (DOM kit): tabs for local vs remote, the effect block table including extension and
// uninstalled effects, and the spell list and editor dialog (no effect-slot limit).
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { MagicModule } from "Modules/magic";
import { StateModule } from "Modules/states";
import { LSCGSpellEffect, type MagicPublicSettingsModel, type SpellDefinition, type SpellEffectId } from "Settings/Models/magic";
import { allEffectIds, legacyEffectIds } from "Modules/Magic/spellEffects";
import { KitContext } from "../../src/Dom/kit";
import { buildMagicTabs } from "../../src/Settings/magic-pages";
import { registerExtension, type ModApiHandle } from "api/extensions";
import { boot, resetWorld } from "../harness/world";

describe("Magic™ settings pages", () => {
    let magic: MagicModule;
    let api: ModApiHandle;
    let ids = 0;

    beforeAll(() => {
        // jsdom has no <dialog> modal support; the kit's openDialog only needs the element attached and open.
        HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) { this.setAttribute("open", ""); };
        HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) { this.removeAttribute("open"); this.dispatchEvent(new Event("close")); };
        [, magic] = boot(new CoreModule(), new MagicModule(), new StateModule());
    });

    beforeEach(() => {
        resetWorld({ MemberNumber: 1, Nickname: "Sera", LSCG: { GlobalModule: { enabled: true } } });
        magic.settings.enabled = true;
        magic.settings.knownSpells = [];
        magic.settings.blockedSpellEffects = [];
        magic.settings.bypassForSelfEffects = [];
        api = registerExtension({ id: `pages-${++ids}`, name: "Page Pack", version: "1" });
    });

    afterEach(() => {
        api.dispose();
        document.body.replaceChildren();
    });

    const tabsFor = (remote: boolean, settings: MagicPublicSettingsModel = magic.settings, effects: SpellEffectId[] = allEffectIds(), ctx = new KitContext()) =>
        buildMagicTabs(ctx, settings, { remote, effects });
    const render = (label: string, remote = false, settings: MagicPublicSettingsModel = magic.settings, effects?: SpellEffectId[], ctx?: KitContext) => {
        const root = document.createElement("div");
        document.body.append(root);
        root.append(...tabsFor(remote, settings, effects, ctx).find(t => t.label === label)!.render());
        return root;
    };
    const rowFor = (root: HTMLElement, text: string) =>
        Array.from(root.querySelectorAll("tbody tr")).find(tr => tr.textContent?.includes(text)) as HTMLTableRowElement;

    it("offers every tab to the wearer, and no spell editing or astral projection remotely", () => {
        expect(tabsFor(false).map(t => t.label)).toEqual(["General", "Effects", "Spells", "Defense", "Astral projection"]);
        expect(tabsFor(true).map(t => t.label)).toEqual(["General", "Effects", "Defense"]);
    });

    describe("Effects tab", () => {
        it("lists every effect, including extension effects with their source", () => {
            api.spells.registerEffect({ name: "bark", label: "Barking", description: "Woof.", apply: () => {} });
            const root = render("Effects");
            expect(root.querySelectorAll("tbody tr")).toHaveLength(allEffectIds().length);
            const row = rowFor(root, "Barking");
            expect(row.textContent).toContain("Page Pack");
            expect(row.textContent).toContain("Woof.");
        });

        it("has no add or delete controls (the list is fixed)", () => {
            const root = render("Effects");
            expect(root.querySelector(".lscg-kit-add")).toBeNull();
            expect(root.querySelector(".lscg-kit-delete")).toBeNull();
        });

        it("blocking an effect stores it, and Allow self only works on a blocked effect", () => {
            const root = render("Effects");
            const row = rowFor(root, "Blinding");
            const [block, allowSelf] = Array.from(row.querySelectorAll("input[type=checkbox]")) as HTMLInputElement[];
            expect(allowSelf.disabled).toBe(true);

            block.checked = true;
            block.dispatchEvent(new Event("change"));
            expect(magic.settings.blockedSpellEffects).toContain(LSCGSpellEffect.blindness);

            const allowSelfNow = Array.from(rowFor(root, "Blinding").querySelectorAll("input[type=checkbox]"))[1] as HTMLInputElement;
            expect(allowSelfNow.disabled).toBe(false);
            allowSelfNow.checked = true;
            allowSelfNow.dispatchEvent(new Event("change"));
            expect(magic.settings.bypassForSelfEffects).toContain(LSCGSpellEffect.blindness);
        });

        it("unblocking also clears the self-bypass", () => {
            magic.settings.blockedSpellEffects = [LSCGSpellEffect.blindness];
            magic.settings.bypassForSelfEffects = [LSCGSpellEffect.blindness];
            const root = render("Effects");
            const block = rowFor(root, "Blinding").querySelector("input[type=checkbox]") as HTMLInputElement;
            block.checked = false;
            block.dispatchEvent(new Event("change"));
            expect(magic.settings.blockedSpellEffects).not.toContain(LSCGSpellEffect.blindness);
            expect(magic.settings.bypassForSelfEffects).not.toContain(LSCGSpellEffect.blindness);
        });

        it("keeps a block on an uninstalled extension's effect visible, so it can be removed", () => {
            magic.settings.blockedSpellEffects = ["gone.effect" as SpellEffectId];
            const row = rowFor(render("Effects"), "(unavailable) gone.effect");
            expect(row).toBeDefined();
            expect(row.textContent).toContain("not installed");
            const block = row.querySelector("input[type=checkbox]") as HTMLInputElement;
            expect(block.checked).toBe(true);
            block.checked = false;
            block.dispatchEvent(new Event("change"));
            expect(magic.settings.blockedSpellEffects).toEqual([]);
        });

        it("remote view lists only what the target supports and edits the target's public settings", () => {
            api.spells.registerEffect({ name: "bark", label: "Barking", description: "", apply: () => {} });
            const target = { enabled: true, blockedSpellEffects: [], bypassForSelfEffects: [] } as unknown as MagicPublicSettingsModel;
            const ctx = new KitContext(vi.fn());
            const root = render("Effects", true, target, legacyEffectIds(), ctx);
            expect(root.querySelectorAll("tbody tr")).toHaveLength(legacyEffectIds().length);
            expect(rowFor(root, "Barking")).toBeUndefined();

            const block = rowFor(root, "Deafening").querySelector("input[type=checkbox]") as HTMLInputElement;
            block.checked = true;
            block.dispatchEvent(new Event("change"));
            expect(target.blockedSpellEffects).toContain(LSCGSpellEffect.deafened);
        });
    });

    describe("Spells tab", () => {
        const spell = (name: string, effects: SpellEffectId[] = []): SpellDefinition => ({ Name: name, Creator: 1, Effects: effects, AllowPotion: false, AllowVoiceCast: false });

        it("adds a new spell, up to the known-spells limit", () => {
            const root = render("Spells");
            (root.querySelector(".lscg-kit-add") as HTMLButtonElement).click();
            expect(magic.settings.knownSpells).toHaveLength(1);
            expect(magic.settings.knownSpells[0]).toMatchObject({ Name: "Spell No. 1", Creator: 1, Effects: [], AllowPotion: false, AllowVoiceCast: false });
        });

        it("shows each spell's effects as chips, marking effects from missing extensions", () => {
            magic.settings.knownSpells = [spell("mixed", [LSCGSpellEffect.blindness, "gone.effect" as SpellEffectId])];
            const chips = Array.from(render("Spells").querySelectorAll(".lscg-kit-chip")).map(c => c.textContent);
            expect(chips).toEqual(["Blinding", "(unavailable) gone.effect"]);
        });

        it("renames a spell, and refuses to blank its name", () => {
            magic.settings.knownSpells = [spell("old")];
            const root = render("Spells");
            const name = root.querySelector("tbody input[type=text]") as HTMLInputElement;
            name.value = "new name";
            name.dispatchEvent(new Event("change"));
            expect(magic.settings.knownSpells[0].Name).toBe("new name");

            const name2 = root.querySelector("tbody input[type=text]") as HTMLInputElement;
            name2.value = "";
            name2.dispatchEvent(new Event("change"));
            expect(magic.settings.knownSpells[0].Name).toBe("new name");
        });

        it("potions can't be enabled for a spell with a paired effect", () => {
            magic.settings.knownSpells = [spell("link", [LSCGSpellEffect.paired_arousal])];
            magic.settings.knownSpells[0].AllowPotion = true;
            const potion = render("Spells").querySelectorAll("tbody input[type=checkbox]")[1] as HTMLInputElement;
            expect(potion.disabled).toBe(true);
            expect(potion.checked).toBe(false);
        });

        it("the editor dialog can give a spell any number of effects, including extension effects", () => {
            api.spells.registerEffect({ name: "bark", label: "Barking", description: "Woof.", apply: () => {} });
            const barkId = `${api.id}.bark` as SpellEffectId;
            magic.settings.knownSpells = [spell("many")];
            const root = render("Spells");
            (root.querySelector(".lscg-kit-edit") as HTMLButtonElement).click();
            const dialog = document.querySelector("dialog") as HTMLDialogElement;
            const effectBox = (label: string) => Array.from(dialog.querySelectorAll(".lscg-kit-row"))
                .find(r => r.querySelector("label")?.textContent === label)!.querySelector("input[type=checkbox]") as HTMLInputElement;

            for (const label of ["Blinding", "Deafening", "Gagged", "Petrifying", "Barking"]) {
                const box = effectBox(label);
                box.checked = true;
                box.dispatchEvent(new Event("change"));
            }
            expect(magic.settings.knownSpells[0].Effects).toEqual([
                LSCGSpellEffect.blindness, LSCGSpellEffect.deafened, LSCGSpellEffect.muted, LSCGSpellEffect.frozen, barkId,
            ]);

            const barking = effectBox("Barking");
            barking.checked = false;
            barking.dispatchEvent(new Event("change"));
            expect(magic.settings.knownSpells[0].Effects).not.toContain(barkId);
        });

        it("the editor keeps (and can remove) an effect from an uninstalled extension", () => {
            magic.settings.knownSpells = [spell("orphan", ["gone.effect" as SpellEffectId])];
            (render("Spells").querySelector(".lscg-kit-edit") as HTMLButtonElement).click();
            const dialog = document.querySelector("dialog") as HTMLDialogElement;
            const row = Array.from(dialog.querySelectorAll(".lscg-kit-row")).find(r => r.querySelector("label")?.textContent === "(unavailable) gone.effect")!;
            const box = row.querySelector("input[type=checkbox]") as HTMLInputElement;
            expect(box.checked).toBe(true);
            box.checked = false;
            box.dispatchEvent(new Event("change"));
            expect(magic.settings.knownSpells[0].Effects).toEqual([]);
        });

        it("adding a paired effect turns potions off; outfit and polymorph options show only for those effects", () => {
            magic.settings.knownSpells = [spell("link")];
            magic.settings.knownSpells[0].AllowPotion = true;
            (render("Spells").querySelector(".lscg-kit-edit") as HTMLButtonElement).click();
            const dialog = document.querySelector("dialog") as HTMLDialogElement;
            const rows = () => Array.from(dialog.querySelectorAll(".lscg-kit-row")) as HTMLElement[];
            const rowByLabel = (label: string) => rows().find(r => r.querySelector("label")?.textContent === label)!;
            const toggleEffect = (label: string) => {
                const box = rowByLabel(label).querySelector("input[type=checkbox]") as HTMLInputElement;
                box.checked = true;
                box.dispatchEvent(new Event("change"));
            };

            // The "Outfit" effect checkbox shares its label with the config text field; only the text field hides.
            const outfitRows = () => rows().filter(r => r.querySelector("label")?.textContent === "Outfit" && r.querySelector("input[type=text]"));
            expect(outfitRows().every(r => r.hidden)).toBe(true);
            toggleEffect("Outfit");
            expect(outfitRows().some(r => !r.hidden)).toBe(true);

            toggleEffect("Pairing");
            expect(magic.settings.knownSpells[0].AllowPotion).toBe(false);
        });
    });

    describe("Defense tab", () => {
        it("edits the wearer's settings, and shows remote-only wording and controls for a remote view", () => {
            magic.settings.limitedDuration = true;
            const local = render("Defense");
            const maxBox = Array.from(local.querySelectorAll(".lscg-kit-row")).find(r => r.querySelector("label")?.textContent === "Maximum duration (minutes)")!.querySelector("input") as HTMLInputElement;
            maxBox.value = "30";
            maxBox.dispatchEvent(new Event("change"));
            expect(magic.settings.maxDuration).toBe(30);
            expect(local.textContent).toContain("Require whitelist");

            const target = { enabled: true, lockable: false, locked: false } as unknown as MagicPublicSettingsModel;
            const remote = render("Defense", true, target);
            expect(remote.textContent).not.toContain("Require whitelist");
            const locked = Array.from(remote.querySelectorAll(".lscg-kit-row")).find(r => r.querySelector("label")?.textContent === "Locked")!.querySelector("input") as HTMLInputElement;
            expect(locked.disabled).toBe(true);
        });
    });
});
