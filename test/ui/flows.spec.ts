import { expect, test } from "./fixtures";

test("Activities: clicking a zone on the character picks it, and settings for it save", async ({ bc }) => {
    await bc.openSettings("Activities");
    const canvas = bc.page.locator("canvas.lscg-kit-zones");
    const box = (await canvas.boundingBox())!;
    // The mouth zone is [100,130,100,70] in the character's 500x1000 space, inside 6px of padding.
    await canvas.click({ position: { x: (6 + 150) / 512 * box.width, y: (6 + 165) / 1012 * box.height } });
    await expect(bc.page.getByLabel("Activity", { exact: true })).toBeVisible();
    await bc.page.getByLabel("Can induce trance").check();

    const saved = await bc.run(() => (window as any).Player.LSCG.ActivityModule.activities);
    // New accounts start with some default entries, so look for ours among them.
    expect(saved).toContainEqual(expect.objectContaining({ group: "ItemMouth", hypno: true }));
});

test("zone picker drawings ignore the player's own tint, blur and blindness", async ({ bc }) => {
    const result = await bc.run(async () => {
        const w = window as any;
        const original = { HasTints: w.Player.HasTints, GetTints: w.Player.GetTints, GetBlurLevel: w.Player.GetBlurLevel };
        Object.assign(w.Player, { HasTints: () => true, GetTints: () => [{ r: 148, g: 0, b: 211, a: 0.4 }], GetBlurLevel: () => 6, IsBlind: () => true, GetBlindLevel: () => 3 });
        await w.Playground.openSettings();
        await new Promise(r => setTimeout(r, 250));
        await w.Playground.openSettings("Activities");
        const canvas = document.querySelector("canvas.lscg-kit-zones") as HTMLCanvasElement;
        // Thigh skin: untinted it's a warm light pink (red high, blue lower), never the purple tint's blue-heavy mix.
        // The picker shows only its grey zone boxes until the character's images have loaded, so wait for skin.
        const pixel = () => [...canvas.getContext("2d")!.getImageData(230, 640, 1, 1).data];
        const start = Date.now();
        while (Date.now() - start < 45_000) {
            const [pr, pg, pb] = pixel();
            if (!(pr === pg && pg === pb)) break; // grey: the zone fill, not skin
            await new Promise(r => setTimeout(r, 250));
        }
        const [r, , b] = pixel();
        return { r, b, blindLevelStillSet: w.Player.GetBlindLevel() === 3, tintsRestored: w.Player.GetTints !== original.GetTints };
    });
    expect(result.r).toBeGreaterThan(result.b);
    expect(result.blindLevelStillSet, "the player's own effects are put back after drawing").toBe(true);
});

test("Outfit Collection: renaming updates everything that names the outfit, and won't overwrite another", async ({ bc }) => {
    const result = await bc.run(async () => {
        const w = window as any;
        const mod = w.LSCG.getModule("OutfitCollectionModule");
        const code = w.LZString.compressToBase64(JSON.stringify([{ Group: "Cloth", Name: "CollegeOutfit1" }]));
        mod.data.SetOutfitCode("Base Look", code, [], false);
        mod.data.SetOutfitCode("Maid", code, ["Base Look"], false);
        const L = w.Player.LSCG;
        L.CursedItemModule.CursedItems = [{ Name: "Curse", Enabled: true, OutfitKey: "base look" }];
        L.MagicModule.spiritFormOutfitKey = "Base Look";

        const refused = mod.RenameOutfit("Maid", "base look");
        const renamed = mod.RenameOutfit("Base Look", "Basics");
        return {
            refused, renamed,
            names: mod.data.GetOutfitNames().sort(),
            maidInherits: mod.data.GetOutfit("maid").inherit,
            cursed: L.CursedItemModule.CursedItems[0].OutfitKey,
            spirit: L.MagicModule.spiritFormOutfitKey,
        };
    });
    expect(result).toEqual({ refused: false, renamed: true, names: ["Basics", "Maid"], maidInherits: ["Basics"], cursed: "Basics", spirit: "Basics" });
});

test("Outfit Collection: the editor can't save over another outfit's name, and cleans up its preview", async ({ bc }) => {
    await bc.openSettings("Outfit Collection");
    const result = await bc.run(async () => {
        const w = window as any;
        const data = w.LSCG.getModule("OutfitCollectionModule").data;
        const code = w.LZString.compressToBase64(JSON.stringify([{ Group: "Cloth", Name: "CollegeOutfit1" }]));
        data.SetOutfitCode("Base Look", code, [], false);
        data.SetOutfitCode("Maid", code, [], false);
        const gui = w.LSCG.getModule("GUI").currentSubscreen;
        // BC keeps a couple of helper characters for good once it first needs them, so count only the preview.
        const characters = () => w.Character.filter((c: any) => String(c.CharacterID).includes("LSCGOutfitsCollection")).length;
        const before = characters();
        gui.clickOutfit("Maid");
        for (let i = 0; i < 120 && !document.getElementById("lscg-outfit-edit-outfit-name"); i++) await new Promise(r => setTimeout(r, 250));
        const name = document.getElementById("lscg-outfit-edit-outfit-name") as HTMLInputElement;
        name.value = "base look";
        name.dispatchEvent(new Event("input"));
        const saveDisabled = (document.getElementById("lscg-outfit-edit-accept") as HTMLButtonElement).disabled;
        const editing = characters() - before;
        gui.CancelOutfit();
        return { saveDisabled, editing, afterClose: characters() - before, names: data.GetOutfitNames().sort() };
    });
    expect(result).toEqual({ saveDisabled: true, editing: 1, afterClose: 0, names: ["Base Look", "Maid"] });
});

