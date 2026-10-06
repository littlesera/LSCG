// Magic™ settings pages (DOM kit): tabs for local vs remote, the effect block table including extension and
// uninstalled effects, and the spell list and editor dialog (no effect-slot limit).
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { CoreModule } from "Modules/core";
import { MagicModule } from "Modules/magic";
import { StateModule } from "Modules/states";
import { OutfitCollectionModule } from "Modules/outfitCollection";
import { LSCGSpellEffect, OutfitOption, type MagicPublicSettingsModel, type SpellDefinition, type SpellEffectId } from "Settings/Models/magic";
import { OutfitCollection } from "Settings/OutfitCollection/outfitCollection";
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
        [, magic] = boot(new CoreModule(), new MagicModule(), new StateModule(), new OutfitCollectionModule());
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
        expect(tabsFor(false).map(t => t.label)).toEqual(["General", "Effects", "Spells", "Defense", "Remote access", "Astral projection"]);
        expect(tabsFor(true).map(t => t.label)).toEqual(["General", "Effects", "Defense", "Remote access"]);
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

        describe("effect order editor", () => {
            const openEditor = (sp: SpellDefinition) => {
                magic.settings.knownSpells = [sp];
                (render("Spells").querySelector(".lscg-kit-edit") as HTMLButtonElement).click();
                return document.querySelector("dialog") as HTMLDialogElement;
            };
            const dropdowns = (dialog: HTMLElement) => Array.from(dialog.querySelectorAll(".lscg-spell-effects select")) as HTMLSelectElement[];
            const options = (select: HTMLSelectElement) => Array.from(select.options).map(o => o.value);
            const choose = (dialog: HTMLElement, slot: number, value: string) => {
                const select = dropdowns(dialog)[slot];
                select.value = value;
                select.dispatchEvent(new Event("change"));
            };
            const labelOf = (select: HTMLSelectElement) => select.closest(".lscg-kit-row")!.querySelector("label")!.textContent;

            it("starts with a single dropdown to choose the first effect", () => {
                const dialog = openEditor(spell("new"));
                const selects = dropdowns(dialog);
                expect(selects).toHaveLength(1);
                expect(labelOf(selects[0])).toBe("Effect 1");
                expect(selects[0].selectedOptions[0].textContent).toBe("— choose an effect —");
                expect(options(selects[0])).toContain(LSCGSpellEffect.blindness);
            });

            it("adds another dropdown each time an effect is chosen, in order, up to the limit of 3", () => {
                const sp = spell("ordered");
                const dialog = openEditor(sp);
                choose(dialog, 0, LSCGSpellEffect.deafened);
                expect(dropdowns(dialog)).toHaveLength(2);
                expect(dropdowns(dialog)[1].selectedOptions[0].textContent).toBe("— add another effect —");
                choose(dialog, 1, LSCGSpellEffect.blindness);
                choose(dialog, 2, LSCGSpellEffect.muted);
                expect(sp.Effects).toEqual([LSCGSpellEffect.deafened, LSCGSpellEffect.blindness, LSCGSpellEffect.muted]);
                expect(dropdowns(dialog)).toHaveLength(3); // at the limit: no fourth dropdown
                expect(dropdowns(dialog).map(labelOf)).toEqual(["Effect 1", "Effect 2", "Effect 3"]);
            });

            it("the order of the dropdowns is the order of the spell's effects, and changing one keeps its place", () => {
                const sp = spell("ordered", [LSCGSpellEffect.blindness, LSCGSpellEffect.deafened, LSCGSpellEffect.muted]);
                const dialog = openEditor(sp);
                choose(dialog, 1, LSCGSpellEffect.frozen);
                expect(sp.Effects).toEqual([LSCGSpellEffect.blindness, LSCGSpellEffect.frozen, LSCGSpellEffect.muted]);
            });

            it("an effect already chosen in another dropdown isn't offered again", () => {
                const dialog = openEditor(spell("dupes", [LSCGSpellEffect.blindness, LSCGSpellEffect.deafened]));
                const [first, second, third] = dropdowns(dialog);
                expect(options(first)).toContain(LSCGSpellEffect.blindness); // its own choice stays
                expect(options(first)).not.toContain(LSCGSpellEffect.deafened);
                expect(options(second)).not.toContain(LSCGSpellEffect.blindness);
                expect(options(third)).not.toContain(LSCGSpellEffect.blindness);
                expect(options(third)).not.toContain(LSCGSpellEffect.deafened);
            });

            it("choosing remove takes that effect out and moves the later ones up", () => {
                const sp = spell("shrink", [LSCGSpellEffect.blindness, LSCGSpellEffect.deafened, LSCGSpellEffect.muted]);
                const dialog = openEditor(sp);
                expect(dropdowns(dialog)[0].selectedOptions[0].value).toBe(LSCGSpellEffect.blindness);
                expect(options(dropdowns(dialog)[0])[0]).toBe("");
                choose(dialog, 0, "");
                expect(sp.Effects).toEqual([LSCGSpellEffect.deafened, LSCGSpellEffect.muted]);
                expect(dropdowns(dialog)).toHaveLength(3); // two effects, plus room for another
                expect(dropdowns(dialog)[0].value).toBe(LSCGSpellEffect.deafened);
            });

            it("shows each chosen effect's description under its dropdown", () => {
                const dialog = openEditor(spell("desc", [LSCGSpellEffect.blindness]));
                expect(dropdowns(dialog)[0].closest(".lscg-kit-row")!.textContent).toContain("Prevents the target from seeing.");
            });

            it("keeps keyboard focus on the dropdown at the same position after a change", () => {
                const dialog = openEditor(spell("focus"));
                choose(dialog, 0, LSCGSpellEffect.blindness);
                expect(document.activeElement).toBe(dropdowns(dialog)[0]);
            });

            it("honours the player's own limit from their settings", () => {
                magic.settings.maxSpellEffects = 5;
                const dialog = openEditor(spell("big", [LSCGSpellEffect.blindness, LSCGSpellEffect.deafened, LSCGSpellEffect.muted]));
                expect(dropdowns(dialog)).toHaveLength(4);
                expect(dialog.textContent).toContain("Up to 5");
                magic.settings.maxSpellEffects = 1;
                document.body.replaceChildren();
                const small = openEditor(spell("small"));
                choose(small, 0, LSCGSpellEffect.blindness);
                expect(dropdowns(small)).toHaveLength(1);
            });

            it("falls back to 3 if the saved limit is missing or nonsense", () => {
                for (const bad of [undefined, 0, -2, 2.5, "7", Number.NaN]) {
                    (magic.settings as any).maxSpellEffects = bad;
                    document.body.replaceChildren();
                    expect(dropdowns(openEditor(spell("x", [LSCGSpellEffect.blindness, LSCGSpellEffect.deafened, LSCGSpellEffect.muted])))).toHaveLength(3);
                }
            });

            it("a spell already over the limit keeps its effects, offers no new dropdown, and says why", () => {
                magic.settings.maxSpellEffects = 2;
                const sp = spell("over", [LSCGSpellEffect.blindness, LSCGSpellEffect.deafened, LSCGSpellEffect.muted]);
                const dialog = openEditor(sp);
                expect(dropdowns(dialog)).toHaveLength(3);
                expect(dialog.textContent).toContain("more than your limit of 2");
                choose(dialog, 2, "");
                expect(sp.Effects).toHaveLength(2);
                expect(dialog.textContent).not.toContain("more than your limit");
            });

            it("offers extension effects, in the order chosen", () => {
                api.spells.registerEffect({ name: "bark", label: "Barking", description: "Woof.", apply: () => {} });
                const barkId = `${api.id}.bark` as SpellEffectId;
                const sp = spell("many");
                const dialog = openEditor(sp);
                expect(options(dropdowns(dialog)[0])).toContain(barkId);
                choose(dialog, 0, barkId);
                choose(dialog, 1, LSCGSpellEffect.blindness);
                expect(sp.Effects).toEqual([barkId, LSCGSpellEffect.blindness]);
                // The test DOM has no customizable selects, so options get the icon's text character.
                expect(dropdowns(dialog)[0].selectedOptions[0].textContent).toBe("\u2726 Barking");
                // Extension effects are listed under their own heading in the picker.
                const barkOption = dropdowns(dialog)[0].querySelector("optgroup[label='From extensions'] option");
                expect(barkOption?.textContent).toBe("\u2726 Barking");
            });

            it("keeps (and can replace or remove) an effect from an uninstalled extension", () => {
                const sp = spell("orphan", ["gone.effect" as SpellEffectId]);
                const dialog = openEditor(sp);
                const first = dropdowns(dialog)[0];
                expect(first.value).toBe("gone.effect");
                expect(first.selectedOptions[0].textContent).toBe("(unavailable) gone.effect");
                choose(dialog, 0, LSCGSpellEffect.blindness);
                expect(sp.Effects).toEqual([LSCGSpellEffect.blindness]);

                const sp2 = spell("orphan2", ["gone.effect" as SpellEffectId]);
                document.body.replaceChildren();
                const dialog2 = openEditor(sp2);
                choose(dialog2, 0, "");
                expect(sp2.Effects).toEqual([]);
            });

            it("adding a paired effect turns potions off", () => {
                const sp = spell("link");
                sp.AllowPotion = true;
                const dialog = openEditor(sp);
                choose(dialog, 0, LSCGSpellEffect.paired_arousal);
                expect(sp.AllowPotion).toBe(false);
            });

            describe("each effect's own settings", () => {
                const group = (dialog: HTMLElement, slot: number) => Array.from(dialog.querySelectorAll(".lscg-spell-effects > *"))[slot] as HTMLElement;
                const nested = (dialog: HTMLElement, slot: number) => group(dialog, slot).querySelector(".lscg-kit-expando") as HTMLDetailsElement | null;
                const rowIn = (scope: ParentNode, label: string) =>
                    Array.from(scope.querySelectorAll(".lscg-kit-row")).find(r => r.querySelector("label")?.textContent === label) as HTMLElement;
                const type = (el: HTMLInputElement, value: string) => { el.value = value; el.dispatchEvent(new Event("change")); };

                it("shows an effect's settings directly under its dropdown, and only for effects that have any", () => {
                    const dialog = openEditor(spell("cfg", [LSCGSpellEffect.blindness, LSCGSpellEffect.outfit]));
                    expect(nested(dialog, 0)).toBeNull();
                    const outfitGroup = group(dialog, 1);
                    expect(outfitGroup.className).toContain("lscg-spell-effect");
                    expect(outfitGroup.firstElementChild!.querySelector("label")!.textContent).toBe("Effect 2");
                    expect(nested(dialog, 1)).not.toBeNull();
                    // nothing is left over at the bottom of the dialog
                    expect(dialog.textContent).not.toContain("Which outfit the Outfit effect puts on");
                });

                it("are a collapsible section, set apart from the dialog by a teal border and, when open, a shadow", () => {
                    const dialog = openEditor(spell("expando", [LSCGSpellEffect.outfit]));
                    const section = nested(dialog, 0)!;
                    expect(section.tagName).toBe("DETAILS");
                    expect(section.querySelector("summary")).not.toBeNull();
                    expect(section.className).toContain("lscg-kit-expando");
                    // The look lives with the kit's styles (rendered here without the overlay host, so read the source).
                    const scss = readFileSync("src/Dom/kit.scss", "utf-8");
                    const block = scss.slice(scss.indexOf(".lscg-kit-expando {"), scss.indexOf(".lscg-kit-expando-summary"));
                    expect(block).toMatch(/--lscg-expando-tint:\s*#00d5d5/);
                    expect(block).toMatch(/border:[^;]*var\(--lscg-expando-tint\)/);
                    expect(block).toMatch(/&\[open\]\s*\{[^}]*box-shadow/);
                    expect(block).toMatch(/background-color:\s*var\(--lscg-background-color\)/); // the panel's own, so the row stripes look the same
                });

                it("open when the effect still needs something chosen, closed once it has been", () => {
                    const fresh = openEditor(spell("fresh", [LSCGSpellEffect.outfit]));
                    expect(nested(fresh, 0)!.open).toBe(true);

                    document.body.replaceChildren();
                    const done = spell("done", [LSCGSpellEffect.outfit]);
                    done.Outfit = { Code: "", Key: "Maid", Option: OutfitOption.both };
                    expect(nested(openEditor(done), 0)!.open).toBe(false);

                    document.body.replaceChildren();
                    const poly = spell("poly", [LSCGSpellEffect.polymorph]);
                    expect(nested(openEditor(poly), 0)!.open).toBe(true);
                    document.body.replaceChildren();
                    poly.Polymorph = { Code: "", Key: "Fox" } as never;
                    expect(nested(openEditor(poly), 0)!.open).toBe(false);
                });

                it("a newly added effect opens its settings", () => {
                    const dialog = openEditor(spell("added"));
                    choose(dialog, 0, LSCGSpellEffect.outfit);
                    expect(nested(dialog, 0)!.open).toBe(true);
                });

                it("the summary line describes the current settings, even while closed, and follows edits", () => {
                    const sp = spell("summary", [LSCGSpellEffect.outfit]);
                    sp.Outfit = { Code: "", Key: "Maid", Option: OutfitOption.clothes_only };
                    const dialog = openEditor(sp);
                    const summary = () => nested(dialog, 0)!.querySelector("summary")!.textContent;
                    expect(nested(dialog, 0)!.open).toBe(false);
                    expect(summary()).toBe("Outfit settings: Maid (Clothes Only)");
                    type(rowIn(nested(dialog, 0)!, "Other outfit").querySelector("input") as HTMLInputElement, "Fox");
                    expect(summary()).toBe("Outfit settings: Fox (Clothes Only)");
                    type(rowIn(nested(dialog, 0)!, "Other outfit").querySelector("input") as HTMLInputElement, "");
                    expect(summary()).toBe("Outfit settings: no outfit chosen yet (Clothes Only)");
                });

                it("remembers which sections the player opened or closed when the list rebuilds", () => {
                    const sp = spell("remember", [LSCGSpellEffect.outfit, LSCGSpellEffect.polymorph]);
                    sp.Outfit = { Code: "", Key: "Maid", Option: OutfitOption.both };       // closed by default
                    const dialog = openEditor(sp);
                    expect(nested(dialog, 0)!.open).toBe(false);
                    expect(nested(dialog, 1)!.open).toBe(true);                             // nothing chosen: open by default

                    const first = nested(dialog, 0)!;
                    first.open = true; first.dispatchEvent(new Event("toggle"));
                    const second = nested(dialog, 1)!;
                    second.open = false; second.dispatchEvent(new Event("toggle"));

                    choose(dialog, 2, LSCGSpellEffect.blindness);                           // rebuilds the list
                    expect(nested(dialog, 0)!.open).toBe(true);
                    expect(nested(dialog, 1)!.open).toBe(false);
                });

                it("the settings come and go with the effect, and follow it when the order changes", () => {
                    const sp = spell("move", [LSCGSpellEffect.outfit, LSCGSpellEffect.blindness]);
                    const dialog = openEditor(sp);
                    expect(nested(dialog, 0)).not.toBeNull();
                    choose(dialog, 0, "");                       // outfit removed: blindness moves to slot 1
                    expect(dialog.querySelector(".lscg-kit-expando")).toBeNull();
                    choose(dialog, 1, LSCGSpellEffect.outfit);   // added in the second slot
                    expect(nested(dialog, 1)).not.toBeNull();
                    expect(nested(dialog, 0)).toBeNull();
                });

                // The collection reads player settings the harness doesn't have; stub just the list of saved names.
                const savedOutfits = (...names: string[]) => vi.spyOn(OutfitCollection.prototype, "GetOutfitNames").mockReturnValue(names);
                afterEach(() => vi.restoreAllMocks());

                it("Outfit: which outfit, from the saved ones or typed in, and which parts to put on", () => {
                    savedOutfits("Maid");
                    const sp = spell("outfit");
                    const dialog = openEditor(sp);
                    choose(dialog, 0, LSCGSpellEffect.outfit);
                    const panel = nested(dialog, 0)!;

                    const picker = rowIn(panel, "Outfit").querySelector("select") as HTMLSelectElement;
                    expect(Array.from(picker.options).map(o => o.textContent)).toEqual(["— none, or typed below —", "Maid"]);
                    picker.value = "Maid"; picker.dispatchEvent(new Event("change"));
                    expect(sp.Outfit?.Key).toBe("Maid");

                    const typed = rowIn(nested(dialog, 0)!, "Other outfit").querySelector("input") as HTMLInputElement;
                    expect(typed.value).toBe(""); // a saved outfit isn't repeated in the text box
                    type(typed, "  My MBS Set ");
                    expect(sp.Outfit?.Key).toBe("My MBS Set");
                    const after = nested(dialog, 0)!;
                    expect((rowIn(after, "Outfit").querySelector("select") as HTMLSelectElement).value).toBe("");
                    expect((rowIn(after, "Other outfit").querySelector("input") as HTMLInputElement).value).toBe("My MBS Set");

                    const parts = rowIn(after, "Parts to put on").querySelector("select") as HTMLSelectElement;
                    expect(parts.value).toBe(OutfitOption.both);
                    parts.value = OutfitOption.binds_only; parts.dispatchEvent(new Event("change"));
                    expect(sp.Outfit?.Option).toBe(OutfitOption.binds_only);
                });

                it("an outfit chosen earlier is shown when the spell is reopened", () => {
                    savedOutfits("Maid");
                    const sp = spell("saved", [LSCGSpellEffect.outfit]);
                    sp.Outfit = { Code: "", Key: "maid", Option: OutfitOption.clothes_only };
                    const dialog = openEditor(sp);
                    const panel = nested(dialog, 0)!;
                    expect((rowIn(panel, "Outfit").querySelector("select") as HTMLSelectElement).value).toBe("Maid"); // matched ignoring case
                    expect((rowIn(panel, "Parts to put on").querySelector("select") as HTMLSelectElement).value).toBe(OutfitOption.clothes_only);
                });

                it("says when there are no saved outfits", () => {
                    savedOutfits();
                    const dialog = openEditor(spell("none", [LSCGSpellEffect.outfit]));
                    expect(nested(dialog, 0)!.textContent).toContain("You have no saved LSCG outfits");
                });

                it("Polymorph: which outfit and which parts of the body", () => {
                    const sp = spell("poly");
                    const dialog = openEditor(sp);
                    choose(dialog, 0, LSCGSpellEffect.polymorph);
                    const panel = () => nested(dialog, 0)!;
                    type(rowIn(panel(), "Other outfit").querySelector("input") as HTMLInputElement, "Fox");
                    expect(sp.Polymorph?.Key).toBe("Fox");

                    const box = (label: string) => rowIn(panel(), label).querySelector("input[type=checkbox]") as HTMLInputElement;
                    box("Cosplay").checked = true; box("Cosplay").dispatchEvent(new Event("change"));
                    expect(sp.Polymorph?.IncludeCosplay).toBe(true);

                    expect(box("Hair").disabled).toBe(false);
                    box("Whole body").checked = true; box("Whole body").dispatchEvent(new Event("change"));
                    expect(sp.Polymorph).toMatchObject({ IncludeAllBody: true, IncludeHair: true, IncludeSkin: true, IncludeGenitals: true });
                    expect(box("Hair").disabled).toBe(true);
                    expect(box("Genitals").disabled).toBe(true);
                });

                it("both can be on one spell, each with its own settings in its own place", () => {
                    const sp = spell("both", [LSCGSpellEffect.polymorph, LSCGSpellEffect.outfit]);
                    const dialog = openEditor(sp);
                    expect(rowIn(nested(dialog, 0)!, "Whole body")).toBeDefined();
                    expect(rowIn(nested(dialog, 1)!, "Parts to put on")).toBeDefined();
                    expect(rowIn(nested(dialog, 0)!, "Parts to put on")).toBeUndefined();
                    type(rowIn(nested(dialog, 0)!, "Other outfit").querySelector("input") as HTMLInputElement, "A");
                    type(rowIn(nested(dialog, 1)!, "Other outfit").querySelector("input") as HTMLInputElement, "B");
                    expect(sp.Polymorph?.Key).toBe("A");
                    expect(sp.Outfit?.Key).toBe("B");
                });

                it("editing a setting doesn't rebuild the effect list, so keyboard focus isn't lost", () => {
                    const sp = spell("focus", [LSCGSpellEffect.outfit]);
                    const dialog = openEditor(sp);
                    const dropdown = dropdowns(dialog)[0];
                    const text = rowIn(nested(dialog, 0)!, "Other outfit").querySelector("input") as HTMLInputElement;
                    type(text, "Anything");
                    expect(dropdowns(dialog)[0]).toBe(dropdown);
                    expect(rowIn(nested(dialog, 0)!, "Other outfit").querySelector("input")).toBe(text);
                });

                it("a setting change still updates the spell list behind the dialog", () => {
                    const sp = spell("table", [LSCGSpellEffect.outfit]);
                    const dialog = openEditor(sp);
                    const rerender = vi.spyOn(document, "createElement");
                    type(rowIn(nested(dialog, 0)!, "Other outfit").querySelector("input") as HTMLInputElement, "X");
                    expect(rerender).toHaveBeenCalled(); // the spells table re-renders its rows
                    rerender.mockRestore();
                });

                it("an extension effect has no settings", () => {
                    api.spells.registerEffect({ name: "bark", label: "Barking", description: "", apply: () => {} });
                    const dialog = openEditor(spell("ext", [`${api.id}.bark` as SpellEffectId]));
                    expect(nested(dialog, 0)).toBeNull();
                });
            });

            it("the spell list's effect chips follow the new order", () => {
                const sp = spell("chips");
                const dialog = openEditor(sp);
                choose(dialog, 0, LSCGSpellEffect.muted);
                choose(dialog, 1, LSCGSpellEffect.blindness);
                const chips = Array.from(document.querySelectorAll("tbody .lscg-kit-chip")).map(c => c.textContent);
                expect(chips).toEqual(["Gagged", "Blinding"]);
            });
        });
    });

    describe("Defense tab", () => {
        const labels = (root: HTMLElement) => Array.from(root.querySelectorAll(".lscg-kit-row label")).map(l => l.textContent);

        it("edits the wearer's settings, and leaves out the wearer-only ones for a remote view", () => {
            magic.settings.limitedDuration = true;
            const local = render("Defense");
            const maxBox = Array.from(local.querySelectorAll(".lscg-kit-row")).find(r => r.querySelector("label")?.textContent === "Maximum duration (minutes)")!.querySelector("input") as HTMLInputElement;
            maxBox.value = "30";
            maxBox.dispatchEvent(new Event("change"));
            expect(magic.settings.maxDuration).toBe(30);
            expect(local.textContent).toContain("Require whitelist");

            const target = { enabled: true, lockable: false, locked: false } as unknown as MagicPublicSettingsModel;
            expect(render("Defense", true, target).textContent).not.toContain("Require whitelist");
        });

        it("no longer holds the remote access settings, which have their own tab", () => {
            const defense = labels(render("Defense"));
            for (const remoteRow of ["Allow remote access", "Lockable", "Allowed members", "Requires trance", "Only the hypnotizer"])
                expect(defense).not.toContain(remoteRow);
            expect(render("Defense").textContent).not.toContain("Remote access");
        });
    });

    describe("Remote access tab", () => {
        const row = (root: HTMLElement, label: string) =>
            Array.from(root.querySelectorAll(".lscg-kit-row")).find(r => r.querySelector("label")?.textContent === label) as HTMLElement;
        const input = (root: HTMLElement, label: string) => row(root, label).querySelector("input") as HTMLInputElement;
        const flip = (el: HTMLInputElement, checked: boolean) => { el.checked = checked; el.dispatchEvent(new Event("change")); };

        it("is its own tab, for the wearer and for a remote view", () => {
            expect(tabsFor(false).map(t => t.label)).toContain("Remote access");
            expect(tabsFor(true).map(t => t.label)).toContain("Remote access");
        });

        it("the wearer chooses who can change their settings, and the rest follow from allowing it", () => {
            magic.settings.remoteAccess = false;
            const root = render("Remote access");
            expect(root.textContent).toContain("Let other players change your Magic™ settings");
            expect(input(root, "Lockable").disabled).toBe(true);
            expect(input(root, "Allowed members").disabled).toBe(true);
            expect(input(root, "Requires trance").disabled).toBe(true);
            expect(input(root, "Only the hypnotizer").disabled).toBe(true);

            flip(input(root, "Allow remote access"), true);
            expect(magic.settings.remoteAccess).toBe(true);
            expect(input(root, "Lockable").disabled).toBe(false);
            expect(input(root, "Allowed members").disabled).toBe(false);
            expect(input(root, "Requires trance").disabled).toBe(false);

            flip(input(root, "Lockable"), true);
            expect(magic.settings.lockable).toBe(true);
            const members = input(root, "Allowed members");
            members.value = "12, 34"; members.dispatchEvent(new Event("change"));
            expect(magic.settings.remoteMemberIds).toBe("12, 34");
        });

        it("'Only the hypnotizer' needs the trance requirement", () => {
            magic.settings.remoteAccess = true;
            magic.settings.remoteAccessRequiredTrance = true;
            const root = render("Remote access");
            expect(input(root, "Only the hypnotizer").disabled).toBe(false);
            flip(input(root, "Requires trance"), false);
            expect(magic.settings.remoteAccessRequiredTrance).toBe(false);
            expect(input(root, "Only the hypnotizer").disabled).toBe(true);
        });

        it("a remote view locks or unlocks the wearer, only if they allow it, and sets the trance rules", () => {
            const target = { enabled: true, lockable: false, locked: false, remoteAccessRequiredTrance: true, limitRemoteAccessToHypnotizer: true } as unknown as MagicPublicSettingsModel;
            const root = render("Remote access", true, target);
            expect(root.textContent).toContain("How remote access to this player's Magic™ settings works.");
            expect(input(root, "Locked").disabled).toBe(true);
            expect(root.textContent).not.toContain("Allow remote access");
            expect(root.textContent).not.toContain("Allowed members");

            target.lockable = true;
            const again = render("Remote access", true, target);
            flip(input(again, "Locked"), true);
            expect(target.locked).toBe(true);

            flip(input(again, "Requires trance"), false);
            expect(target.remoteAccessRequiredTrance).toBe(false);
            expect(input(again, "Only the hypnotizer").disabled).toBe(true);
        });
    });
});
