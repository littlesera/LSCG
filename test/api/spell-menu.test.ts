// DOM cast menu: what it shows for each spell (per-effect status chips, disabled cards), search, casting and
// teaching, the paired-target picker, and every way it closes.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CoreModule } from "Modules/core";
import { ConsentModule } from "Modules/consent";
import { ActivityModule } from "Modules/activities";
import { ItemUseModule } from "Modules/item-use";
import { CollarModule } from "Modules/collar";
import { InjectorModule } from "Modules/injector";
import { MagicModule } from "Modules/magic";
import { StateModule } from "Modules/states";
import { LSCGSpellEffect, type SpellDefinition, type SpellEffectId } from "Settings/Models/magic";
import { registerExtension, type ModApiHandle } from "api/extensions";
import { boot, resetWorld, player, addToRoom } from "../harness/world";
import { makeCharacter, type FixtureCharacter } from "../harness/fixtures";

describe("DOM spell menu", () => {
    let magic: MagicModule;
    let alice: FixtureCharacter;
    let bob: FixtureCharacter;
    let api: ModApiHandle;
    let cast: ReturnType<typeof vi.spyOn>;
    let ids = 0;

    beforeAll(() => {
        [, , , , , , magic] = boot(new CoreModule(), new ConsentModule(), new ActivityModule(), new ItemUseModule(),
            new CollarModule(), new InjectorModule(), new MagicModule(), new StateModule());
    });

    beforeEach(() => {
        resetWorld({
            MemberNumber: 1, Nickname: "Sera", WhiteList: [], BlackList: [],
            LSCG: { GlobalModule: { enabled: true }, MiscModule: { chokeChainEnabled: false, gagChokeEnabled: false } },
        });
        // The overlay host positions itself against the game canvas and reads its font (resetWorld replaces both).
        const g = globalThis as any;
        g.MainCanvas = Object.assign(g.MainCanvas ?? {}, { canvas: document.createElement("canvas") });
        g.CommonGetFontName = () => "arial";
        magic.init();
        addToRoom(player());
        alice = addToRoom(makeCharacter({ MemberNumber: 2, Nickname: "Alice", LSCG: { MagicModule: { enabled: true, blockedSpellEffects: [], bypassForSelfEffects: [] } } }));
        bob = addToRoom(makeCharacter({ MemberNumber: 3, Nickname: "Bob", LSCG: { MagicModule: { enabled: true } } }));
        magic.settings.enabled = true;
        magic.settings.knownSpells = [];
        // The real DialogMenuMapping.dialog isn't part of the harness; the menu only needs it to exist.
        (globalThis as any).DialogMenuMapping.dialog = { Load: vi.fn(), Unload: vi.fn() };
        (globalThis as any).CurrentCharacter = alice;
        (globalThis as any).CurrentScreen = "ChatRoom";
        magic.TeachingSpell = false;
        magic.SpellPairOption.SelectOpen = false;
        api = registerExtension({ id: `menu-${++ids}`, name: "Menu Pack", version: "1" });
        cast = vi.spyOn(magic, "CastSpellActual").mockImplementation(() => {});
    });

    afterEach(() => {
        magic.CloseSpellMenu();
        cast.mockRestore();
        api.dispose();
        document.body.replaceChildren();
        (globalThis as any).CurrentCharacter = undefined;
    });

    function spell(name: string, effects: SpellEffectId[]): SpellDefinition {
        return { Name: name, Creator: 1, Effects: effects, AllowPotion: false, AllowVoiceCast: false };
    }
    const menu = () => document.getElementById("lscg-spell-menu");
    const cards = () => Array.from(menu()!.querySelectorAll("button.lscg-spellmenu-card")) as HTMLButtonElement[];
    const card = (name: string) => cards().find(c => c.querySelector(".lscg-spellmenu-name")?.textContent === name)!;
    const chips = (c: HTMLElement) => Array.from(c.querySelectorAll(".lscg-kit-chip")).map(x => x.textContent);
    const typeSearch = (text: string) => {
        const input = menu()!.querySelector("input[type=search]") as HTMLInputElement;
        input.value = text;
        input.dispatchEvent(new Event("input"));
    };

    describe("opening and closing", () => {
        it("mounts when opened, with one card per known spell and the search box focused", () => {
            magic.settings.knownSpells = [spell("one", [LSCGSpellEffect.blindness]), spell("two", [LSCGSpellEffect.deafened])];
            magic.OpenSpellMenu(alice as never);
            expect(magic.SpellMenuOpen).toBe(true);
            expect(menu()).not.toBeNull();
            expect(menu()!.querySelector("h2")!.textContent).toBe("Select a spell to cast…");
            expect(cards().map(c => c.querySelector(".lscg-spellmenu-name")!.textContent)).toEqual(["one", "two"]);
            expect(document.activeElement).toBe(menu()!.querySelector("input[type=search]"));
        });

        it("says so when no spells are known", () => {
            magic.OpenSpellMenu(alice as never);
            expect(menu()!.textContent).toContain("No spells known");
        });

        it("teaching changes the title", () => {
            magic.TeachSpell(alice as never);
            expect(menu()!.querySelector("h2")!.textContent).toBe("Select a spell to teach…");
        });

        it.each([
            ["the close button", () => (menu()!.querySelector(".lscg-spellmenu-close") as HTMLButtonElement).click()],
            ["Escape", () => menu()!.querySelector(".lscg-spellmenu-box")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))],
            ["a click outside the menu", () => magic.ClickSpellMenu()],
            ["a safeword", () => magic.safeword()],
            ["unloading the module", () => magic.unload()],
        ])("closes on %s", (_name, act) => {
            magic.settings.knownSpells = [spell("one", [LSCGSpellEffect.blindness])];
            magic.OpenSpellMenu(alice as never);
            act();
            expect(menu()).toBeNull();
            expect(magic.SpellMenuOpen).toBe(false);
        });

        it("closing leaves the pair picker and teaching mode behind", () => {
            magic.TeachSpell(alice as never);
            magic.SpellPairOption.SelectOpen = true;
            magic.CloseSpellMenu();
            expect(magic.TeachingSpell).toBe(false);
            expect(magic.SpellPairOption.SelectOpen).toBe(false);
        });

        it("closes when the target goes away", () => {
            magic.settings.knownSpells = [spell("one", [LSCGSpellEffect.blindness])];
            magic.OpenSpellMenu(alice as never);
            (globalThis as any).CurrentCharacter = undefined;
            magic.DrawSpellMenu();
            expect(menu()).toBeNull();
        });

        it("closing when it isn't open doesn't blur whatever else has focus", () => {
            const chat = document.createElement("input");
            document.body.append(chat);
            chat.focus();
            const blur = vi.fn();
            chat.addEventListener("blur", blur);
            magic.CloseSpellMenu();
            expect(blur).not.toHaveBeenCalled();
        });
    });

    describe("spell cards", () => {
        it("show each effect as a chip, marking blocked and unsupported ones", () => {
            const bark = api.spells.registerEffect({ name: "bark", label: "Barking", description: "Woof.", apply: () => {} });
            const barkId = `${api.id}.bark` as SpellEffectId;
            alice.LSCG.MagicModule.blockedSpellEffects = [LSCGSpellEffect.deafened];
            magic.settings.knownSpells = [spell("mixed", [LSCGSpellEffect.blindness, LSCGSpellEffect.deafened, barkId])];
            magic.OpenSpellMenu(alice as never);

            expect(chips(card("mixed"))).toEqual(["Blinding", "Deafening (blocked)", "Barking (unsupported)"]);
            expect(card("mixed").disabled).toBe(false); // still castable: Blinding applies
            const barkChip = card("mixed").querySelectorAll(".lscg-kit-chip")[2] as HTMLElement;
            expect(barkChip.title).toContain("Woof.");
            expect(barkChip.title).toContain("doesn't have this effect");
            bark();
        });

        it("a spell none of whose effects would apply is disabled and says why", () => {
            alice.LSCG.MagicModule.blockedSpellEffects = [LSCGSpellEffect.blindness];
            magic.settings.knownSpells = [spell("useless", [LSCGSpellEffect.blindness])];
            magic.OpenSpellMenu(alice as never);
            const c = card("useless");
            expect(c.disabled).toBe(true);
            expect(c.title).toContain("None of this spell's effects would affect Alice");
            c.click();
            expect(cast).not.toHaveBeenCalled();
        });

        it("marks paired spells", () => {
            magic.settings.knownSpells = [spell("link", [LSCGSpellEffect.paired_arousal])];
            magic.OpenSpellMenu(alice as never);
            expect(chips(card("link"))).toContain("paired");
        });

        it("picks up an extension effect once the target advertises it, without reopening", () => {
            api.spells.registerEffect({ name: "bark", label: "Barking", description: "", apply: () => {} });
            const barkId = `${api.id}.bark` as SpellEffectId;
            magic.settings.knownSpells = [spell("woof", [barkId])];
            magic.OpenSpellMenu(alice as never);
            expect(card("woof").disabled).toBe(true);

            alice.LSCG.MagicModule.knownEffects = [barkId];
            magic.spellMenu.refreshStatus();
            expect(card("woof").disabled).toBe(false);
            expect(chips(card("woof"))).toEqual(["Barking"]);
        });
    });

    describe("search", () => {
        beforeEach(() => {
            magic.settings.knownSpells = [spell("Fireball", [LSCGSpellEffect.horny]), spell("Mute", [LSCGSpellEffect.muted]), spell("Sleepy", [LSCGSpellEffect.slumber])];
            magic.OpenSpellMenu(alice as never);
        });

        it("filters by spell name as you type, ignoring case", () => {
            typeSearch("fire");
            expect(cards().map(c => c.querySelector(".lscg-spellmenu-name")!.textContent)).toEqual(["Fireball"]);
        });

        it("filters by effect name", () => {
            typeSearch("gagged");
            expect(cards().map(c => c.querySelector(".lscg-spellmenu-name")!.textContent)).toEqual(["Mute"]);
        });

        it("says so when nothing matches, and clearing the search brings the spells back", () => {
            typeSearch("zzz");
            expect(cards()).toHaveLength(0);
            expect(menu()!.textContent).toContain("No spells match.");
            typeSearch("");
            expect(cards()).toHaveLength(3);
        });
    });

    describe("casting", () => {
        it("casts the picked spell at the target, using a copy of the stored spell", () => {
            const stored = spell("blind", [LSCGSpellEffect.blindness]);
            magic.settings.knownSpells = [stored];
            magic.OpenSpellMenu(alice as never);
            card("blind").click();
            expect(cast).toHaveBeenCalledOnce();
            const [castSpell, target, voice] = cast.mock.calls[0];
            expect(castSpell).toEqual(stored);
            expect(castSpell).not.toBe(stored);
            expect(target).toBe(alice);
            expect(voice).toBe(false);
        });

        it("teaching hands the spell to the teach flow instead of casting", () => {
            magic.settings.knownSpells = [spell("blind", [LSCGSpellEffect.blindness])];
            const teach = vi.spyOn(magic, "TeachSpellActual").mockImplementation(() => {});
            magic.TeachSpell(alice as never);
            card("blind").click();
            expect(teach).toHaveBeenCalledOnce();
            expect(cast).not.toHaveBeenCalled();
            teach.mockRestore();
        });
    });

    describe("paired spells", () => {
        beforeEach(() => {
            magic.settings.knownSpells = [spell("link", [LSCGSpellEffect.paired_arousal])];
            magic.OpenSpellMenu(alice as never);
            typeSearch("link");
            card("link").click();
        });

        it("switches to a picker of everyone else who can be paired, not the target", () => {
            expect(menu()!.querySelector("h2")!.textContent).toBe("Select a paired target…");
            expect(menu()!.querySelector("input[type=search]")).toBeNull();
            const names = Array.from(menu()!.querySelectorAll(".lscg-spellmenu-person")).map(b => b.textContent);
            expect(names).toContain("Bob");
            expect(names).not.toContain("Alice");
            expect(cast).not.toHaveBeenCalled();
        });

        it("casts with the chosen second target", () => {
            const bobButton = Array.from(menu()!.querySelectorAll(".lscg-spellmenu-person")).find(b => b.textContent === "Bob") as HTMLButtonElement;
            bobButton.click();
            expect(cast).toHaveBeenCalledOnce();
            const [castSpell, target, voice, paired] = cast.mock.calls[0];
            expect(castSpell.Name).toBe("link");
            expect(target).toBe(alice);
            expect(voice).toBe(false);
            expect(paired).toBe(bob);
        });

        it("Back returns to the spell list, keeping what was typed in the search", () => {
            (menu()!.querySelector(".lscg-spellmenu-back") as HTMLButtonElement).click();
            expect(magic.SpellPairOption.SelectOpen).toBe(false);
            expect(menu()!.querySelector("h2")!.textContent).toBe("Select a spell to cast…");
            expect((menu()!.querySelector("input[type=search]") as HTMLInputElement).value).toBe("link");
            expect(cards()).toHaveLength(1);
        });
    });

    it("explains when nobody else can be paired", () => {
        (globalThis as any).ChatRoomCharacter = [alice];
        magic.settings.knownSpells = [spell("link", [LSCGSpellEffect.paired_arousal])];
        magic.OpenSpellMenu(alice as never);
        card("link").click();
        expect(menu()!.textContent).toContain("No one else in the room can be paired.");
        expect(menu()!.querySelector(".lscg-spellmenu-back")).not.toBeNull();
    });
});