test("spell menu: a spell the target blocks can't be cast", async ({ bc }) => {
    const cards = await bc.run(async () => {
        const w = window as any;
        const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
        w.Player.LSCG.MagicModule.knownSpells = [
            { Name: "Wake Up", Creator: w.Player.MemberNumber, Effects: ["Hypnotizing"], AllowPotion: false, AllowVoiceCast: false },
            { Name: "Sleepy Time", Creator: w.Player.MemberNumber, Effects: ["Slumbering"], AllowPotion: false, AllowVoiceCast: true },
        ];
        const target = w.Playground.addCharacter({ lscg: { MagicModule: { enabled: true, blockedSpellEffects: ["Slumbering"] } } });
        await w.CommonSetScreen("Room", "MainHall");
        await wait(800);
        w.CharacterSetCurrent(target);
        await wait(400);
        w.LSCG.getModule("MagicModule").OpenSpellMenu(target);
        await wait(500);
        return [...document.querySelectorAll<HTMLButtonElement>(".lscg-spellmenu-card")]
            .map(c => ({ name: c.querySelector(".lscg-spellmenu-name")?.textContent, disabled: c.disabled }));
    });
    expect(cards).toEqual([{ name: "Wake Up", disabled: false }, { name: "Sleepy Time", disabled: true }]);
});

test("remote settings: changes made on another player are sent back when leaving", async ({ bc }) => {
    await bc.run(async () => {
        const w = window as any;
        const target = w.Playground.addCharacter({
            lscg: { HypnoModule: { enabled: true, remoteAccess: true, remoteAccessRequiredTrance: false, limitRemoteAccessToHypnotizer: false } },
        });
        await w.Playground.openProfile(target);
        await new Promise(r => setTimeout(r, 500));
    });
    // The remote button on the profile page is drawn on BC's canvas, so it's clicked there, once the
    // "LSCG loaded" toast (which sits over that corner for a few seconds) is out of the way.
    await bc.page.evaluate(() => document.querySelectorAll("[class*=toast]").forEach(t => t.remove()));
    const at = await bc.run(() => (window as any).Playground.toPage(120, 90));
    await bc.page.mouse.click(at.x, at.y);
    await bc.page.waitForFunction(() => (window as any).LSCG.getModule("RemoteUIModule").currentSubscreen?.name === "MainMenu");

    const sent = await bc.run(async () => {
        const w = window as any;
        const remote = w.LSCG.getModule("RemoteUIModule");
        remote.currentSubscreen = remote.currentSubscreen.subscreens.find((s: any) => s.name === "Triggered Hypnosis");
        await new Promise(r => setTimeout(r, 400));
        const triggers = document.querySelector(".lscg-kit-panel:not([hidden]) input[type=text]") as HTMLInputElement;
        triggers.value = "obey";
        triggers.dispatchEvent(new Event("change"));
        const before = w.Playground.sent.length;
        remote.currentSubscreen.Exit();
        await new Promise(r => setTimeout(r, 300));
        return JSON.stringify(w.Playground.sent.slice(before)).includes("obey");
    });
    expect(sent).toBe(true);
});

test("Outfit Collection: the creator round-trips through BC's appearance editor back into the outfit editor", async ({ bc }) => {
    await bc.openSettings("Outfit Collection");
    const result = await bc.run(async () => {
        const w = window as any;
        const wait = async (cond: () => boolean) => { for (let i = 0; i < 120 && !cond(); i++) await new Promise(r => setTimeout(r, 250)); };
        const gui = () => w.LSCG.getModule("GUI").currentSubscreen;
        const input = () => document.getElementById("lscg-outfit-edit-outfit-input") as HTMLInputElement | null;
        const leftovers = () => w.Character.filter((c: any) => String(c.CharacterID).includes("OutfitCreator")).length;

        gui().NewOutfit();
        await wait(() => !!document.getElementById("lscg-outfit-edit-build"));
        (document.getElementById("lscg-outfit-edit-build") as HTMLButtonElement).click();
        await wait(() => w.CurrentScreen === "Appearance");
        const inAppearance = w.CurrentScreen === "Appearance";
        w.InventoryWear(w.CharacterAppearanceSelection, "CollegeOutfit1", "Cloth");
        w.CharacterAppearanceReady(w.CharacterAppearanceSelection);

        await wait(() => w.CurrentScreen === "Preference" && !!input()?.value);
        const code = input()?.value ?? "";
        const bundles = code ? JSON.parse(w.LZString.decompressFromBase64(code)) : [];
        return { inAppearance, screen: w.CurrentScreen, sub: gui()?.name, hasCloth: bundles.some((b: any) => b.Group === "Cloth" && b.Name === "CollegeOutfit1"), leftovers: leftovers() };
    });
    expect(result).toEqual({ inAppearance: true, screen: "Preference", sub: "Outfit Collection", hasCloth: true, leftovers: 0 });
});

