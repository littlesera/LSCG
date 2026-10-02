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
