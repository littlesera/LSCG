import { h } from "tsx-dom";
import type { MagicModule } from "Modules/magic";
import { DomOverlayHost } from "Dom/host";
import { CardGrid, Chip, ChipTone, KitContext, Notice, SearchBox } from "Dom/kit";
import type { SpellDefinition } from "Settings/Models/magic";
import { effectDescription, effectLabel, effectTooltip, isExtensionEffect, spellHasPairedEffect } from "./spellEffects";
import menuStyles from "./spellMenu.scss?inline";

/** Where the menu sits on the 2000x1000 canvas; the canvas fills the same rectangle (see MagicModule.DrawSpellMenu). */
export const SPELL_MENU_SHAPE: RectTuple = [500, 100, 1000, 850];

type EffectStatus = "ok" | "blocked" | "unsupported";

const STATUS_TONE: Record<EffectStatus, ChipTone> = { ok: "muted", blocked: "blocked", unsupported: "warn" };
const STATUS_SUFFIX: Record<EffectStatus, string> = { ok: "", blocked: " (blocked)", unsupported: " (unsupported)" };

/** The DOM spell menu: pick a spell to cast (or teach), then, for paired spells, a second target.
 *  The module owns the game-side state (which spell, which target); this only draws it and forwards clicks. */
export class SpellMenuView {
    private _host: DomOverlayHost;
    private _ctx: KitContext | undefined;
    private _search = "";

    constructor(private magic: MagicModule) {
        this._host = new DomOverlayHost("lscg-spell-menu", SPELL_MENU_SHAPE, () => this.build(), { className: "lscg-screen lscg-kit lscg-spellmenu" });
    }

    get mounted(): boolean {
        return this._host.mounted;
    }

    open(): void {
        this._search = "";
        this._host.mount();
        // So typing filters straight away and Escape closes.
        (this._host.root?.querySelector("input[type=search]") as HTMLInputElement | null)?.focus();
    }

    close(): void {
        if (!this._host.mounted) return; // unmounting blurs the focused element; don't do that when there's nothing to close
        this._host.unmount();
        this._ctx = undefined;
    }

    /** Switches between the spell list and the paired-target picker (rebuilds the view). */
    refreshView(): void {
        if (this.mounted) this._host.remount();
    }

    /** Re-evaluates what each spell can do, e.g. when the target's settings change while the menu is open. */
    refreshStatus(): void {
        this._ctx?.refresh();
    }

    private build(): Node[] {
        const magic = this.magic;
        const picking = magic.SpellPairOption.SelectOpen;
        const ctx = this._ctx = new KitContext();
        const title = picking ? "Select a paired target…" : magic.TeachingSpell ? "Select a spell to teach…" : "Select a spell to cast…";

        const search = picking ? null : SearchBox(text => { this._search = text; ctx.refresh(); }, { value: this._search, placeholder: "Search spells…" });
        const close = <button type="button" class="lscg-button lscg-spellmenu-close" title="Cancel" aria-label="Cancel" onClick={() => magic.CloseSpellMenu()}>✕</button>;
        const header = <div class={search ? "lscg-spellmenu-header" : "lscg-spellmenu-header lscg-spellmenu-header-nosearch"}>
            <h2>{title}</h2>
            {search}
            {close}
        </div>;

        const box = <div class="lscg-spellmenu-box" onKeyDown={(e: KeyboardEvent) => { if (e.key === "Escape") magic.CloseSpellMenu(); }}>
            {header}
            {picking ? this.buildPairPicker() : this.buildSpellGrid(ctx)}
        </div> as HTMLElement;

        const style = document.createElement("style");
        style.textContent = menuStyles;
        return [style, box];
    }

    private buildSpellGrid(ctx: KitContext): HTMLElement {
        const magic = this.magic;
        const matches = (spell: SpellDefinition) => {
            const text = this._search.trim().toLowerCase();
            return !text || spell.Name.toLowerCase().includes(text) || spell.Effects.some(e => effectLabel(e).toLowerCase().includes(text));
        };
        return CardGrid(ctx, {
            items: () => magic.AvailableSpells.filter(matches),
            render: spell => this.buildCard(spell),
            empty: magic.AvailableSpells.length === 0 ? "No spells known…" : "No spells match.",
        });
    }

    private buildCard(spell: SpellDefinition): HTMLElement {
        const target = CurrentCharacter;
        if (!target) return <span /> as HTMLElement;
        const status = this.magic.GetSpellStatus(spell, target);
        const name = target.IsPlayer() ? "you" : CharacterNickname(target);
        const reason = (s: EffectStatus) => s === "blocked" ? `${target.IsPlayer() ? "You have" : `${CharacterNickname(target)} has`} blocked this effect.`
            : s === "unsupported" ? `${target.IsPlayer() ? "Your" : `${CharacterNickname(target)}'s`} client doesn't have this effect.` : "";
        const chips = status.effects.map(e => Chip(effectLabel(e.id) + STATUS_SUFFIX[e.status], {
            icon: isExtensionEffect(e.id) ? "extension" : undefined,
            tone: STATUS_TONE[e.status],
            tooltip: [effectTooltip(e.id), reason(e.status)].filter(t => !!t).join("\n"),
        }));
        if (spellHasPairedEffect(spell))
            chips.push(Chip("paired", { tone: "info", tooltip: "Needs a second target." }));

        const card = <button type="button" disabled={!status.castable}
            class={status.castable ? "lscg-button lscg-spellmenu-card" : "lscg-button lscg-spellmenu-card lscg-spellmenu-card-disabled"}
            title={status.castable ? "" : `None of this spell's effects would affect ${name}.`}
            onClick={() => this.magic.ChooseSpell(spell)}>
            <b class="lscg-spellmenu-name">{spell.Name}</b>
            <span class="lscg-kit-chips">{chips.length > 0 ? chips : <small class="lscg-kit-desc">No effects</small>}</span>
        </button> as HTMLElement;
        return card;
    }

    private buildPairPicker(): HTMLElement {
        const magic = this.magic;
        const pair = magic.SpellPairOption;
        const people = magic.PairedCharacterOptions(pair.Source);
        const back = <button type="button" class="lscg-button lscg-spellmenu-back" onClick={() => {
            pair.SelectOpen = false;
            this.refreshView();
        }}>← Back</button>;
        return <div class="lscg-spellmenu-pick scroll-box">
            {people.length === 0
                ? Notice("No one else in the room can be paired.")
                : <div class="lscg-spellmenu-people">
                    {people.map(char => <button type="button" class="lscg-button lscg-spellmenu-person" onClick={() => {
                        if (!!pair.Source) magic.CastSpellActual(pair.Spell, pair.Source, false, char);
                    }}>{CharacterNickname(char)}</button>)}
                </div>}
            {back}
        </div> as HTMLElement;
    }
}