test("Outfit Collection: the item panel sets, configures, colors and removes an item with BC's own widgets", async ({ bc }) => {
    await bc.openSettings("Outfit Collection");
    const result = await bc.run(async () => {
        const w = window as any;
        const wait = async (cond: () => boolean) => { for (let i = 0; i < 120 && !cond(); i++) await new Promise(r => setTimeout(r, 100)); };
        const gui = () => w.LSCG.getModule("GUI").currentSubscreen;
        const $ = (id: string) => document.getElementById("lscg-outfit-edit-" + id) as any;
        const bundle = () => {
            const code = $("outfit-input").value;
            return (code ? JSON.parse(w.LZString.decompressFromBase64(code)) : []).find((b: any) => b.Group === "ItemMouth");
        };
        const out: any = {};

        gui().NewOutfit();
        await wait(() => $("item-group")?.options.length > 0);
        $("item-group").value = "ItemMouth";
        $("item-group").dispatchEvent(new Event("change"));
        [...$("item-cells").querySelectorAll(".lscg-item-cell")].find((c: any) => c.getAttribute("aria-label") === "Ball Gag").click();
        out.set = bundle()?.Name;
        out.configureEnabled = !$("item-configure").disabled;

        // Configure: BC's extended dialog takes over, and an option set through it lands in the outfit
        $("item-configure").click();
        out.extendedFocus = w.DialogFocusItemName;
        await wait(() => true);
        await new Promise(r => setTimeout(r, 300)); // a few frames of the real Draw
        w.TypedItemSetOptionByName(gui().preview, "ItemMouth", "Tight", false);
        w.DialogLeaveFocusItem();
        await wait(() => bundle()?.Property?.TypeRecord?.typed === 2);
        out.typed = bundle()?.Property?.TypeRecord?.typed;
        out.focusAfterExtended = w.DialogFocusItem;
        out.editorShown = $("item-open").closest("#lscg-outfit-edit").style.visibility;

        // Color: BC's color widget, closed with its own save
        $("item-color").click();
        await wait(() => !!ItemColorState && !!ItemColorItem);
        await new Promise(r => setTimeout(r, 600)); // the opacity module adds its controls once the picker has loaded
        out.layerControls = document.querySelectorAll("[id^=lscg-layers]").length > 0; // LSCG's opacity/translation apply to restraints too
        // ...but lead-lined is dropped by BC from every bundle, so it's hidden rather than left as a dead control
        out.leadLinedHidden = getComputedStyle(document.querySelector("#lscg-layers-lead-lined-check")!.closest("label")!).display === "none";
        // What those controls store: BC's own Opacity (via the picker's state) and LSCG's layer translation, both of which
        // BC's property whitelist lets into a bundle. LSCGLeadLined isn't on it, so BC drops that one from every bundle.
        ItemColorState.opacity = ItemColorState.opacity.map(() => 0.5);
        ItemColorItem.Property.LayerOverrides = ItemColorItem.Asset.Layer.map(() => ({ DrawingLeft: { "": 12 }, DrawingTop: { "": -3 } }));
        ItemColorItem.Color = ["#ff0000"];
        w.ItemColorSaveAndExit();
        await wait(() => bundle()?.Color === "#ff0000");
        out.color = bundle()?.Color;
        const prop = bundle()?.Property;
        out.opacity = [].concat(prop?.Opacity)[0];
        out.translation = prop?.LayerOverrides?.[0]?.DrawingLeft?.[""];

        $("item-remove").click();
        out.removed = bundle() === undefined;
        return out;
    });
    expect(result).toEqual({
        set: "BallGag", configureEnabled: true, layerControls: true, leadLinedHidden: true, extendedFocus: "ItemMouthBallGag", typed: 2,
        focusAfterExtended: null, editorShown: "visible", color: "#ff0000", opacity: 0.5, translation: 12, removed: true,
    });
});

test("Outfit Collection: a modular item's module screens work with real clicks, and the exit door closes the dialog", async ({ bc }) => {
    await bc.openSettings("Outfit Collection");
    const click = async (x: number, y: number) => {
        const pt = await bc.run(([x, y]) => (window as any).Playground.toPage(x, y), [x, y]);
        await bc.page.mouse.click(pt.x, pt.y);
        await bc.page.waitForTimeout(400);
    };
    await bc.run(async () => {
        const w = window as any;
        const $ = (id: string) => document.getElementById("lscg-outfit-edit-" + id) as any;
        const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
        w.LSCG.getModule("GUI").currentSubscreen.NewOutfit();
        await wait(1200);
        $("item-group").value = "ItemLegs"; $("item-group").dispatchEvent(new Event("change"));
        [...$("item-cells").querySelectorAll(".lscg-item-cell")].find((c: any) => c.getAttribute("aria-label") === "Barrel Corset").click();
        await wait(800);
        $("item-configure").click();
        await wait(1200);
    });
    await click(1360, 812); // "Belly belt" module
    await click(1700, 637); // its "Equipped" option
    const result = await bc.run(async () => {
        const w = window as any;
        const gui = w.LSCG.getModule("GUI").currentSubscreen;
        const out: any = {};
        out.stillFocused = !!DialogFocusItem; // picking an option returns to the item's main screen
        gui.Exit(); // closes the dialog
        await new Promise(r => setTimeout(r, 400));
        out.closed = !DialogFocusItem;
        out.sub = gui.name;
        const code = (document.getElementById("lscg-outfit-edit-outfit-input") as HTMLInputElement).value;
        const b = JSON.parse(w.LZString.decompressFromBase64(code)).find((b: any) => b.Group === "ItemLegs");
        out.record = b?.Property?.TypeRecord;
        return out;
    });
    expect(result.stillFocused).toBe(true);
    expect(result.closed).toBe(true);
    expect(result.sub).toBe("Outfit Collection");
    expect(JSON.stringify(result.record)).toMatch(/1/); // some module moved off its default
});

test("Outfit Collection: Build edits the outfit as it is, so a new one starts as your naked self and a saved one has its items", async ({ bc }) => {
    await bc.openSettings("Outfit Collection");
    const result = await bc.run(async () => {
        const w = window as any;
        const wait = async (cond: () => boolean) => { for (let i = 0; i < 120 && !cond(); i++) await new Promise(r => setTimeout(r, 100)); };
        const $ = (id: string) => document.getElementById("lscg-outfit-edit-" + id) as any;
        const gui = () => w.LSCG.getModule("GUI").currentSubscreen;
        const out: any = {};

        gui().NewOutfit();
        await wait(() => !!gui().preview && !!$("build"));
        await new Promise(r => setTimeout(r, 800));
        $("build").click();
        await wait(() => w.CurrentScreen === "Appearance");
        out.newGoesToAppearance = w.CurrentScreen === "Appearance";
        out.newHasCloth = !!w.InventoryGet(w.CharacterAppearanceSelection, "Cloth");
        w.CharacterAppearanceExit(w.CharacterAppearanceSelection); // cancel
        await wait(() => w.CurrentScreen === "Preference" && gui()?.SelectedOutfit && !!$("build"));

        w.LSCG.getModule("OutfitCollectionModule").data.SetOutfitCode("Saved", w.LZString.compressToBase64(JSON.stringify([{ Group: "Cloth", Name: "CollegeOutfit1" }])), [], false);
        gui().clickOutfit("Saved");
        await wait(() => !!$("build"));
        await new Promise(r => setTimeout(r, 1200));
        $("build").click();
        await wait(() => w.CurrentScreen === "Appearance");
        out.savedHasCloth = !!w.InventoryGet(w.CharacterAppearanceSelection, "Cloth");
        return out;
    });
    expect(result).toEqual({ newGoesToAppearance: true, newHasCloth: false, savedHasCloth: true });
});

test("Outfit Collection: accepting the creator keeps the outfit's own groups and what changed, not the untouched body", async ({ bc }) => {
    await bc.openSettings("Outfit Collection");
    const result = await bc.run(async () => {
        const w = window as any;
        const wait = async (cond: () => boolean) => { for (let i = 0; i < 120 && !cond(); i++) await new Promise(r => setTimeout(r, 100)); };
        const gui = () => w.LSCG.getModule("GUI").currentSubscreen;
        w.LSCG.getModule("OutfitCollectionModule").data.SetOutfitCode("Saved", w.LZString.compressToBase64(JSON.stringify([{ Group: "Cloth", Name: "CollegeOutfit1" }])), [], false);
        gui().clickOutfit("Saved");
        await wait(() => !!document.getElementById("lscg-outfit-edit-build") && !!gui().preview);
        await new Promise(r => setTimeout(r, 800));
        (document.getElementById("lscg-outfit-edit-build") as HTMLButtonElement).click();
        await wait(() => w.CurrentScreen === "Appearance");
        w.InventoryWear(w.CharacterAppearanceSelection, "Socks1", "Socks");
        w.CharacterAppearanceReady(w.CharacterAppearanceSelection);
        await wait(() => w.CurrentScreen === "Preference" && !!(document.getElementById("lscg-outfit-edit-outfit-input") as HTMLInputElement | null)?.value);
        const code = (document.getElementById("lscg-outfit-edit-outfit-input") as HTMLInputElement).value;
        return JSON.parse(w.LZString.decompressFromBase64(code)).map((b: any) => b.Group).sort();
    });
    expect(result).toEqual(["Cloth", "Socks"]);
});

test("Outfit Collection: clicking a zone on the character picks its group, empty or not", async ({ bc }) => {
    await bc.openSettings("Outfit Collection");
    await bc.run(async () => {
        (window as any).LSCG.getModule("GUI").currentSubscreen.NewOutfit();
        await new Promise(r => setTimeout(r, 1500));
    });
    // The mouth zone is [100,130,100,70] in the character's 500x1000 space; the preview is drawn at (200,175) at 0.78.
    const pt = await bc.run(() => (window as any).Playground.toPage(200 + 150 * 0.78, 175 + 165 * 0.78));
    await bc.page.mouse.click(pt.x, pt.y);
    await bc.page.waitForTimeout(300);
    const picked = await bc.run(async () => {
        const grid = document.getElementById("lscg-outfit-edit-item-grid") as HTMLElement;
        const cells = grid.querySelectorAll<HTMLButtonElement>(".lscg-item-cell");
        const gag = [...cells].find(c => c.textContent?.trim() === "Ball Gag");
        const out: any = {
            group: (document.getElementById("lscg-outfit-edit-item-group") as HTMLSelectElement).value,
            gridOpen: !grid.hidden, cells: cells.length > 3,
        };
        await new Promise(r => setTimeout(r, 1500)); // BC loads the preview images
        const canvas = gag?.querySelector("canvas") as HTMLCanvasElement;
        out.previewDrawn = !!canvas && [...canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data].some((v, i) => i % 4 === 0 && v < 200);
        out.previewTransparent = canvas.getContext("2d")!.getImageData(2, 2, 1, 1).data[3] === 0; // so a cell's highlight shows behind the picture
        gag?.dispatchEvent(new MouseEvent("mouseenter"));
        const tip = document.getElementById("lscg-outfit-edit-item-tip") as HTMLElement;
        out.tip = tip.hidden ? "hidden" : tip.innerText;
        gag?.dispatchEvent(new MouseEvent("mouseleave"));
        out.tipHides = tip.hidden;
        out.title = (document.getElementById("lscg-outfit-edit-item-grid-title") as HTMLElement).innerText;
        (document.getElementById("lscg-outfit-edit-item-close") as HTMLButtonElement).click(); // the close button
        out.closedByButton = grid.hidden;
        (document.getElementById("lscg-outfit-edit-item-open") as HTMLButtonElement).click();
        out.reopened = !grid.hidden;
        [...grid.querySelectorAll<HTMLButtonElement>(".lscg-item-cell")].find(c => c.textContent?.trim() === "Ball Gag")?.click(); // picking a cell puts the item on and closes the grid
        await new Promise(r => setTimeout(r, 400));
        out.gridClosed = grid.hidden;
        const code = (document.getElementById("lscg-outfit-edit-outfit-input") as HTMLInputElement).value;
        out.inCode = JSON.parse((window as any).LZString.decompressFromBase64(code)).some((b: any) => b.Group === "ItemMouth" && b.Name === "BallGag");
        return out;
    });
    expect(picked).toEqual({
        group: "ItemMouth", gridOpen: true, cells: true, previewDrawn: true, previewTransparent: true,
        tip: "Ball Gag", tipHides: true, title: "Mouth", closedByButton: true, reopened: true, gridClosed: true, inCode: true,
    });
});

test("Outfit Collection: the creator's appearance screen still shows the character to a blind, tinted player", async ({ bc }) => {
    await bc.openSettings("Outfit Collection");
    const skin = await bc.run(async () => {
        const w = window as any;
        const wait = async (cond: () => boolean) => { for (let i = 0; i < 120 && !cond(); i++) await new Promise(r => setTimeout(r, 100)); };
        w.LSCG.getModule("GUI").currentSubscreen.NewOutfit();
        await wait(() => !!document.getElementById("lscg-outfit-edit-build"));
        Object.assign(w.Player, { IsBlind: () => true, GetBlindLevel: () => 3, HasTints: () => true, GetTints: () => [{ r: 148, g: 0, b: 211, a: 0.6 }], GetBlurLevel: () => 4 });
        (document.getElementById("lscg-outfit-edit-build") as HTMLButtonElement).click();
        await wait(() => w.CurrentScreen === "Appearance");
        await new Promise(r => setTimeout(r, 2500));
        // The character's torso. BC hides other characters from a blind viewer, and tints and blurs the rest.
        const px = (MainCanvas.canvas as HTMLCanvasElement).getContext("2d")!.getImageData(915, 375, 1, 1).data;
        return [px[0], px[1], px[2]];
    });
    // Light skin, not the dark dressing-room background that shows when the character isn't drawn
    expect(skin[0]).toBeGreaterThan(190);
    expect(skin[0]).toBeGreaterThanOrEqual(skin[2]);
});

test("Escape backs out one layer at a time and only the main menu leaves LSCG", async ({ bc }) => {
    await bc.openSettings("Outfit Collection");
    const state = () => bc.run(() => {
        const g = (window as any).LSCG.getModule("GUI").currentSubscreen;
        return { focus: !!DialogFocusItem, editor: !!g?.SelectedOutfit, sub: g?.name, extension: !!PreferenceExtensionsCurrent };
    });
    const escape = async () => { await bc.page.keyboard.press("Escape"); await bc.page.waitForTimeout(500); };
    await bc.run(async () => {
        const $ = (id: string) => document.getElementById("lscg-outfit-edit-" + id) as any;
        (window as any).LSCG.getModule("GUI").currentSubscreen.NewOutfit();
        await new Promise(r => setTimeout(r, 1200));
        $("item-group").value = "ItemMouth"; $("item-group").dispatchEvent(new Event("change"));
        [...$("item-cells").querySelectorAll(".lscg-item-cell")].find((c: any) => c.getAttribute("aria-label") === "Ball Gag").click();
        await new Promise(r => setTimeout(r, 500));
        $("item-configure").click();
        await new Promise(r => setTimeout(r, 800));
    });
    expect(await state()).toEqual({ focus: true, editor: true, sub: "Outfit Collection", extension: true });
    await escape();
    expect(await state()).toEqual({ focus: false, editor: true, sub: "Outfit Collection", extension: true });
    await escape();
    expect(await state()).toEqual({ focus: false, editor: false, sub: "Outfit Collection", extension: true });
    await escape();
    expect(await state()).toEqual({ focus: false, editor: false, sub: "MainMenu", extension: true });
    await escape();
    expect((await state()).extension).toBe(false);
});

test("the lead-lined checkbox is only hidden for the outfit editor's characters, not for the player's own items", async ({ bc }) => {
    const hidden = await bc.run(async () => {
        const w = window as any;
        w.InventoryWear(w.Player, "CollegeOutfit1", "Cloth");
        const item = w.InventoryGet(w.Player, "Cloth");
        await ItemColorLoad(w.Player, item, 1090, 15, 885, 970, true);
        await new Promise(r => setTimeout(r, 600));
        const box = document.querySelector("#lscg-layers-lead-lined-check");
        const out = box ? getComputedStyle(box.closest("label")!).display === "none" : "no controls";
        ItemColorExitClick();
        return out;
    });
    expect(hidden).toBe(false);
});

test("Outfit Collection: colouring draws the character at centre, so dragging to translate a layer works on it", async ({ bc }) => {
    await bc.openSettings("Outfit Collection");
    await bc.run(async () => {
        const w = window as any;
        const $ = (id: string) => document.getElementById("lscg-outfit-edit-" + id) as any;
        w.LSCG.getModule("GUI").currentSubscreen.NewOutfit();
        await new Promise(r => setTimeout(r, 1200));
        $("item-group").value = "ItemMouth"; $("item-group").dispatchEvent(new Event("change"));
        [...$("item-cells").querySelectorAll(".lscg-item-cell")].find((c: any) => c.getAttribute("aria-label") === "Ball Gag").click();
        await new Promise(r => setTimeout(r, 500));
        $("item-color").click();
        await new Promise(r => setTimeout(r, 1500));
        ([...document.querySelectorAll("#lscg-layers-tabs .lscg-layers-tab")].find(b => b.textContent === "Translate") as HTMLElement).click();
    });
    const from = await bc.run(() => (window as any).Playground.toPage(930, 400));
    const to = await bc.run(() => (window as any).Playground.toPage(980, 440));
    await bc.page.mouse.move(from.x, from.y);
    await bc.page.mouse.down();
    await bc.page.mouse.move(to.x, to.y, { steps: 5 });
    await bc.page.mouse.up();
    const moved = await bc.run(() => {
        // Translation is BC's own: item-wide TranslationX/Y plus per-layer LayerTranslationX/Y records
        const p = ItemColorItem.Property as any;
        if (p.TranslationX === undefined && !p.LayerTranslationX && p.TranslationY === undefined && !p.LayerTranslationY) return null;
        const sum = (axis: string) => (p[`Translation${axis}`] ?? 0) + Object.values<number>(p[`LayerTranslation${axis}`] ?? {}).reduce((a, b) => a + b, 0);
        return [sum("X"), sum("Y")];
    });
    expect(moved).not.toBeNull();
    expect(moved![0]).toBeGreaterThan(0); // dragged right and down
    expect(moved![1]).toBeGreaterThan(0);
});

test("Outfit Collection: the item grid has a Crafted tab with the player's crafted items for the group", async ({ bc }) => {
    await bc.openSettings("Outfit Collection");
    const result = await bc.run(async () => {
        const w = window as any;
        const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
        const $ = (id: string) => document.getElementById("lscg-outfit-edit-" + id) as any;
        w.Player.Crafting = [
            null,
            { Name: "Red Gag", Description: "", Color: "#ff0000", Lock: "", Item: "BallGag", Private: false, Property: "Normal", Effects: {}, Type: null, TypeRecord: null, ItemProperty: null, MemberName: "Tester", MemberNumber: w.Player.MemberNumber, Partial: false },
            { Name: "Wild Gag [chaotic]", Description: "Soaked in a mild sedative", Color: "#00ff00", Lock: "", Item: "BallGag", Private: false, Property: "Normal", Effects: {}, Type: null, TypeRecord: null, ItemProperty: null, MemberName: "Tester", MemberNumber: w.Player.MemberNumber, Partial: false },
        ];
        const out: any = {};
        w.LSCG.getModule("GUI").currentSubscreen.NewOutfit();
        await wait(1200);
        const pick = async (group: string) => { $("item-group").value = group; $("item-group").dispatchEvent(new Event("change")); await wait(300); };

        await pick("ItemArms");
        out.armsCrafted = [$("item-tab-crafted").innerText, $("item-tab-crafted").disabled];
        await pick("ItemMouth");
        out.mouthCrafted = [$("item-tab-crafted").innerText, $("item-tab-crafted").disabled];
        out.startsOnItems = $("item-tab-items").getAttribute("aria-selected");

        $("item-tab-crafted").click();
        await wait(300);
        const cells = [...$("item-cells").querySelectorAll(".lscg-item-cell")];
        out.craftedCells = cells.map(c => c.textContent.trim());
        // Hovering a crafted item explains it: name, base item, description and what LSCG does with its text
        const tip = $("item-tip");
        cells[1].dispatchEvent(new MouseEvent("mouseenter"));
        const cell = cells[1].getBoundingClientRect();
        out.tip = { text: tip.innerText.replace(/\s+/g, " ").trim(), belowCell: tip.getBoundingClientRect().top >= cell.bottom };
        cells[1].dispatchEvent(new MouseEvent("mouseleave"));
        cells[0].click();
        await wait(500);
        const code = $("outfit-input").value;
        const bundle = JSON.parse(w.LZString.decompressFromBase64(code)).find((b: any) => b.Group === "ItemMouth");
        out.worn = [bundle?.Name, bundle?.Craft?.Name, bundle?.Color];
        out.listUntouched = w.Player.Crafting[1].MemberNumber === w.Player.MemberNumber && !("Craft" in w.Player.Crafting[1]);
        return out;
    });
    expect(result).toEqual({
        armsCrafted: ["Crafted (0)", true], mouthCrafted: ["Crafted (2)", false], startsOnItems: "true",
        craftedCells: ["Red Gag", "Wild Gag [chaotic]"],
        tip: { text: "Wild Gag [chaotic] Ball Gag Soaked in a mild sedative LSCG: chaotic, sedative drug", belowCell: true }, worn: ["BallGag", "Red Gag", "#ff0000"], listUntouched: true,
    });
});

test("Outfit Collection: picking a group that already has an item leaves the grid closed until the item box is clicked", async ({ bc }) => {
    await bc.openSettings("Outfit Collection");
    const result = await bc.run(async () => {
        const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
        const $ = (id: string) => document.getElementById("lscg-outfit-edit-" + id) as any;
        const group = async (name: string) => { $("item-group").value = name; $("item-group").dispatchEvent(new Event("change")); await wait(300); };
        const out: any = {};
        (window as any).LSCG.getModule("GUI").currentSubscreen.NewOutfit();
        await wait(1200);

        await group("ItemMouth");
        out.emptyOpens = !$("item-grid").hidden;
        out.emptyLabel = $("item-open").innerText;
        [...$("item-cells").querySelectorAll(".lscg-item-cell")].find((c: any) => c.getAttribute("aria-label") === "Ball Gag").click();
        await wait(500);
        out.closedAfterPick = $("item-grid").hidden;

        await group("ItemMouth");
        out.occupiedStaysClosed = $("item-grid").hidden;
        out.loadedLabel = $("item-open").innerText;
        $("item-open").click();
        out.itemBoxOpens = !$("item-grid").hidden;
        return out;
    });
    expect(result).toEqual({ emptyOpens: true, emptyLabel: "Choose item", closedAfterPick: true, occupiedStaysClosed: true, loadedLabel: "Ball Gag", itemBoxOpens: true });
});

test("Outfit Collection: the lock button opens a lock modal where a lock is chosen and its settings are fields", async ({ bc }) => {
    await bc.openSettings("Outfit Collection");
    const result = await bc.run(async () => {
        const w = window as any;
        const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
        const $ = (id: string) => document.getElementById("lscg-outfit-edit-" + id) as any;
        const bundle = () => JSON.parse(w.LZString.decompressFromBase64($("outfit-input").value)).find((b: any) => b.Group === "ItemMouth")?.Property ?? {};
        const labels = () => [...$("lock-cells").querySelectorAll(".lscg-item-cell")].map((c: any) => c.getAttribute("aria-label"));
        const pick = async (label: string) => {
            const cell = [...$("lock-cells").querySelectorAll(".lscg-item-cell")].find((c: any) => c.getAttribute("aria-label") === label);
            if (!cell) throw new Error(`no "${label}" in: ${labels().join(", ")}`);
            cell.click();
            await wait(500);
        };
        const field = (prop: string) => $("lock-settings-" + prop);
        const type = async (prop: string, value: string) => { field(prop).value = value; field(prop).dispatchEvent(new Event("change")); await wait(500); };
        const out: any = {};

        w.LSCG.getModule("GUI").currentSubscreen.NewOutfit();
        await wait(1200);
        $("item-group").value = "ItemMouth"; $("item-group").dispatchEvent(new Event("change"));
        await wait(300);
        out.disabledWithoutItem = $("item-lock").disabled;
        [...$("item-cells").querySelectorAll(".lscg-item-cell")].find((c: any) => c.getAttribute("aria-label") === "Ball Gag").click();
        await wait(600);

        $("item-lock").click();
        await wait(1200);
        out.opens = { modal: !$("lock-modal").hidden, itemGridClosed: $("item-grid").hidden, title: $("lock-title").innerText };
        out.noRemoveCellYet = !labels().some((l: string) => l.startsWith("No lock"));
        out.noTimerLocks = labels().filter((l: string) => /timer|five minutes/i.test(l)).length === 0;

        await pick("Combination Padlock");
        out.combination = { stillOpen: !$("lock-modal").hidden, saved: [bundle().LockedBy, bundle().CombinationNumber], field: field("CombinationNumber").value };
        await type("CombinationNumber", "12");
        out.badCombination = { invalid: field("CombinationNumber").hasAttribute("aria-invalid"), kept: bundle().CombinationNumber };
        await type("CombinationNumber", "1234");
        out.goodCombination = { saved: bundle().CombinationNumber, field: field("CombinationNumber").value, invalid: field("CombinationNumber").hasAttribute("aria-invalid") };

        await pick("Password Lock");
        await type("Password", "secret");
        await type("Hint", "the usual");
        out.password = [bundle().LockedBy, bundle().Password, bundle().Hint, bundle().CombinationNumber];
        await type("Password", "no spaces 1");
        out.badPassword = { invalid: field("Password").hasAttribute("aria-invalid"), kept: bundle().Password };

        await pick("Metal Padlock");
        out.metal = { lockedBy: bundle().LockedBy, note: $("lock-settings").innerText.trim(), password: bundle().Password };

        await pick("No lock (Take the lock off)");
        out.removed = [bundle().LockedBy, labels().some((l: string) => l.startsWith("No lock"))];

        w.LSCG.getModule("GUI").currentSubscreen.Exit(); // Escape closes the modal before anything else
        out.escape = { modalClosed: $("lock-modal").hidden, editorStillOpen: !!w.LSCG.getModule("GUI").currentSubscreen.SelectedOutfit };
        return out;
    });
    expect(result).toEqual({
        disabledWithoutItem: true,
        opens: { modal: true, itemGridClosed: true, title: "Mouth: Ball Gag" },
        noRemoveCellYet: true, noTimerLocks: true,
        combination: { stillOpen: true, saved: ["CombinationPadlock", "0000"], field: "0000" },
        badCombination: { invalid: true, kept: "0000" },
        goodCombination: { saved: "1234", field: "1234", invalid: false },
        password: ["PasswordPadlock", "SECRET", "the usual", undefined],
        badPassword: { invalid: true, kept: "SECRET" },
        metal: { lockedBy: "MetalPadlock", note: "Metal Padlock has no settings.", password: undefined },
        removed: [undefined, false],
        escape: { modalClosed: true, editorStillOpen: true },
    });
});

test("Magic spell editor: effects are grouped by domain, stack up to their limit, and each copy keeps its own settings", async ({ bc }) => {
    await bc.openSettings("Magic™");
    await bc.page.locator(".lscg-kit-tab", { hasText: "Spells" }).click();
    await bc.page.getByRole("button", { name: "+ New spell" }).click();
    await bc.page.locator(".lscg-kit-edit").first().click();
    const result = await bc.run(async () => {
        const w = window as any;
        const wait = (ms = 150) => new Promise(r => setTimeout(r, ms));
        const slots = () => [...document.querySelectorAll<HTMLSelectElement>(".lscg-spell-effect > .lscg-kit-row select, .lscg-spell-effects > .lscg-kit-row select")];
        const choose = async (index: number, value: string) => {
            const select = slots()[index];
            select.value = value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            await wait();
        };
        const summaries = () => [...document.querySelectorAll(".lscg-spell-effect .lscg-kit-expando-summary")].map(e => e.textContent);
        const power = () => document.querySelector("dialog .lscg-kit-desc[title^='Every effect']")?.textContent;


        const out: any = {};
        out.groups = [...slots()[0].querySelectorAll("optgroup")].map(g => g.label);
        const optionsOf = (i: number) => [...slots()[i].options].map(o => o.value);

        await choose(0, "Damaging");
        out.afterFirst = { slots: slots().length, again: optionsOf(1).includes("Damaging") };
        await choose(1, "Damaging");
        await choose(2, "Blinding");
        out.slots = slots().length;
        out.power = power();
        out.summaries = summaries();

        // The first copy's roll: its tier, the spell's power, and only that copy
        const rollInput = () => document.querySelectorAll<HTMLInputElement>(".lscg-spell-effect input[type=text]")[0];
        rollInput().value = "4d10";
        rollInput().dispatchEvent(new Event("change", { bubbles: true }));
        await wait();
        out.afterRoll = { summaries: summaries(), power: power() };

        const stored = w.Player.LSCG.MagicModule.knownSpells[0];
        out.stored = { effects: stored.Effects, configs: stored.Configs, tier: stored.Tier };
        return out;
    });
    expect(result.groups).toEqual(["Mind", "Senses", "Form", "Binding", "Desire", "Harm", "Fortune", "Warding"]);
    expect(result.afterFirst).toEqual({ slots: 2, again: true }); // Damaging stacks, so it is still offered for the next slot
    expect(result.slots).toBe(3);
    expect(result.summaries[0]).toContain("Damage settings: Force (tier 1)");
    expect(result.power).toBe("Spell power: 4"); // 1 + 1 + 2 (Blinding)
    expect(result.afterRoll.summaries[0]).toContain("Damage settings: Force 4d10 (tier 3)");
    expect(result.afterRoll.summaries[1]).toContain("Damage settings: Force (tier 1)"); // the other copy keeps its own
    expect(result.afterRoll.power).toBe("Spell power: 6");
    expect(result.stored.effects).toEqual(["Damaging", "Damaging", "Blinding"]);
    expect(result.stored.configs[0]).toMatchObject({ Type: "Force", Roll: "4d10" });
    expect(result.stored.tier).toBe(6);
});

test("spell menu: a spell that asks for a command word shows the choices first, then casts with the answer", async ({ bc }) => {
    const result = await bc.run(async () => {
        const w = window as any;
        const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
        w.Player.LSCG.MagicModule.knownSpells = [
            { Name: "Obey", Creator: w.Player.MemberNumber, Effects: ["Commanding"], AllowPotion: false, AllowVoiceCast: false, Configs: [{ Word: "kneel", Ask: true, Allowed: ["kneel", "stay", "cum"] }] },
        ];
        // A client that has the effect says so, or the menu treats it as unsupported
        const target = w.Playground.addCharacter({ lscg: { MagicModule: { enabled: true, knownEffects: ["Commanding"] } } });
        await w.CommonSetScreen("Room", "MainHall");
        await wait(800);
        w.CharacterSetCurrent(target);
        await wait(400);
        const magic = w.LSCG.getModule("MagicModule");
        const cast: any[] = [];
        magic.CastSpellActual = (...args: any[]) => { cast.push(args.slice(2).filter((_: unknown, i: number) => i !== 1)); };
        magic.OpenSpellMenu(target);
        await wait(500);
        const out: any = {};
        (document.querySelector(".lscg-spellmenu-card") as HTMLElement).click();
        await wait(300);
        const choices = () => [...document.querySelectorAll<HTMLElement>(".lscg-spellmenu-choice")];
        out.title = document.querySelector(".lscg-spellmenu-header h2")?.textContent;
        out.choices = choices().map(c => c.textContent);
        out.chosenAtFirst = choices().filter(c => c.classList.contains("lscg-spellmenu-chosen")).map(c => c.textContent);
        choices().find(c => c.textContent === "Stay")!.click();
        await wait(150);
        out.chosenAfter = choices().filter(c => c.classList.contains("lscg-spellmenu-chosen")).map(c => c.textContent);
        out.castBeforeConfirm = cast.length;
        (document.querySelector(".lscg-spellmenu-cast") as HTMLElement).click();
        await wait(200);
        out.cast = cast;
        return out;
    });
    expect(result.title).toBe("Choose how to cast…");
    expect(result.choices).toEqual(["Kneel", "Stay", "Cum"]);
    expect(result.chosenAtFirst).toEqual(["Kneel"]); // the spell's own word
    expect(result.chosenAfter).toEqual(["Stay"]);
    expect(result.castBeforeConfirm).toBe(0);
    expect(result.cast).toEqual([[false, { 0: { word: "stay" } }]]);
});
